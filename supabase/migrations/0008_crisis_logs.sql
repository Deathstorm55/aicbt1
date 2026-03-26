-- Crisis keyword detection logs for admin analytics
CREATE TABLE IF NOT EXISTS public.crisis_keyword_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text NOT NULL,
  keyword_matched text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.crisis_keyword_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert crisis logs (triggered client-side on crisis detection)
DROP POLICY IF EXISTS "Users can insert own crisis logs" ON public.crisis_keyword_logs;
CREATE POLICY "Users can insert own crisis logs"
ON public.crisis_keyword_logs
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  (auth.jwt() ->> 'sub') = clerk_user_id
);

-- Service role full access (for admin-metrics)
DROP POLICY IF EXISTS "Service role full access crisis logs" ON public.crisis_keyword_logs;
CREATE POLICY "Service role full access crisis logs"
ON public.crisis_keyword_logs
FOR ALL
USING (auth.role() = 'service_role');
