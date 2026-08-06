-- PostGIS owns spatial_ref_sys, so RLS cannot be enabled on it in public.
-- No app tables use geometry/geography; keep PostGIS in non-API schema.
CREATE SCHEMA IF NOT EXISTS extensions;

DROP EXTENSION IF EXISTS postgis CASCADE;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
