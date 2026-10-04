-- Stockage des fichiers.
--
--   public-media   : visuels publics (couvertures de programmes), écrits par l'admin.
--   program-media  : audio, vidéo et images des programmes, privés ; lus via des URL signées.
--   journal-photos : photos du carnet, privées, rangées sous « <user_id>/… ».

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 10485760,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('program-media', 'program-media', false, 524288000,
    array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'video/mp4']),
  ('journal-photos', 'journal-photos', false, 10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "L'admin gère les médias publics" on storage.objects
  for all to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()))
  with check (bucket_id = 'public-media' and (select public.is_admin()));

create policy "L'admin gère les médias des programmes" on storage.objects
  for all to authenticated
  using (bucket_id = 'program-media' and (select public.is_admin()))
  with check (bucket_id = 'program-media' and (select public.is_admin()));

-- Un média de programme est lisible s'il est rattaché à un contenu que l'utilisateur peut lire.
create policy "Les médias des contenus accessibles sont lisibles" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'program-media'
    and exists (select 1 from public.contents c where c.media_path = name)
  );

create policy "Chacun gère les photos de son carnet" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'journal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'journal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.has_consent((select auth.uid()), 'health_tracking')
  );

create policy "L'admin voit les photos des carnets partagés" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'journal-photos'
    and (select public.is_admin())
    and public.has_consent(((storage.foldername(name))[1])::uuid, 'journal_sharing')
  );
