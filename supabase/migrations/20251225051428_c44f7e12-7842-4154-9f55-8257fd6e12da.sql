-- Add RLS policies for admins to manage categories
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));