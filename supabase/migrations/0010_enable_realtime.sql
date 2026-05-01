-- Enable Supabase Realtime on tables needed for admin live notifications.
-- This adds the tables to the supabase_realtime publication so that
-- postgres_changes events are broadcast to connected clients.

-- Note: If a table is already in the publication, the IF NOT EXISTS
-- clause (or a DO block) prevents errors on re-runs.

DO $$
BEGIN
  -- users table (new registrations)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;

  -- mood_logs table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'mood_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;
  END IF;

  -- chat_messages table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;

  -- crisis_keyword_logs table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'crisis_keyword_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crisis_keyword_logs;
  END IF;

  -- phq9_history table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'phq9_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.phq9_history;
  END IF;
END $$;
