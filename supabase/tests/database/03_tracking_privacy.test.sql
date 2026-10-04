begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(14);

create function pg_temp.login_as(user_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;
create function pg_temp.logout() returns void language sql as $$
  select set_config('request.jwt.claims', '', true);
  select set_config('role', 'postgres', true);
$$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com'),
  ('00000000-0000-0000-0000-0000000000ad', 'anais@example.com');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';

select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select throws_ok(
  $$ insert into public.check_ins (user_id, date, energy, sleep, digestion, mood, stress)
     values ('00000000-0000-0000-0000-00000000000a', '2026-10-04', 4, 3, 4, 5, 2) $$,
  '42501', null,
  'Pas de check-in sans consentement au suivi santé'
);

insert into public.consent_events (user_id, kind, granted)
  values ('00000000-0000-0000-0000-00000000000a', 'health_tracking', true);
select lives_ok(
  $$ insert into public.check_ins (user_id, date, energy, sleep, digestion, mood, stress)
     values ('00000000-0000-0000-0000-00000000000a', '2026-10-04', 4, 3, 4, 5, 2) $$,
  'Check-in possible après consentement'
);
select lives_ok(
  $$ insert into public.journal_entries (user_id, body)
     values ('00000000-0000-0000-0000-00000000000a', 'Langue chargée ce matin') $$,
  'Entrée de carnet possible après consentement'
);
select throws_ok(
  $$ insert into public.check_ins (user_id, date, energy, sleep, digestion, mood, stress)
     values ('00000000-0000-0000-0000-00000000000a', '2026-10-05', 6, 3, 4, 5, 2) $$,
  '23514', null,
  'Les notes du check-in restent entre 1 et 5'
);

select pg_temp.login_as('00000000-0000-0000-0000-00000000000b');
select is_empty($$ select * from public.check_ins $$, 'Un autre utilisateur ne voit pas les check-ins');
select is_empty($$ select * from public.journal_entries $$, 'Un autre utilisateur ne voit pas le carnet');

select pg_temp.login_as('00000000-0000-0000-0000-0000000000ad');
select is_empty($$ select * from public.journal_entries $$,
  'L''admin ne voit pas un carnet qui ne lui est pas partagé');

select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
insert into public.consent_events (user_id, kind, granted)
  values ('00000000-0000-0000-0000-00000000000a', 'journal_sharing', true);
select pg_temp.login_as('00000000-0000-0000-0000-0000000000ad');
select is((select count(*) from public.journal_entries), 1::bigint,
  'L''admin voit le carnet une fois qu''il lui est partagé');
select is((select count(*) from public.check_ins), 1::bigint,
  'L''admin voit les check-ins une fois le suivi partagé');

-- Assistant IA : consentement requis, et les réponses ne viennent que du serveur.
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select throws_ok(
  $$ insert into public.ai_conversations (user_id) values ('00000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'Pas de conversation avec l''IA sans consentement'
);
select throws_ok(
  $$ insert into public.ai_messages (conversation_id, user_id, role, content)
     values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'assistant', 'Faux conseil') $$,
  '42501', null,
  'Un utilisateur ne peut pas écrire une réponse de l''assistant'
);

-- Comptes rendus de consultation : visibles par le client seulement une fois partagés.
select pg_temp.logout();
insert into public.consultations (id, email, cal_booking_uid, mode, starts_at, ends_at) values
  ('30000000-0000-0000-0000-000000000001', 'ALICE@example.com', 'cal_1', 'video',
    '2026-10-10 09:00+02', '2026-10-10 10:00+02');
insert into public.consultation_reports (consultation_id, body)
  values ('30000000-0000-0000-0000-000000000001', 'Compte rendu');
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select is((select count(*) from public.consultations), 1::bigint,
  'Une réservation cal.eu est rattachée au compte par email');
select is_empty($$ select * from public.consultation_reports $$,
  'Un compte rendu non partagé reste invisible pour le client');
select pg_temp.login_as('00000000-0000-0000-0000-0000000000ad');
update public.consultation_reports set shared_at = now();
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select is((select body from public.consultation_reports), 'Compte rendu',
  'Le client voit le compte rendu une fois partagé');

select * from finish();
rollback;
