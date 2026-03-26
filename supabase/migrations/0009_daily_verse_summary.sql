-- Add verse_summary column to daily_verses table
ALTER TABLE public.daily_verses ADD COLUMN IF NOT EXISTS verse_summary text;
