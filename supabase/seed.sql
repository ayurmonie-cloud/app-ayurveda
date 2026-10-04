-- Données de démonstration pour le développement local (`supabase db reset`).
-- Elles ne sont jamais envoyées en production.

insert into public.programs (id, slug, title, summary, duration_days, is_free, status, position) values
  ('a0000000-0000-0000-0000-000000000001', 'decouverte',
    '{"fr": "Découverte de l''ayurveda", "en": "Discovering Ayurveda", "es": "Descubrir el ayurveda"}',
    '{"fr": "Trois jours pour poser les bases d''une routine ayurvédique.", "en": "Three days to lay the foundations of an Ayurvedic routine.", "es": "Tres días para sentar las bases de una rutina ayurvédica."}',
    3, true, 'published', 0),
  ('a0000000-0000-0000-0000-000000000002', 'cure-21-jours',
    '{"fr": "Cure de 21 jours", "en": "21-day cleanse", "es": "Cura de 21 días"}',
    '{"fr": "Un programme complet pour rééquilibrer son agni.", "en": "A complete programme to rebalance your agni.", "es": "Un programa completo para reequilibrar tu agni."}',
    21, false, 'published', 1);

insert into public.program_days (id, program_id, day_number, title) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1,
    '{"fr": "Le réveil", "en": "Waking up", "es": "El despertar"}'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 2,
    '{"fr": "L''alimentation", "en": "Food", "es": "La alimentación"}'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 3,
    '{"fr": "Le soir", "en": "Evening", "es": "La noche"}');

insert into public.practices (program_day_id, position, title, duration_minutes) values
  ('b0000000-0000-0000-0000-000000000001', 0,
    '{"fr": "Gratter la langue", "en": "Tongue scraping", "es": "Raspado de lengua"}', 2),
  ('b0000000-0000-0000-0000-000000000001', 1,
    '{"fr": "Boire un verre d''eau chaude", "en": "Drink a glass of warm water", "es": "Beber un vaso de agua caliente"}', 2),
  ('b0000000-0000-0000-0000-000000000002', 0,
    '{"fr": "Déjeuner au calme, sans écran", "en": "Eat lunch calmly, without screens", "es": "Almorzar con calma, sin pantallas"}', 30),
  ('b0000000-0000-0000-0000-000000000003', 0,
    '{"fr": "Abhyanga des pieds", "en": "Foot abhyanga", "es": "Abhyanga de pies"}', 10);

insert into public.products (kind, program_id, title, store_product_id, stripe_price_id) values
  ('program', 'a0000000-0000-0000-0000-000000000002',
    '{"fr": "Cure de 21 jours", "en": "21-day cleanse", "es": "Cura de 21 días"}',
    'program_cure_21', 'price_demo_cure_21'),
  ('subscription', null,
    '{"fr": "Abonnement mensuel", "en": "Monthly subscription", "es": "Suscripción mensual"}',
    'subscription_monthly', 'price_demo_monthly');

insert into public.quizzes (id, slug, kind, title, status) values
  ('c0000000-0000-0000-0000-000000000001', 'test-de-dosha', 'dosha',
    '{"fr": "Test de dosha", "en": "Dosha test", "es": "Test de dosha"}', 'published');

insert into public.quiz_questions (id, quiz_id, position, prompt) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 0,
    '{"fr": "Comment décrirais-tu ta silhouette ?", "en": "How would you describe your build?", "es": "¿Cómo describirías tu complexión?"}'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 1,
    '{"fr": "Comment est ton appétit ?", "en": "How is your appetite?", "es": "¿Cómo es tu apetito?"}');

insert into public.quiz_options (question_id, position, label, dosha_scores) values
  ('d0000000-0000-0000-0000-000000000001', 0, '{"fr": "Fine, légère", "en": "Slim, light", "es": "Delgada, ligera"}', '{"vata": 2}'),
  ('d0000000-0000-0000-0000-000000000001', 1, '{"fr": "Moyenne, musclée", "en": "Medium, muscular", "es": "Media, musculosa"}', '{"pitta": 2}'),
  ('d0000000-0000-0000-0000-000000000001', 2, '{"fr": "Robuste, charpentée", "en": "Sturdy, solid", "es": "Robusta, fuerte"}', '{"kapha": 2}'),
  ('d0000000-0000-0000-0000-000000000002', 0, '{"fr": "Irrégulier", "en": "Irregular", "es": "Irregular"}', '{"vata": 2}'),
  ('d0000000-0000-0000-0000-000000000002', 1, '{"fr": "Fort, je supporte mal de sauter un repas", "en": "Strong, I hate skipping meals", "es": "Fuerte, me cuesta saltarme una comida"}', '{"pitta": 2}'),
  ('d0000000-0000-0000-0000-000000000002', 2, '{"fr": "Modéré et stable", "en": "Moderate and steady", "es": "Moderado y estable"}', '{"kapha": 2}');
