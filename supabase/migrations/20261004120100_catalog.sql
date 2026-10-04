-- Catalogue : ce qu'Anaïs publie depuis l'admin (programmes, jours, pratiques,
-- contenus, quiz). Chaque texte visible est un `localized_text` (FR, EN, ES).
--
-- La lecture des jours, pratiques et contenus d'un programme payant dépend des droits
-- d'accès : ces politiques sont ajoutées dans la migration « commerce ».

create type public.content_kind as enum ('article', 'recipe', 'practice', 'audio', 'video');
create type public.quiz_kind as enum ('dosha', 'knowledge');

-- ---------------------------------------------------------------------------
-- Programmes
-- ---------------------------------------------------------------------------

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title public.localized_text not null,
  summary public.localized_text,
  description public.localized_text,
  cover_path text,
  duration_days integer not null check (duration_days between 1 and 365),
  is_free boolean not null default false,
  status public.publication_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.programs.is_free is 'Programme d''essai accessible sans achat.';
comment on column public.programs.cover_path is 'Chemin dans le bucket public-media.';

create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  title public.localized_text not null,
  intro public.localized_text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, day_number)
);

-- Pratiques du jour, que l'utilisateur coche dans sa checklist.
create table public.practices (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days (id) on delete cascade,
  position integer not null default 0,
  title public.localized_text not null,
  instructions public.localized_text,
  duration_minutes integer check (duration_minutes between 1 and 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index practices_program_day_idx on public.practices (program_day_id, position);

-- Bibliothèque de contenus réutilisables d'un programme à l'autre.
create table public.contents (
  id uuid primary key default gen_random_uuid(),
  kind public.content_kind not null,
  title public.localized_text not null,
  body public.localized_text,
  media_path text,
  duration_minutes integer check (duration_minutes between 1 and 600),
  is_free boolean not null default false,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.contents.media_path is 'Chemin dans le bucket program-media (audio, vidéo, image).';

create table public.program_day_contents (
  program_day_id uuid not null references public.program_days (id) on delete cascade,
  content_id uuid not null references public.contents (id) on delete cascade,
  position integer not null default 0,
  primary key (program_day_id, content_id)
);

create index program_day_contents_content_idx on public.program_day_contents (content_id);

-- ---------------------------------------------------------------------------
-- Quiz (dont le test de dosha)
-- ---------------------------------------------------------------------------

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind public.quiz_kind not null,
  title public.localized_text not null,
  description public.localized_text,
  program_id uuid references public.programs (id) on delete set null,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quizzes_program_idx on public.quizzes (program_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  position integer not null default 0,
  prompt public.localized_text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quiz_questions_quiz_idx on public.quiz_questions (quiz_id, position);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  position integer not null default 0,
  label public.localized_text not null,
  -- Test de dosha : points attribués, par exemple {"vata": 2, "pitta": 1}.
  dosha_scores jsonb not null default '{}'::jsonb check (
    jsonb_typeof(dosha_scores) = 'object'
    and (dosha_scores - array['vata', 'pitta', 'kapha']) = '{}'::jsonb
  ),
  -- Quiz de connaissances : bonne réponse.
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quiz_options_question_idx on public.quiz_options (question_id, position);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create trigger programs_set_updated_at before update on public.programs
  for each row execute function public.set_updated_at();
create trigger program_days_set_updated_at before update on public.program_days
  for each row execute function public.set_updated_at();
create trigger practices_set_updated_at before update on public.practices
  for each row execute function public.set_updated_at();
create trigger contents_set_updated_at before update on public.contents
  for each row execute function public.set_updated_at();
create trigger quizzes_set_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();
create trigger quiz_questions_set_updated_at before update on public.quiz_questions
  for each row execute function public.set_updated_at();
create trigger quiz_options_set_updated_at before update on public.quiz_options
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sécurité
-- ---------------------------------------------------------------------------

alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.practices enable row level security;
alter table public.contents enable row level security;
alter table public.program_day_contents enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;

-- L'admin gère tout le catalogue.
create policy "L'admin gère les programmes" on public.programs
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les jours" on public.program_days
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les pratiques" on public.practices
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les contenus" on public.contents
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les contenus des jours" on public.program_day_contents
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les quiz" on public.quizzes
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les questions" on public.quiz_questions
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "L'admin gère les réponses" on public.quiz_options
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- La vitrine des programmes publiés est visible de tous, même sans compte, pour donner envie.
create policy "Tout le monde voit les programmes publiés" on public.programs
  for select to anon, authenticated using (status = 'published');

-- Les quiz publiés sont accessibles aux utilisateurs connectés.
create policy "Les utilisateurs voient les quiz publiés" on public.quizzes
  for select to authenticated using (status = 'published');

create policy "Les utilisateurs voient les questions des quiz publiés" on public.quiz_questions
  for select to authenticated
  using (exists (
    select 1 from public.quizzes q where q.id = quiz_id and q.status = 'published'
  ));

create policy "Les utilisateurs voient les réponses des quiz publiés" on public.quiz_options
  for select to authenticated
  using (exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = question_id and q.status = 'published'
  ));

grant select on public.programs to anon;
grant select, insert, update, delete on
  public.programs, public.program_days, public.practices, public.contents,
  public.program_day_contents, public.quizzes, public.quiz_questions, public.quiz_options
  to authenticated;
grant all on
  public.programs, public.program_days, public.practices, public.contents,
  public.program_day_contents, public.quizzes, public.quiz_questions, public.quiz_options
  to service_role;
