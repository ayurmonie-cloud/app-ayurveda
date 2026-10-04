begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(13);

-- Utilitaires : se connecter comme un utilisateur, ou revenir en superutilisateur.
create function pg_temp.login_as(user_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;
create function pg_temp.logout() returns void language sql as $$
  select set_config('request.jwt.claims', '', true);
  select set_config('role', 'postgres', true);
$$;

-- Toutes les tables exposées doivent avoir la RLS activée.
select is_empty(
  $$ select tablename from pg_tables where schemaname = 'public' and not rowsecurity $$,
  'La RLS est activée sur toutes les tables de public'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com', '{"locale": "es", "display_name": "Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com', '{"locale": "xx"}'),
  ('00000000-0000-0000-0000-0000000000ad', 'anais@example.com', '{}');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';

select results_eq(
  $$ select locale::text, display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a' $$,
  $$ values ('es', 'Alice') $$,
  'L''inscription crée le profil avec la langue choisie'
);
select is(
  (select locale::text from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'fr',
  'Une langue inconnue retombe sur le français'
);

select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');

select results_eq(
  $$ select email from public.profiles $$,
  $$ values ('alice@example.com') $$,
  'Un utilisateur ne voit que son propre profil'
);
select lives_ok(
  $$ update public.profiles set locale = 'en', display_name = 'Alice B.' $$,
  'Un utilisateur peut changer sa langue et son nom'
);
select throws_ok(
  $$ update public.profiles set role = 'admin' $$,
  '42501', null,
  'Un utilisateur ne peut pas se donner le rôle admin'
);
select throws_ok(
  $$ select public.set_user_role('00000000-0000-0000-0000-00000000000b', 'admin') $$,
  '42501', null,
  'Seul un admin peut changer un rôle'
);

-- Consentements
select throws_ok(
  $$ insert into public.consent_events (user_id, kind, granted)
     values ('00000000-0000-0000-0000-00000000000b', 'health_tracking', true) $$,
  '42501', null,
  'Un utilisateur ne peut pas consentir à la place d''un autre'
);
insert into public.consent_events (user_id, kind, granted) values
  ('00000000-0000-0000-0000-00000000000a', 'ai_processing', true);
insert into public.consent_events (user_id, kind, granted) values
  ('00000000-0000-0000-0000-00000000000a', 'ai_processing', false);
select is(
  public.has_consent('00000000-0000-0000-0000-00000000000a', 'ai_processing'),
  false,
  'Le dernier choix l''emporte : un consentement retiré n''est plus valable'
);

select pg_temp.logout();
insert into public.consent_events (user_id, kind, granted) values
  ('00000000-0000-0000-0000-00000000000b', 'health_tracking', true);
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select is(
  public.has_consent('00000000-0000-0000-0000-00000000000b', 'health_tracking'),
  false,
  'Un utilisateur ne peut pas sonder les consentements d''un autre'
);

select pg_temp.login_as('00000000-0000-0000-0000-0000000000ad');
select is(
  (select count(*) from public.profiles),
  3::bigint,
  'L''admin voit tous les profils'
);
select lives_ok(
  $$ select public.set_user_role('00000000-0000-0000-0000-00000000000b', 'admin') $$,
  'L''admin peut changer un rôle'
);

select pg_temp.logout();
set local role anon;
select is_empty($$ select * from public.programs where status <> 'published' $$,
  'Un visiteur ne voit aucun programme non publié');

select * from finish();
rollback;
