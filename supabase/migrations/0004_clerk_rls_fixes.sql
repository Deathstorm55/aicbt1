-- ============================================================
-- Migration: Fix daily_verses and chat_messages for Clerk Auth
-- ============================================================
-- The original tables referenced auth.users(id) and used auth.uid() in RLS,
-- which doesn't work with Clerk. This migration recreates them using
-- clerk_user_id (text) and JWT-based RLS policies.

-- 1. Drop old tables (they had broken FK to auth.users)
DROP TABLE IF EXISTS public.daily_verses;
DROP TABLE IF EXISTS public.chat_messages;

-- 2. Recreate daily_verses with clerk_user_id
CREATE TABLE public.daily_verses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id text NOT NULL,
    verse_text text NOT NULL,
    religion text NOT NULL,
    date_served date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily verses"
ON public.daily_verses FOR SELECT
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own daily verses"
ON public.daily_verses FOR INSERT
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- 3. Recreate chat_messages with clerk_user_id
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id text NOT NULL,
    encrypted_message text NOT NULL,
    encrypted_response text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages FOR SELECT
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));
