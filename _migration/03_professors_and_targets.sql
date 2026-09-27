-- 1. Create professors table
CREATE TABLE IF NOT EXISTS public.professors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_title text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on professors" ON public.professors FOR SELECT USING (true);

-- 2. Create subject_group_defaults table
CREATE TABLE IF NOT EXISTS public.subject_group_defaults (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_key text NOT NULL REFERENCES public.subjects(key) ON DELETE CASCADE,
  semester_id integer NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  group_key text NOT NULL, -- e.g., 'GW', 'GS1', 'GC2', 'GK3'
  professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  location text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (subject_key, semester_id, group_key)
);

ALTER TABLE public.subject_group_defaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on subject_group_defaults" ON public.subject_group_defaults FOR SELECT USING (true);

-- 3. Modify events table
-- Add the new universal groups array
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS target_groups text[] DEFAULT '{}'::text[];

-- Migrate data if any exists (assume seminar_groups and exercise_groups exist)
-- Combine them into target_groups
UPDATE public.events SET target_groups = array_cat(
  COALESCE(seminar_groups, '{}'::text[]),
  COALESCE(exercise_groups, '{}'::text[])
);

-- Add override columns
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS override_professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS override_location text;

-- Drop old columns (Optional: backup data first if needed, but since it's early stage we just drop)
ALTER TABLE public.events DROP COLUMN IF EXISTS seminar_groups;
ALTER TABLE public.events DROP COLUMN IF EXISTS exercise_groups;
ALTER TABLE public.events DROP COLUMN IF EXISTS professor;
ALTER TABLE public.events DROP COLUMN IF EXISTS location;
