-- Ensure RLS is enabled on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert notifications for any user
DROP POLICY IF EXISTS "Admins can insert notifications for any user" ON public.notifications;
CREATE POLICY "Admins can insert notifications for any user" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
