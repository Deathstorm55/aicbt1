-- PHQ-9 history table for tracking assessment scores over time
CREATE TABLE IF NOT EXISTS public.phq9_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text NOT NULL,
  score smallint NOT NULL,
  answers jsonb,
  ai_insights text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.phq9_history ENABLE ROW LEVEL SECURITY;

-- Users can insert their own PHQ-9 history
DROP POLICY IF EXISTS "Users can insert own phq9 history" ON public.phq9_history;
CREATE POLICY "Users can insert own phq9 history"
ON public.phq9_history
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub') = clerk_user_id
);

-- Users can read their own PHQ-9 history
DROP POLICY IF EXISTS "Users can read own phq9 history" ON public.phq9_history;
CREATE POLICY "Users can read own phq9 history"
ON public.phq9_history
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub') = clerk_user_id
);

-- Allow service role full access (for admin-metrics)
DROP POLICY IF EXISTS "Service role full access phq9 history" ON public.phq9_history;
CREATE POLICY "Service role full access phq9 history"
ON public.phq9_history
FOR ALL
USING (auth.role() = 'service_role');
