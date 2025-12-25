-- Create predefined tags table
CREATE TABLE public.business_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for business-tag relationship
CREATE TABLE public.business_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.business_tags(id) ON DELETE CASCADE,
  custom_tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tag CHECK (tag_id IS NOT NULL OR custom_tag IS NOT NULL)
);

-- Create business hours table with time slots
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_closed BOOLEAN NOT NULL DEFAULT false,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.business_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- RLS for business_tags (predefined tags)
CREATE POLICY "Anyone can view tags" ON public.business_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.business_tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for business_tag_assignments
CREATE POLICY "Anyone can view tag assignments for approved businesses" ON public.business_tag_assignments 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_tag_assignments.business_id AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid()))
);
CREATE POLICY "Owners can manage own tag assignments" ON public.business_tag_assignments 
FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_tag_assignments.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all tag assignments" ON public.business_tag_assignments 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for business_hours
CREATE POLICY "Anyone can view hours for approved businesses" ON public.business_hours 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_hours.business_id AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid()))
);
CREATE POLICY "Owners can manage own hours" ON public.business_hours 
FOR ALL USING (
  EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_hours.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all hours" ON public.business_hours 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default tags
INSERT INTO public.business_tags (name, slug) VALUES 
('WiFi Available', 'wifi-available'),
('Parking', 'parking'),
('AC', 'ac'),
('Home Delivery', 'home-delivery'),
('Online Payment', 'online-payment'),
('Wheelchair Accessible', 'wheelchair-accessible'),
('Pet Friendly', 'pet-friendly'),
('Vegetarian Options', 'vegetarian-options'),
('Vegan Options', 'vegan-options'),
('Open on Sundays', 'open-on-sundays');