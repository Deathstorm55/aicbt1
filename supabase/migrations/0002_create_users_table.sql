-- Create completely new users table linking to Clerk
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text UNIQUE NOT NULL,
  name text,
  email text,
  religion text CHECK (religion IN ('christian', 'muslim', 'prefer_not_to_say')),
  phq9_score smallint,
  eligible_for_chatbot boolean DEFAULT false,
  last_assessment_date timestamp with time zone,
  needs_crisis_intervention boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Turn on row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
CREATE POLICY "Users can insert their own record" 
ON public.users 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'sub') = clerk_user_id
);

DROP POLICY IF EXISTS "Users can read their own record" ON public.users;
CREATE POLICY "Users can read their own record" 
ON public.users 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'sub') = clerk_user_id
);

DROP POLICY IF EXISTS "Users can update their own record" ON public.users;
CREATE POLICY "Users can update their own record" 
ON public.users 
FOR UPDATE 
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt() ->> 'sub') = clerk_user_id
);
