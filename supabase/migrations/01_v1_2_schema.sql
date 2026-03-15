-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Updates to profiles table (assuming profiles table exists from V1.1 and matches Auth)
-- Add religion, phq9_score, and eligible_for_chatbot columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_religion') THEN
        CREATE TYPE user_religion AS ENUM ('christian', 'muslim', 'prefer_not_to_say');
    END IF;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS religion user_religion,
ADD COLUMN IF NOT EXISTS phq9_score integer,
ADD COLUMN IF NOT EXISTS eligible_for_chatbot boolean DEFAULT false;

-- 2. Create daily_verses table
CREATE TABLE IF NOT EXISTS public.daily_verses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    verse_text text NOT NULL,
    religion text NOT NULL,
    date_served date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_message text NOT NULL,
    encrypted_response text NOT NULL,
    timestamp timestamp with time zone DEFAULT now()
);

-- Provide RLS for new tables
ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for daily_verses
CREATE POLICY "Users can view their own daily verses" 
ON public.daily_verses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily verses" 
ON public.daily_verses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies for chat_messages
CREATE POLICY "Users can view their own chat messages" 
ON public.chat_messages FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow reading the profile
CREATE POLICY "Users can view their own profile details" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile details" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
