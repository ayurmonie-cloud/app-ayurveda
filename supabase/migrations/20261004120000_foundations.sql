-- Fondations : types communs, profils, rôles et consentements.
--
-- Conventions du schéma :
--   * toutes les tables de `public` ont la Row Level Security activée, sans exception ;
--   * les droits sont accordés explicitement aux rôles `anon`, `authenticated` et `service_role` :
--     on retire d'abord les droits que Supabase accorde par défaut sur tout nouvel objet ;
--   * les fonctions `security definer` fixent `search_path = ''` et qualifient chaque objet ;
--   * les politiques appellent `(select auth.uid())` pour que Postgres l'évalue une seule fois.

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Types communs
-- ---------------------------------------------------------------------------

create type public.app_locale as enum ('fr', 'en', 'es');
create type public.app_role as enum ('user', 'admin');
create type public.dosha as enum ('vata', 'pitta', 'kapha');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.consent_kind as enum ('health_tracking', 'ai_processing', 'journal_sharing');

-- Texte traduit : {"fr": "...", "en": "...", "es": "..."}. Le français est obligatoire,
-- c'est la langue dans laquelle Anaïs saisit ses contenus.
create domain public.localized_text as jsonb
  check (
    jsonb_typeof(value) = 'object'
    and value ? 'fr'
    and (value - array['fr', 'en', 'es']) = '{}'::jsonb
    and jsonb_typeof(value -> 'fr') = 'string'
    and length(trim(value ->> 'fr')) > 0
  );

-- Met à jour la colonne `updated_at` à chaque modification.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text check (char_length(display_name) <= 80),
  locale public.app_locale not null default 'fr',
  timezone text not null default 'Europe/Paris',
  role public.app_role not null default 'user',
  dosha public.dosha,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Un profil par compte, créé automatiquement à l''inscription.';
comment on column public.profiles.role is 'Seul un administrateur peut changer un rôle.';
comment on column public.profiles.dosha is 'Dosha dominant, issu du dernier test de dosha.';

create unique index profiles_email_key on public.profiles (lower(email));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Vrai si l'utilisateur connecté est administrateur. `security definer` pour lire
-- `profiles` sans repasser par ses propres politiques (évite la récursion).
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Crée le profil lors de l'inscription, avec la langue choisie dans l'app si elle est fournie.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_locale text := new.raw_user_meta_data ->> 'locale';
begin
  insert into public.profiles (id, email, display_name, locale)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    case
      when requested_locale in ('fr', 'en', 'es') then requested_locale::public.app_locale
      else 'fr'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garde l'email du profil synchronisé avec celui du compte.
create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

alter table public.profiles enable row level security;

create policy "Chacun lit son profil, l'admin lit tous les profils"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Chacun modifie son profil, l'admin modifie tous les profils"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Un utilisateur ne peut modifier que ses préférences ; le rôle, l'email et le dosha
-- sont protégés au niveau des colonnes.
grant select on public.profiles to authenticated;
grant update (display_name, locale, timezone) on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- L'admin peut aussi changer le rôle : on passe par une fonction dédiée plutôt que
-- d'ouvrir la colonne à tous.
create function public.set_user_role(target_user uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;
  update public.profiles set role = new_role where id = target_user;
end;
$$;

revoke execute on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

-- ---------------------------------------------------------------------------
-- Consentements (RGPD)
-- ---------------------------------------------------------------------------

-- Journal append-only : chaque accord ou retrait est une nouvelle ligne, ce qui
-- garde la preuve du consentement. L'état courant est la ligne la plus récente.
create table public.consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.consent_kind not null,
  granted boolean not null,
  policy_version text not null default '1',
  created_at timestamptz not null default now()
);

create index consent_events_user_kind_idx
  on public.consent_events (user_id, kind, created_at desc);

alter table public.consent_events enable row level security;

create policy "Chacun lit ses consentements, l'admin lit tout"
  on public.consent_events for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Chacun enregistre ses propres consentements"
  on public.consent_events for insert
  to authenticated
  with check (user_id = (select auth.uid()));

grant select, insert on public.consent_events to authenticated;
grant all on public.consent_events to service_role;

-- Vrai si `target_user` a donné ce consentement et ne l'a pas retiré depuis.
-- Seuls l'utilisateur concerné, l'admin et les fonctions serveur obtiennent une réponse.
create function public.has_consent(target_user uuid, consent public.consent_kind)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select granted
      from public.consent_events
      where user_id = target_user and kind = consent
        and (
          target_user = (select auth.uid())
          or (select auth.role()) = 'service_role'
          or public.is_admin()
        )
      order by created_at desc, id desc
      limit 1
    ),
    false
  );
$$;

revoke execute on function public.has_consent(uuid, public.consent_kind) from public, anon;
grant execute on function public.has_consent(uuid, public.consent_kind) to authenticated, service_role;
