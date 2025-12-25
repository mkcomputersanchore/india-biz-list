-- Add slug column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_unique ON public.categories(slug);

-- Create function to generate category slug
CREATE OR REPLACE FUNCTION public.generate_category_slug(name text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    new_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM public.categories WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN new_slug;
END;
$function$;

-- Create trigger to auto-generate slug for categories
CREATE OR REPLACE FUNCTION public.set_category_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_category_slug(NEW.name);
    ELSE
        NEW.slug := lower(regexp_replace(NEW.slug, '[^a-zA-Z0-9-]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
        
        IF TG_OP = 'UPDATE' THEN
            IF EXISTS (SELECT 1 FROM public.categories WHERE slug = NEW.slug AND id != NEW.id) THEN
                NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
            END IF;
        ELSE
            IF EXISTS (SELECT 1 FROM public.categories WHERE slug = NEW.slug) THEN
                NEW.slug := NEW.slug || '-' || substr(gen_random_uuid()::text, 1, 8);
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS set_category_slug_trigger ON public.categories;
CREATE TRIGGER set_category_slug_trigger
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_category_slug();

-- Update existing categories to have slugs
UPDATE public.categories SET slug = public.generate_category_slug(name) WHERE slug IS NULL;