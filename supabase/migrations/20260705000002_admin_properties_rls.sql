-- Create is_admin helper to verify if authenticated user is a platform admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS recursion
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND status = 'Active'
  );
END;
$$;

-- Grant select access to admin_users table for all active admins to prevent other potential query errors
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON public.admin_users;
CREATE POLICY "Allow select for authenticated admins" ON public.admin_users
    FOR SELECT TO authenticated USING (public.is_admin());

-- Allow admins to perform SELECT, UPDATE, DELETE on properties table
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
    FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
CREATE POLICY "Admins can update all properties" ON public.properties
    FOR UPDATE TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete all properties" ON public.properties;
CREATE POLICY "Admins can delete all properties" ON public.properties
    FOR DELETE TO authenticated USING (public.is_admin());
