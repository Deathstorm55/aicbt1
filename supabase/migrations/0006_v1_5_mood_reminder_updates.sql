-- v1.5: Add time_of_day to mood_logs and monitoring flags to users

-- Add time_of_day column to mood_logs (morning/evening)
ALTER TABLE public.mood_logs
ADD COLUMN IF NOT EXISTS time_of_day text CHECK (time_of_day IN ('morning', 'evening'));

-- Add has_suicidal_ideation flag to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_suicidal_ideation boolean DEFAULT false;

-- Add needs_increased_monitoring flag to users (for scores 15-20)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS needs_increased_monitoring boolean DEFAULT false;
