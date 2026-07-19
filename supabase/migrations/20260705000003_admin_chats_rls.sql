-- Allow admins to view all chat records
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
CREATE POLICY "Admins can view all chats" ON public.chats
    FOR SELECT TO authenticated USING (public.is_admin());

-- Allow admins to view all messages
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages
    FOR SELECT TO authenticated USING (public.is_admin());
