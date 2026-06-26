
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

CREATE POLICY "Public read posters" ON storage.objects FOR SELECT USING (bucket_id = 'posters');
CREATE POLICY "Public read recordings" ON storage.objects FOR SELECT USING (bucket_id = 'recordings');

CREATE POLICY "Admins upload posters" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update posters" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete posters" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload recordings" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recordings' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update recordings" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'recordings' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete recordings" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recordings' AND public.has_role(auth.uid(), 'admin'));
