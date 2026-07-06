-- Fix RLS recursion on admin_users table
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS recursion
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND role = 'Super Admin' AND status = 'Active'
  );
END;
$$;

DROP POLICY IF EXISTS "Allow all for Super Admin" ON public.admin_users;
CREATE POLICY "Allow all for Super Admin" ON public.admin_users
    FOR ALL TO authenticated USING (public.is_super_admin());
