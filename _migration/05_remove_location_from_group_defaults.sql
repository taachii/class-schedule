-- Drop unused location column from subject_group_defaults
ALTER TABLE public.subject_group_defaults
DROP COLUMN IF EXISTS location;
