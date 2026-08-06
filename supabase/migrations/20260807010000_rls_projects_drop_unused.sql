-- Enable RLS on remaining unrestricted tables; drop unused empty tables.
-- spatial_ref_sys is PostGIS system data — keep it, lock API access.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select projects for all" ON public.projects;
CREATE POLICY "Allow select projects for all"
  ON public.projects
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow write projects for admins" ON public.projects;
CREATE POLICY "Allow write projects for admins"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- spatial_ref_sys is owned by PostGIS; cannot ENABLE RLS.
-- Move PostGIS out of public so it is not API-exposed (see next migration).

DROP TABLE IF EXISTS public.home_banners CASCADE;
DROP TABLE IF EXISTS public.price_optimizations CASCADE;
DROP TABLE IF EXISTS public.reel_likes CASCADE;
DROP TABLE IF EXISTS public.gate_access_passes CASCADE;
DROP TABLE IF EXISTS public.handover_protocols CASCADE;
DROP TABLE IF EXISTS public.tenant_risk_profiles CASCADE;
DROP TABLE IF EXISTS public.tour_bookings CASCADE;
DROP TABLE IF EXISTS public.vastu_assessments CASCADE;
