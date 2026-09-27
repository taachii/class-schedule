-- Add gs_count to semesters table to allow dynamic number of groups per semester
ALTER TABLE public.semesters
ADD COLUMN IF NOT EXISTS gs_count integer NOT NULL DEFAULT 12;

-- Update types if necessary
