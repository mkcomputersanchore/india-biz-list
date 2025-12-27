-- Add is_featured column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for faster featured queries
CREATE INDEX idx_businesses_is_featured ON public.businesses(is_featured) WHERE is_featured = true;