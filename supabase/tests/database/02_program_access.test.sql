begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);

create function pg_temp.login_as(user_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select set_config('role', 'authenticated', true);
$$;
create function pg_temp.logout() returns void language sql as $$
  select set_config('request.jwt.claims', '', true);
  select set_config('role', 'postgres', true);
$$;

-- Catalogue : un programme gratuit, un payant, un brouillon.
insert into public.programs (id, slug, title, duration_days, is_free, status) values
  ('10000000-0000-0000-0000-000000000001', 'test-essai', '{"fr": "Essai"}', 3, true, 'published'),
  ('10000000-0000-0000-0000-000000000002', 'test-cure', '{"fr": "Cure de 21 jours"}', 21, false, 'published'),
  ('10000000-0000-0000-0000-000000000003', 'test-brouillon', '{"fr": "Brouillon"}', 7, false, 'draft');
insert into public.program_days (program_id, day_number, title) values
  ('10000000-0000-0000-0000-000000000001', 1, '{"fr": "Jour 1"}'),
  ('10000000-0000-0000-0000-000000000002', 1, '{"fr": "Jour 1"}'),
  ('10000000-0000-0000-0000-000000000003', 1, '{"fr": "Jour 1"}');
insert into public.products (id, kind, program_id, title, stripe_price_id) values
  ('20000000-0000-0000-0000-000000000002', 'program', '10000000-0000-0000-0000-000000000002', '{"fr": "Cure"}', 'price_cure'),
  ('20000000-0000-0000-0000-000000000009', 'subscription', null, '{"fr": "Abonnement"}', 'price_sub');

select throws_ok(
  $$ insert into public.programs (slug, title, duration_days) values ('sans-fr', '{"en": "No French"}', 1) $$,
  '23514', null,
  'Un texte traduit exige le français'
);

-- Un achat sur le site, avant même la création du compte.
insert into public.entitlements (email, product_id, source, source_ref) values
  ('Carla@Example.com', '20000000-0000-0000-0000-000000000002', 'stripe', 'cs_test_1');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'carla@example.com');

select is(
  (select user_id from public.entitlements where source_ref = 'cs_test_1'),
  '00000000-0000-0000-0000-00000000000c'::uuid,
  'Un achat fait sur le site est rattaché au compte créé ensuite avec le même email'
);

set local role anon;
select results_eq(
  $$ select slug from public.programs where slug like 'test-%' order by slug $$,
  $$ values ('test-cure'), ('test-essai') $$,
  'Un visiteur voit la vitrine des programmes publiés'
);
select throws_ok($$ select * from public.program_days $$, '42501', null,
  'Un visiteur n''a pas accès aux jours de programme');

select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select results_eq(
  $$ select p.slug from public.program_days d join public.programs p on p.id = d.program_id
     where p.slug like 'test-%' $$,
  $$ values ('test-essai') $$,
  'Sans achat, seul le programme gratuit est accessible'
);
select throws_ok(
  $$ insert into public.enrollments (user_id, program_id)
     values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000002') $$,
  '42501', null,
  'On ne peut pas s''inscrire à un programme payant sans l''avoir acheté'
);
select throws_ok(
  $$ insert into public.entitlements (user_id, email, product_id, source, source_ref)
     values ('00000000-0000-0000-0000-00000000000a', 'alice@example.com',
       '20000000-0000-0000-0000-000000000002', 'admin', 'triche') $$,
  '42501', null,
  'Un utilisateur ne peut pas s''octroyer un droit d''accès'
);

select pg_temp.login_as('00000000-0000-0000-0000-00000000000c');
select results_eq(
  $$ select p.slug from public.program_days d join public.programs p on p.id = d.program_id
     where p.slug like 'test-%' order by 1 $$,
  $$ values ('test-cure'), ('test-essai') $$,
  'Après achat, le programme payant est accessible'
);
select lives_ok(
  $$ insert into public.enrollments (user_id, program_id)
     values ('00000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-000000000002') $$,
  'On peut s''inscrire à un programme acheté'
);

-- Un abonnement expiré ne donne plus accès ; un abonnement en cours donne accès à tout.
select pg_temp.logout();
insert into public.entitlements (email, product_id, source, source_ref, starts_at, expires_at) values
  ('alice@example.com', '20000000-0000-0000-0000-000000000009', 'revenuecat', 'rc_old',
    now() - interval '2 months', now() - interval '1 month');
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select is(public.has_program_access('10000000-0000-0000-0000-000000000002'), false,
  'Un abonnement expiré ne donne plus accès');

select pg_temp.logout();
insert into public.entitlements (email, product_id, source, source_ref, expires_at) values
  ('alice@example.com', '20000000-0000-0000-0000-000000000009', 'revenuecat', 'rc_new',
    now() + interval '1 month');
select pg_temp.login_as('00000000-0000-0000-0000-00000000000a');
select is(public.has_program_access('10000000-0000-0000-0000-000000000002'), true,
  'Un abonnement en cours donne accès aux programmes payants');
select is(public.has_program_access('10000000-0000-0000-0000-000000000003'), false,
  'Un brouillon reste invisible, même abonné');

select * from finish();
rollback;
