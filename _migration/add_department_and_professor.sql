-- Add department to subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS department text;

-- Add professor to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS professor text;
