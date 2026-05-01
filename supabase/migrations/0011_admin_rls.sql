-- 0011_admin_rls.sql
-- Enables Admins to read all records via Realtime by creating a security definer function
-- and adding RLS policies for the realtime tables.

-- 1. Create a function that checks if the current Clerk user is an admin.
-- We use SECURITY DEFINER so this function bypasses RLS when checking the users table,
-- preventing infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND email IN ('ifeadeniyi8@gmail.com', 'hifeadeniyi@gmail.com', 'odualagregory@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add RLS policies to allow Admins to SELECT all rows from the monitored tables.
-- These policies allow Supabase Realtime to broadcast changes to authenticated admins.

-- Users table
DROP POLICY IF EXISTS "Admins can select all users" ON public.users;
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT USING (is_admin());

-- Mood Logs table
DROP POLICY IF EXISTS "Admins can select all mood_logs" ON public.mood_logs;
CREATE POLICY "Admins can select all mood_logs" ON public.mood_logs FOR SELECT USING (is_admin());

-- Chat Messages table
DROP POLICY IF EXISTS "Admins can select all chat_messages" ON public.chat_messages;
CREATE POLICY "Admins can select all chat_messages" ON public.chat_messages FOR SELECT USING (is_admin());

-- Crisis Keyword Logs table
DROP POLICY IF EXISTS "Admins can select all crisis_logs" ON public.crisis_keyword_logs;
CREATE POLICY "Admins can select all crisis_logs" ON public.crisis_keyword_logs FOR SELECT USING (is_admin());

-- PHQ-9 History table
DROP POLICY IF EXISTS "Admins can select all phq9_history" ON public.phq9_history;
CREATE POLICY "Admins can select all phq9_history" ON public.phq9_history FOR SELECT USING (is_admin());
