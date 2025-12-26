-- Add favicon_url to platform_settings
ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS favicon_url text;

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can insert (submit form), only admins can view/manage
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
ON public.contact_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
ON public.contact_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions"
ON public.contact_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));