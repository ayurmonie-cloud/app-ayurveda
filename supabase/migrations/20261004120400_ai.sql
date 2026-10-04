-- IA : conversations avec l'assistant et bilans hebdomadaires.
--
-- L'app n'appelle jamais le fournisseur d'IA directement : une fonction serveur
-- (Edge Function) vérifie le consentement « ai_processing », appelle le modèle avec
-- une clé secrète et enregistre la réponse avec le rôle service_role.

create type public.ai_message_role as enum ('user', 'assistant');

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text check (char_length(title) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_conversations_user_idx on public.ai_conversations (user_id, updated_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null check (char_length(content) <= 20000),
  created_at timestamptz not null default now()
);

create index ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);
create index ai_messages_user_idx on public.ai_messages (user_id);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  -- Indicateurs calculés (moyennes du check-in, régularité…), affichés en graphiques.
  metrics jsonb not null default '{}'::jsonb,
  -- Résumé rédigé par l'IA ; nul si l'utilisateur n'a pas consenti à l'analyse par l'IA.
  summary text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create trigger ai_conversations_set_updated_at before update on public.ai_conversations
  for each row execute function public.set_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.weekly_reviews enable row level security;

create policy "Chacun voit ses conversations" on public.ai_conversations
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Chacun ouvre une conversation avec consentement" on public.ai_conversations
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.has_consent((select auth.uid()), 'ai_processing')
  );
create policy "Chacun renomme ses conversations" on public.ai_conversations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Chacun supprime ses conversations" on public.ai_conversations
  for delete to authenticated using (user_id = (select auth.uid()));

-- Les réponses de l'assistant sont écrites par la fonction serveur (service_role).
create policy "Chacun voit ses messages" on public.ai_messages
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Chacun voit ses bilans" on public.weekly_reviews
  for select to authenticated using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select on public.ai_messages, public.weekly_reviews to authenticated;
grant all on public.ai_conversations, public.ai_messages, public.weekly_reviews to service_role;
