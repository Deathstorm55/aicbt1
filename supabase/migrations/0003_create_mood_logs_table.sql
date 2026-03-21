-- Drop existing mood_logs table if it exists (handles any existing bad FK)
DROP TABLE IF EXISTS public.mood_logs;

-- Create mood_logs table using clerk_user_id (text) to avoid FK issues with public.users
-- This is safer since clerk_user_id is always available from the JWT
CREATE TABLE public.mood_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id text NOT NULL,
    mood text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Policies for mood_logs using the Clerk JWT claim 'sub'
CREATE POLICY "Users can insert their own mood logs" 
ON public.mood_logs FOR INSERT 
WITH CHECK (
    clerk_user_id = (auth.jwt() ->> 'sub')
);

CREATE POLICY "Users can view their own mood logs" 
ON public.mood_logs FOR SELECT 
USING (
    clerk_user_id = (auth.jwt() ->> 'sub')
);
