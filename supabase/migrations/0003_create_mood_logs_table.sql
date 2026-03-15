-- Create mood_logs table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    mood text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Policies for mood_logs
-- We use the users table's clerk_user_id to link with auth.jwt() ->> 'sub'
CREATE POLICY "Users can insert their own mood logs" 
ON public.mood_logs FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND clerk_user_id = (auth.jwt() ->> 'sub')
    )
);

CREATE POLICY "Users can view their own mood logs" 
ON public.mood_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND clerk_user_id = (auth.jwt() ->> 'sub')
    )
);
