-- Add new columns to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'local_business',
ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
ADD COLUMN IF NOT EXISTS alternate_email TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create business_amenities table for predefined amenities
CREATE TABLE IF NOT EXISTS public.business_amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for business amenity assignments
CREATE TABLE IF NOT EXISTS public.business_amenity_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.business_amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, amenity_id)
);

-- Enable RLS on new tables
ALTER TABLE public.business_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_amenity_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_amenities (anyone can view, only admins can manage)
CREATE POLICY "Anyone can view amenities" ON public.business_amenities FOR SELECT USING (true);
CREATE POLICY "Admins can manage amenities" ON public.business_amenities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for business_amenity_assignments
CREATE POLICY "Anyone can view amenity assignments for approved businesses" ON public.business_amenity_assignments 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_amenity_assignments.business_id 
    AND (businesses.status = 'approved' OR businesses.owner_id = auth.uid())
  )
);

CREATE POLICY "Owners can manage own amenity assignments" ON public.business_amenity_assignments 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_amenity_assignments.business_id 
    AND businesses.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all amenity assignments" ON public.business_amenity_assignments 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default amenities
INSERT INTO public.business_amenities (name, icon, slug) VALUES
  ('Free Wi-Fi', 'Wifi', 'free-wifi'),
  ('Parking Available', 'Car', 'parking'),
  ('Home Delivery', 'Truck', 'home-delivery'),
  ('Air Conditioned', 'Snowflake', 'air-conditioned'),
  ('Wheelchair Access', 'Accessibility', 'wheelchair-access'),
  ('Card Payment', 'CreditCard', 'card-payment'),
  ('24x7 Service', 'Clock', '24x7-service'),
  ('CCTV Security', 'Shield', 'cctv-security'),
  ('Pet Friendly', 'Dog', 'pet-friendly'),
  ('Outdoor Seating', 'TreeDeciduous', 'outdoor-seating'),
  ('Live Music', 'Music', 'live-music'),
  ('Valet Parking', 'Key', 'valet-parking')
ON CONFLICT (slug) DO NOTHING;