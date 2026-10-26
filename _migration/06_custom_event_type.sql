-- Custom / Niestandardowe event type (e.g. integration meetings)

-- 1. Events of this type may have no subject
ALTER TABLE public.events ALTER COLUMN subject_key DROP NOT NULL;

-- 2. Custom event name
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_title text;

-- 3. Register the type
INSERT INTO public.event_types (code, label)
VALUES ('X', 'Niestandardowe')
ON CONFLICT (code) DO NOTHING;
