-- Add slug column to businesses table
ALTER TABLE public.businesses ADD COLUMN slug TEXT UNIQUE;

-- Create a function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces and special chars with hyphens
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    new_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.businesses WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$$;

-- Create trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.set_business_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If slug is null or empty, generate one from the name
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_slug(NEW.name);
    ELSE
        -- Validate and clean the provided slug
        NEW.slug := lower(regexp_replace(NEW.slug, '[^a-zA-Z0-9-]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
        
        -- Check uniqueness (excluding current record on update)
        IF TG_OP = 'UPDATE' THEN
            IF EXISTS (SELECT 1 FROM public.businesses WHERE slug = NEW.slug AND id != NEW.id) THEN
                NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
            END IF;
        ELSE
            IF EXISTS (SELECT 1 FROM public.businesses WHERE slug = NEW.slug) THEN
                NEW.slug := NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 8);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER set_business_slug_trigger
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.set_business_slug();

-- Update existing businesses with slugs
UPDATE public.businesses 
SET slug = public.generate_slug(name) 
WHERE slug IS NULL;