-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create business status enum
CREATE TYPE public.business_status AS ENUM ('pending', 'approved', 'rejected');

-- Create platform settings table (for configurable branding)
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name TEXT NOT NULL DEFAULT 'LocalBiz India',
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (app_name, seo_title, seo_description) 
VALUES ('LocalBiz India', 'LocalBiz India - Find Local Businesses', 'Discover and connect with local businesses across India');

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read platform settings
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Insert default categories
INSERT INTO public.categories (name, icon) VALUES
    ('Restaurants', 'utensils'),
    ('Hotels', 'hotel'),
    ('Healthcare', 'heart-pulse'),
    ('Education', 'graduation-cap'),
    ('Shopping', 'shopping-bag'),
    ('Services', 'wrench'),
    ('Real Estate', 'home'),
    ('Automotive', 'car'),
    ('Beauty & Spa', 'sparkles'),
    ('Fitness', 'dumbbell');

-- Create Indian states table
CREATE TABLE public.indian_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE
);

-- Insert Indian states
INSERT INTO public.indian_states (name, code) VALUES
    ('Andhra Pradesh', 'AP'),
    ('Arunachal Pradesh', 'AR'),
    ('Assam', 'AS'),
    ('Bihar', 'BR'),
    ('Chhattisgarh', 'CG'),
    ('Goa', 'GA'),
    ('Gujarat', 'GJ'),
    ('Haryana', 'HR'),
    ('Himachal Pradesh', 'HP'),
    ('Jharkhand', 'JH'),
    ('Karnataka', 'KA'),
    ('Kerala', 'KL'),
    ('Madhya Pradesh', 'MP'),
    ('Maharashtra', 'MH'),
    ('Manipur', 'MN'),
    ('Meghalaya', 'ML'),
    ('Mizoram', 'MZ'),
    ('Nagaland', 'NL'),
    ('Odisha', 'OR'),
    ('Punjab', 'PB'),
    ('Rajasthan', 'RJ'),
    ('Sikkim', 'SK'),
    ('Tamil Nadu', 'TN'),
    ('Telangana', 'TS'),
    ('Tripura', 'TR'),
    ('Uttar Pradesh', 'UP'),
    ('Uttarakhand', 'UK'),
    ('West Bengal', 'WB'),
    ('Delhi', 'DL'),
    ('Chandigarh', 'CH'),
    ('Puducherry', 'PY');

-- Enable RLS on indian_states
ALTER TABLE public.indian_states ENABLE ROW LEVEL SECURITY;

-- Everyone can view states
CREATE POLICY "Anyone can view states" ON public.indian_states
    FOR SELECT USING (true);

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    status business_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved businesses
CREATE POLICY "Anyone can view approved businesses" ON public.businesses
    FOR SELECT USING (status = 'approved');

-- Owners can view their own businesses (any status)
CREATE POLICY "Owners can view own businesses" ON public.businesses
    FOR SELECT USING (auth.uid() = owner_id);

-- Owners can insert their own businesses
CREATE POLICY "Owners can insert businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own businesses
CREATE POLICY "Owners can update own businesses" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

-- Admins can view all businesses
CREATE POLICY "Admins can view all businesses" ON public.businesses
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any business
CREATE POLICY "Admins can update any business" ON public.businesses
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any business
CREATE POLICY "Admins can delete businesses" ON public.businesses
    FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create business_images table
CREATE TABLE public.business_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on business_images
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view images of approved businesses
CREATE POLICY "Anyone can view business images" ON public.business_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND (status = 'approved' OR owner_id = auth.uid())
        )
    );

-- Owners can manage their business images
CREATE POLICY "Owners can manage images" ON public.business_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

-- Admins can manage all images
CREATE POLICY "Admins can manage all images" ON public.business_images
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);

-- Storage policies for business images
CREATE POLICY "Anyone can view business images" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'business-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their images" ON storage.objects
    FOR DELETE USING (bucket_id = 'business-images' AND auth.role() = 'authenticated');

-- Create storage bucket for platform assets (logo, etc)
INSERT INTO storage.buckets (id, name, public) VALUES ('platform-assets', 'platform-assets', true);

-- Storage policies for platform assets
CREATE POLICY "Anyone can view platform assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'platform-assets');

CREATE POLICY "Admins can manage platform assets" ON storage.objects
    FOR ALL USING (bucket_id = 'platform-assets' AND public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin update policies for platform settings
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles (for blocking)
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));