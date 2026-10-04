-- Commerce : produits, droits d'accès et consultations.
--
-- `entitlements` est la seule source de vérité sur « qui a accès à quoi ». Elle est
-- alimentée uniquement côté serveur (rôle service_role) par les webhooks RevenueCat
-- (achats dans l'app), Stripe (achats sur ayurmonie) et cal.eu (réservations),
-- ou par l'admin.

create type public.product_kind as enum ('program', 'subscription');
create type public.entitlement_source as enum ('revenuecat', 'stripe', 'admin');
create type public.consultation_mode as enum ('video', 'in_person');
create type public.consultation_status as enum ('booked', 'cancelled', 'completed', 'no_show');

-- ---------------------------------------------------------------------------
-- Produits
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  kind public.product_kind not null,
  program_id uuid references public.programs (id) on delete restrict,
  title public.localized_text not null,
  -- Identifiant du produit déclaré dans App Store Connect / Google Play, via RevenueCat.
  store_product_id text unique,
  -- Prix Stripe utilisé sur le site ayurmonie.
  stripe_price_id text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'program') = (program_id is not null))
);

create index products_program_idx on public.products (program_id);

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Droits d'accès
-- ---------------------------------------------------------------------------

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  -- Nul tant que l'acheteur du site n'a pas créé son compte : il est rattaché par email.
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null,
  product_id uuid not null references public.products (id) on delete restrict,
  source public.entitlement_source not null,
  -- Identifiant chez la source (transaction RevenueCat, session Stripe…), pour l'idempotence.
  source_ref text not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_ref),
  check (expires_at is null or expires_at > starts_at)
);

create index entitlements_user_idx on public.entitlements (user_id);
create index entitlements_unclaimed_email_idx on public.entitlements (lower(email))
  where user_id is null;
create index entitlements_product_idx on public.entitlements (product_id);

create trigger entitlements_set_updated_at before update on public.entitlements
  for each row execute function public.set_updated_at();

-- Rattache un droit au compte dont l'email correspond, s'il existe déjà.
create function public.link_entitlement_to_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    select id into new.user_id from public.profiles where lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

create trigger entitlements_link_user
  before insert or update of email on public.entitlements
  for each row execute function public.link_entitlement_to_user();

-- À l'inscription, récupère les achats faits sur le site avec le même email.
create function public.claim_entitlements_for_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.entitlements
  set user_id = new.id
  where user_id is null and lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger profiles_claim_entitlements
  after insert or update of email on public.profiles
  for each row execute function public.claim_entitlements_for_profile();

-- Vrai si l'utilisateur connecté peut suivre ce programme : programme gratuit,
-- achat du programme, abonnement en cours, ou administrateur.
create function public.has_program_access(target_program uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.programs p
      where p.id = target_program
        and p.status = 'published'
        and (
          p.is_free
          or exists (
            select 1
            from public.entitlements e
            join public.products pr on pr.id = e.product_id
            where e.user_id = (select auth.uid())
              and e.revoked_at is null
              and e.starts_at <= now()
              and (e.expires_at is null or e.expires_at > now())
              and (pr.kind = 'subscription' or pr.program_id = p.id)
          )
        )
    );
$$;

revoke execute on function public.has_program_access(uuid) from public, anon;
grant execute on function public.has_program_access(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Consultations (réservées via cal.eu)
-- ---------------------------------------------------------------------------

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  cal_booking_uid text not null unique,
  mode public.consultation_mode not null,
  status public.consultation_status not null default 'booked',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index consultations_user_idx on public.consultations (user_id, starts_at desc);

create trigger consultations_set_updated_at before update on public.consultations
  for each row execute function public.set_updated_at();

-- Rattache la réservation au compte dont l'email correspond.
create function public.link_consultation_to_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    select id into new.user_id from public.profiles where lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

create trigger consultations_link_user
  before insert or update of email on public.consultations
  for each row execute function public.link_consultation_to_user();

-- Compte rendu rédigé par Anaïs après la séance. Table séparée pour que le client
-- ne le voie qu'une fois partagé (la RLS filtre des lignes, pas des colonnes).
create table public.consultation_reports (
  consultation_id uuid primary key references public.consultations (id) on delete cascade,
  body text not null,
  shared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger consultation_reports_set_updated_at before update on public.consultation_reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sécurité
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.entitlements enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_reports enable row level security;

create policy "Tout le monde voit les produits actifs" on public.products
  for select to anon, authenticated using (is_active);
create policy "L'admin gère les produits" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Chacun voit ses droits, l'admin voit tout" on public.entitlements
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "L'admin gère les droits" on public.entitlements
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Chacun voit ses consultations, l'admin voit tout" on public.consultations
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "L'admin gère les consultations" on public.consultations
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Chacun voit ses comptes rendus partagés, l'admin voit tout"
  on public.consultation_reports
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      shared_at is not null
      and exists (
        select 1 from public.consultations c
        where c.id = consultation_id and c.user_id = (select auth.uid())
      )
    )
  );
create policy "L'admin gère les comptes rendus" on public.consultation_reports
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.products to anon;
grant select, insert, update, delete on
  public.products, public.entitlements, public.consultations, public.consultation_reports
  to authenticated;
grant all on
  public.products, public.entitlements, public.consultations, public.consultation_reports
  to service_role;

-- ---------------------------------------------------------------------------
-- Accès au contenu des programmes (dépend des droits ci-dessus)
-- ---------------------------------------------------------------------------

create policy "Les jours sont visibles avec un accès au programme" on public.program_days
  for select to authenticated using (public.has_program_access(program_id));

create policy "Les pratiques sont visibles avec un accès au programme" on public.practices
  for select to authenticated
  using (exists (
    select 1 from public.program_days d
    where d.id = program_day_id and public.has_program_access(d.program_id)
  ));

create policy "Les liens jour-contenu suivent l'accès au programme"
  on public.program_day_contents
  for select to authenticated
  using (exists (
    select 1 from public.program_days d
    where d.id = program_day_id and public.has_program_access(d.program_id)
  ));

create policy "Les contenus publiés gratuits ou accessibles sont visibles"
  on public.contents
  for select to authenticated
  using (
    status = 'published'
    and (
      is_free
      or exists (
        select 1
        from public.program_day_contents pdc
        join public.program_days d on d.id = pdc.program_day_id
        where pdc.content_id = contents.id and public.has_program_access(d.program_id)
      )
    )
  );
