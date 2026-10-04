-- Suivi : inscriptions aux programmes, check-ins, pratiques cochées, carnet,
-- notation et résultats de quiz.
--
-- Ce sont des données de santé au sens du RGPD : leur écriture exige le consentement
-- « health_tracking », et l'admin ne lit le carnet et les check-ins d'un client que
-- s'il a consenti au partage (« journal_sharing »).
--
-- Les identifiants sont générés sur l'appareil (uuid) pour permettre la saisie hors
-- connexion puis une synchronisation idempotente (upsert).

create type public.enrollment_status as enum ('active', 'paused', 'completed', 'abandoned');

-- ---------------------------------------------------------------------------
-- Inscriptions
-- ---------------------------------------------------------------------------

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete restrict,
  started_on date not null default current_date,
  status public.enrollment_status not null default 'active',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un seul parcours actif par programme et par utilisateur.
create unique index enrollments_one_active_idx on public.enrollments (user_id, program_id)
  where status = 'active';
create index enrollments_program_idx on public.enrollments (program_id);

-- ---------------------------------------------------------------------------
-- Check-in quotidien
-- ---------------------------------------------------------------------------

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  energy smallint not null check (energy between 1 and 5),
  sleep smallint not null check (sleep between 1 and 5),
  digestion smallint not null check (digestion between 1 and 5),
  mood smallint not null check (mood between 1 and 5),
  stress smallint not null check (stress between 1 and 5),
  note text check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------------------------------------------------------------------------
-- Pratiques cochées
-- ---------------------------------------------------------------------------

create table public.practice_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  practice_id uuid not null references public.practices (id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (enrollment_id, practice_id, completed_on)
);

create index practice_completions_user_idx on public.practice_completions (user_id, completed_on desc);
create index practice_completions_practice_idx on public.practice_completions (practice_id);

-- ---------------------------------------------------------------------------
-- Carnet de suivi
-- ---------------------------------------------------------------------------

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null default current_date,
  body text check (char_length(body) <= 10000),
  -- Chemins dans le bucket privé journal-photos, sous le dossier de l'utilisateur.
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (body is not null or cardinality(photo_paths) > 0)
);

create index journal_entries_user_idx on public.journal_entries (user_id, entry_date desc);

-- ---------------------------------------------------------------------------
-- Notation et feedback
-- ---------------------------------------------------------------------------

-- Une note porte sur exactement un élément : un programme, un jour, une pratique ou un contenu.
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  program_id uuid references public.programs (id) on delete cascade,
  program_day_id uuid references public.program_days (id) on delete cascade,
  practice_id uuid references public.practices (id) on delete cascade,
  content_id uuid references public.contents (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(program_id, program_day_id, practice_id, content_id) = 1)
);

create unique index ratings_user_program_idx on public.ratings (user_id, program_id)
  where program_id is not null;
create unique index ratings_user_day_idx on public.ratings (user_id, program_day_id)
  where program_day_id is not null;
create unique index ratings_user_practice_idx on public.ratings (user_id, practice_id)
  where practice_id is not null;
create unique index ratings_user_content_idx on public.ratings (user_id, content_id)
  where content_id is not null;
create index ratings_program_idx on public.ratings (program_id);
create index ratings_program_day_idx on public.ratings (program_day_id);
create index ratings_practice_idx on public.ratings (practice_id);
create index ratings_content_idx on public.ratings (content_id);

-- ---------------------------------------------------------------------------
-- Résultats de quiz
-- ---------------------------------------------------------------------------

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  -- Identifiants des réponses choisies (quiz_options.id).
  selected_option_ids uuid[] not null,
  -- Résultat calculé : scores par dosha, ou nombre de bonnes réponses.
  result jsonb not null default '{}'::jsonb,
  -- Test de dosha : dosha dominant retenu.
  dosha public.dosha,
  created_at timestamptz not null default now()
);

create index quiz_attempts_user_idx on public.quiz_attempts (user_id, created_at desc);
create index quiz_attempts_quiz_idx on public.quiz_attempts (quiz_id);

-- Le dernier test de dosha met à jour le profil.
create function public.apply_dosha_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.dosha is not null and exists (
    select 1 from public.quizzes where id = new.quiz_id and kind = 'dosha'
  ) then
    update public.profiles set dosha = new.dosha where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger quiz_attempts_apply_dosha
  after insert on public.quiz_attempts
  for each row execute function public.apply_dosha_result();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create trigger enrollments_set_updated_at before update on public.enrollments
  for each row execute function public.set_updated_at();
create trigger check_ins_set_updated_at before update on public.check_ins
  for each row execute function public.set_updated_at();
create trigger journal_entries_set_updated_at before update on public.journal_entries
  for each row execute function public.set_updated_at();
create trigger ratings_set_updated_at before update on public.ratings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sécurité
-- ---------------------------------------------------------------------------

alter table public.enrollments enable row level security;
alter table public.check_ins enable row level security;
alter table public.practice_completions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.ratings enable row level security;
alter table public.quiz_attempts enable row level security;

-- Inscriptions : uniquement à un programme accessible.
create policy "Chacun voit ses inscriptions, l'admin voit tout" on public.enrollments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Chacun s'inscrit à un programme accessible" on public.enrollments
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.has_program_access(program_id));
create policy "Chacun gère ses inscriptions" on public.enrollments
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Check-ins : données de santé.
create policy "Chacun voit ses check-ins, l'admin si le suivi est partagé" on public.check_ins
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or ((select public.is_admin()) and public.has_consent(user_id, 'journal_sharing'))
  );
create policy "Chacun saisit ses check-ins avec consentement" on public.check_ins
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.has_consent((select auth.uid()), 'health_tracking')
  );
create policy "Chacun corrige ses check-ins avec consentement" on public.check_ins
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.has_consent((select auth.uid()), 'health_tracking')
  );
create policy "Chacun supprime ses check-ins" on public.check_ins
  for delete to authenticated using (user_id = (select auth.uid()));

-- Pratiques cochées : l'admin voit l'assiduité (pas de donnée de santé).
create policy "Chacun voit ses pratiques, l'admin voit tout" on public.practice_completions
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Chacun coche ses pratiques" on public.practice_completions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.user_id = (select auth.uid())
    )
  );
create policy "Chacun décoche ses pratiques" on public.practice_completions
  for delete to authenticated using (user_id = (select auth.uid()));

-- Carnet : données de santé.
create policy "Chacun voit son carnet, l'admin s'il est partagé" on public.journal_entries
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or ((select public.is_admin()) and public.has_consent(user_id, 'journal_sharing'))
  );
create policy "Chacun écrit dans son carnet avec consentement" on public.journal_entries
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.has_consent((select auth.uid()), 'health_tracking')
  );
create policy "Chacun modifie son carnet avec consentement" on public.journal_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.has_consent((select auth.uid()), 'health_tracking')
  );
create policy "Chacun supprime ses entrées" on public.journal_entries
  for delete to authenticated using (user_id = (select auth.uid()));

-- Notes : remontent à l'admin pour améliorer les programmes.
create policy "Chacun voit ses notes, l'admin voit tout" on public.ratings
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Chacun note" on public.ratings
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Chacun modifie ses notes" on public.ratings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Chacun supprime ses notes" on public.ratings
  for delete to authenticated using (user_id = (select auth.uid()));

-- Quiz : résultats personnels.
create policy "Chacun voit ses résultats, l'admin voit tout" on public.quiz_attempts
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Chacun enregistre ses résultats" on public.quiz_attempts
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.quizzes q where q.id = quiz_id and q.status = 'published')
  );

grant select, insert, update on public.enrollments to authenticated;
grant select, insert, update, delete on
  public.check_ins, public.journal_entries, public.ratings
  to authenticated;
grant select, insert, delete on public.practice_completions to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
grant all on
  public.enrollments, public.check_ins, public.practice_completions,
  public.journal_entries, public.ratings, public.quiz_attempts
  to service_role;
