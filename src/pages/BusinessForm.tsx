import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import type { BusinessType, PriceRange } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness, useCreateBusiness, useUpdateBusiness } from '@/hooks/useBusinesses';
import { useCategories } from '@/hooks/useCategories';
import { useIndianStates } from '@/hooks/useIndianStates';
import { useAmenities } from '@/hooks/useAmenities';
import { useTags } from '@/hooks/useTags';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload, X, Loader2, Plus, Wifi, Car, Truck, Snowflake, Accessibility, CreditCard, Clock, Shield, Dog, TreeDeciduous, Music, Key } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BUSINESS_TYPES = [
  { value: 'local_business', label: 'Local Business' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'online_store', label: 'Online Store' },
  { value: 'service_business', label: 'Service Business' },
];

const PRICE_RANGES = [
  { value: 'budget', label: 'Budget (₹)' },
  { value: 'moderate', label: 'Moderate (₹₹)' },
  { value: 'expensive', label: 'Expensive (₹₹₹)' },
  { value: 'luxury', label: 'Luxury (₹₹₹₹)' },
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wifi': <Wifi className="h-4 w-4" />,
  'Car': <Car className="h-4 w-4" />,
  'Truck': <Truck className="h-4 w-4" />,
  'Snowflake': <Snowflake className="h-4 w-4" />,
  'Accessibility': <Accessibility className="h-4 w-4" />,
  'CreditCard': <CreditCard className="h-4 w-4" />,
  'Clock': <Clock className="h-4 w-4" />,
  'Shield': <Shield className="h-4 w-4" />,
  'Dog': <Dog className="h-4 w-4" />,
  'TreeDeciduous': <TreeDeciduous className="h-4 w-4" />,
  'Music': <Music className="h-4 w-4" />,
  'Key': <Key className="h-4 w-4" />,
};

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}:00`,
    label: `${displayHour}:${minute} ${period}`,
  };
});

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => currentYear - i);

const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .regex(/^[a-z0-9-]*$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  category_id: z.string().min(1, 'Please select a category'),
  short_description: z.string().max(200, 'Short description must be 200 characters or less').optional(),
  description: z.string().optional(),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a city'),
  state: z.string().min(1, 'Please select a state'),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode').optional().or(z.literal('')),
  google_maps_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid Indian phone number'),
  email: z.string().email('Please enter a valid email'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  whatsapp: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  telegram: z.string().optional(),
  alternate_phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  alternate_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  facebook_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  business_type: z.string().optional(),
  price_range: z.string().optional(),
  year_established: z.number().min(1800).max(currentYear).optional().nullable(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessHourState {
  is_closed: boolean;
  open_time: string;
  close_time: string;
  break_start: string;
  break_end: string;
}

export default function BusinessForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: categories } = useCategories();
  const { data: states } = useIndianStates();
  const { data: amenities } = useAmenities();
  const { data: tags } = useTags();
  const { data: existingBusiness, isLoading: businessLoading } = useBusiness(id || '');
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();
  
  const [images, setImages] = useState<{ file?: File; url: string; isNew: boolean }[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHourState[]>(
    DAYS.map(() => ({
      is_closed: false,
      open_time: '09:00:00',
      close_time: '18:00:00',
      break_start: '',
      break_end: '',
    }))
  );

  const isEdit = !!id;

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_id: '',
      short_description: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      google_maps_url: '',
      phone: '',
      email: '',
      website: '',
      whatsapp: '',
      telegram: '',
      alternate_phone: '',
      alternate_email: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      youtube_url: '',
      linkedin_url: '',
      business_type: 'local_business',
      price_range: 'moderate',
      year_established: null,
    },
  });

  useEffect(() => {
    if (existingBusiness) {
      form.reset({
        name: existingBusiness.name,
        slug: existingBusiness.slug || '',
        category_id: existingBusiness.category_id,
        short_description: existingBusiness.short_description || '',
        description: existingBusiness.description || '',
        address: existingBusiness.address,
        city: existingBusiness.city,
        state: existingBusiness.state,
        pincode: existingBusiness.pincode || '',
        google_maps_url: existingBusiness.google_maps_url || '',
        phone: existingBusiness.phone,
        email: existingBusiness.email,
        website: existingBusiness.website || '',
        whatsapp: existingBusiness.whatsapp || '',
        telegram: existingBusiness.telegram || '',
        alternate_phone: existingBusiness.alternate_phone || '',
        alternate_email: existingBusiness.alternate_email || '',
        facebook_url: existingBusiness.facebook_url || '',
        instagram_url: existingBusiness.instagram_url || '',
        twitter_url: existingBusiness.twitter_url || '',
        youtube_url: existingBusiness.youtube_url || '',
        linkedin_url: existingBusiness.linkedin_url || '',
        business_type: existingBusiness.business_type || 'local_business',
        price_range: existingBusiness.price_range || 'moderate',
        year_established: existingBusiness.year_established || null,
      });
      
      // Set logo URL
      if (existingBusiness.logo_url) {
        setLogoUrl(existingBusiness.logo_url);
      }
      
      if (existingBusiness.images) {
        setImages(existingBusiness.images.map(img => ({
          url: img.image_url,
          isNew: false,
        })));
      }

      if (existingBusiness.hours) {
        const hoursMap = new Map(existingBusiness.hours.map(h => [h.day_of_week, h]));
        setBusinessHours(DAYS.map((_, index) => {
          const hour = hoursMap.get(index);
          return {
            is_closed: hour?.is_closed ?? false,
            open_time: hour?.open_time || '09:00:00',
            close_time: hour?.close_time || '18:00:00',
            break_start: hour?.break_start || '',
            break_end: hour?.break_end || '',
          };
        }));
      }

      if (existingBusiness.tags) {
        const tagIds = existingBusiness.tags.filter(t => t.tag_id).map(t => t.tag_id as string);
        const customs = existingBusiness.tags.filter(t => t.custom_tag).map(t => t.custom_tag as string);
        setSelectedTags(tagIds);
        setCustomTags(customs);
      }

      loadExistingAmenities(existingBusiness.id);
    }
  }, [existingBusiness, form]);

  const loadExistingAmenities = async (businessId: string) => {
    const { data } = await supabase
      .from('business_amenity_assignments')
      .select('amenity_id')
      .eq('business_id', businessId);
    if (data) {
      setSelectedAmenities(data.map(a => a.amenity_id));
    }
  };

  if (authLoading || businessLoading) {
    return (
      <Layout>
        <div className="container-narrow py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isEdit && existingBusiness && existingBusiness.owner_id !== user.id) {
    return <Navigate to="/dashboard" replace />;
  }

  const addImageUrl = () => {
    if (imageUrl && imageUrl.startsWith('http')) {
      setImages(prev => [...prev, { url: imageUrl, isNew: true }]);
      setImageUrl('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (businessId: string) => {
    const fileImages = images.filter(img => img.isNew && img.file);
    for (const img of fileImages) {
      if (!img.file) continue;
      
      const fileExt = img.file.name.split('.').pop();
      const fileName = `${businessId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(fileName, img.file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      await supabase.from('business_images').insert({
        business_id: businessId,
        image_url: publicUrl,
        is_primary: images.indexOf(img) === 0,
      });
    }

    const urlImages = images.filter(img => img.isNew && !img.file);
    for (const img of urlImages) {
      await supabase.from('business_images').insert({
        business_id: businessId,
        image_url: img.url,
        is_primary: images.indexOf(img) === 0,
      });
    }
  };

  const saveBusinessHours = async (businessId: string) => {
    await supabase.from('business_hours').delete().eq('business_id', businessId);
    
    const hoursToInsert = businessHours.map((hour, index) => ({
      business_id: businessId,
      day_of_week: index,
      is_closed: hour.is_closed,
      open_time: hour.is_closed ? null : hour.open_time || null,
      close_time: hour.is_closed ? null : hour.close_time || null,
      break_start: hour.break_start || null,
      break_end: hour.break_end || null,
    }));

    await supabase.from('business_hours').insert(hoursToInsert);
  };

  const saveAmenities = async (businessId: string) => {
    await supabase.from('business_amenity_assignments').delete().eq('business_id', businessId);
    
    if (selectedAmenities.length > 0) {
      const assignments = selectedAmenities.map(amenityId => ({
        business_id: businessId,
        amenity_id: amenityId,
      }));
      await supabase.from('business_amenity_assignments').insert(assignments);
    }
  };

  const saveTags = async (businessId: string) => {
    await supabase.from('business_tag_assignments').delete().eq('business_id', businessId);
    
    const assignments = [
      ...selectedTags.map(tagId => ({ business_id: businessId, tag_id: tagId, custom_tag: null })),
      ...customTags.map(tag => ({ business_id: businessId, tag_id: null, custom_tag: tag })),
    ];

    if (assignments.length > 0) {
      await supabase.from('business_tag_assignments').insert(assignments);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !customTags.includes(customTag.trim())) {
      setCustomTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const updateBusinessHour = (dayIndex: number, field: keyof BusinessHourState, value: string | boolean) => {
    setBusinessHours(prev => prev.map((hour, i) => 
      i === dayIndex ? { ...hour, [field]: value } : hour
    ));
  };

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setUploading(true);

      const businessData = {
        name: data.name,
        slug: data.slug || undefined,
        category_id: data.category_id,
        short_description: data.short_description || null,
        description: data.description || null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode || null,
        google_maps_url: data.google_maps_url || null,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        whatsapp: data.whatsapp || null,
        telegram: data.telegram || null,
        alternate_phone: data.alternate_phone || null,
        alternate_email: data.alternate_email || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        twitter_url: data.twitter_url || null,
        youtube_url: data.youtube_url || null,
        linkedin_url: data.linkedin_url || null,
        business_type: (data.business_type || null) as BusinessType | null,
        price_range: (data.price_range || null) as PriceRange | null,
        year_established: data.year_established || null,
        logo_url: logoUrl || null,
      };

      let businessId: string;

      if (isEdit && id) {
        await updateBusiness.mutateAsync({
          id,
          ...businessData,
          status: 'pending' as const,
        });
        businessId = id;
        toast.success('Business updated! It will be reviewed again.');
      } else {
        const result = await createBusiness.mutateAsync(businessData);
        businessId = result.id;
        toast.success('Business submitted for review!');
      }

      await Promise.all([
        uploadImages(businessId),
        saveBusinessHours(businessId),
        saveAmenities(businessId),
        saveTags(businessId),
      ]);
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container-narrow py-8 md:py-12">
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Business' : 'Add New Business'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit 
              ? 'Update your business information' 
              : 'Fill in the details to list your business'
            }
          </p>
        </div>

        <div className="bg-card rounded-2xl border p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom URL Slug (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">/business/</span>
                          <Input 
                            placeholder="my-business-name" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave empty to auto-generate from business name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select price range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRICE_RANGES.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="year_established"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Established</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} 
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YEAR_OPTIONS.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief tagline for your business (max 200 chars)"
                          maxLength={200}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/200 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business in detail..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Location Details</h2>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states?.map((state) => (
                              <SelectItem key={state.id} value={state.name}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="6-digit pincode" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="google_maps_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.google.com/..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Paste your Google Maps location link for accurate directions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Contact Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="business@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Contact Methods */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Additional Contact Methods</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram Username</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternate_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alternate_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternate Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="alt@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Social Media Links</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="facebook_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitter_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://x.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="youtube_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Business Hours */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Business Hours</h2>
                
                <div className="space-y-3">
                  {DAYS.map((day, index) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between sm:w-32">
                        <span className="font-medium">{day}</span>
                        <div className="sm:hidden">
                          <Switch 
                            checked={!businessHours[index].is_closed}
                            onCheckedChange={(checked) => updateBusinessHour(index, 'is_closed', !checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex items-center gap-2">
                        <Switch 
                          checked={!businessHours[index].is_closed}
                          onCheckedChange={(checked) => updateBusinessHour(index, 'is_closed', !checked)}
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {businessHours[index].is_closed ? 'Closed' : 'Open'}
                        </span>
                      </div>

                      {!businessHours[index].is_closed && (
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <div className="flex items-center gap-1">
                            <Select
                              value={businessHours[index].open_time}
                              onValueChange={(val) => updateBusinessHour(index, 'open_time', val)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">to</span>
                            <Select
                              value={businessHours[index].close_time}
                              onValueChange={(val) => updateBusinessHour(index, 'close_time', val)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-muted-foreground">Break:</span>
                            <Select
                              value={businessHours[index].break_start || 'none'}
                              onValueChange={(val) => updateBusinessHour(index, 'break_start', val === 'none' ? '' : val)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time.value} value={time.value}>
                                    {time.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {businessHours[index].break_start && (
                              <>
                                <span className="text-muted-foreground">-</span>
                                <Select
                                  value={businessHours[index].break_end}
                                  onValueChange={(val) => updateBusinessHour(index, 'break_end', val)}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((time) => (
                                      <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Business Amenities</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {amenities?.map((amenity) => (
                    <div
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAmenities.includes(amenity.id)
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-muted/50 border-transparent hover:bg-muted'
                      }`}
                    >
                      <Checkbox 
                        checked={selectedAmenities.includes(amenity.id)}
                        className="pointer-events-none"
                      />
                      {amenity.icon && AMENITY_ICONS[amenity.icon]}
                      <span className="text-sm font-medium">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Business Tags</h2>
                <p className="text-sm text-muted-foreground">Select relevant tags to improve search visibility</p>
                
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <Button type="button" variant="outline" onClick={addCustomTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeCustomTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Business Logo</h2>
                <p className="text-sm text-muted-foreground">Add your business logo (URL only)</p>
                
                <div className="flex gap-4 items-start">
                  {logoUrl && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted border-2 border-primary flex-shrink-0">
                      <img
                        src={logoUrl}
                        alt="Business logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      placeholder="Paste logo URL (e.g., https://example.com/logo.png)"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Square images work best (e.g., 200x200px)
                    </p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Business Images</h2>
                <p className="text-sm text-muted-foreground">Add photos of your business</p>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  />
                  <Button type="button" variant="outline" onClick={addImageUrl}>
                    Add URL
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={`Business image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploading || createBusiness.isPending || updateBusiness.isPending}
                >
                  {(uploading || createBusiness.isPending || updateBusiness.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isEdit ? 'Update Business' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
