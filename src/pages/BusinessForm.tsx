import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness, useCreateBusiness, useUpdateBusiness } from '@/hooks/useBusinesses';
import { useCategories } from '@/hooks/useCategories';
import { useIndianStates } from '@/hooks/useIndianStates';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a city'),
  state: z.string().min(1, 'Please select a state'),
  phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid Indian phone number'),
  email: z.string().email('Please enter a valid email'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export default function BusinessForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: categories } = useCategories();
  const { data: states } = useIndianStates();
  const { data: existingBusiness, isLoading: businessLoading } = useBusiness(id || '');
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();
  
  const [images, setImages] = useState<{ file?: File; url: string; isNew: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);

  const isEdit = !!id;

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    if (existingBusiness) {
      form.reset({
        name: existingBusiness.name,
        category_id: existingBusiness.category_id,
        description: existingBusiness.description || '',
        address: existingBusiness.address,
        city: existingBusiness.city,
        state: existingBusiness.state,
        phone: existingBusiness.phone,
        email: existingBusiness.email,
        website: existingBusiness.website || '',
      });
      
      if (existingBusiness.images) {
        setImages(existingBusiness.images.map(img => ({
          url: img.image_url,
          isNew: false,
        })));
      }
    }
  }, [existingBusiness, form]);

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
    const newImages = images.filter(img => img.isNew && img.file);
    
    for (const img of newImages) {
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
  };

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setUploading(true);

      if (isEdit && id) {
        await updateBusiness.mutateAsync({
          id,
          name: data.name,
          category_id: data.category_id,
          description: data.description || null,
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          email: data.email,
          website: data.website || null,
          status: 'pending' as const,
        });
        await uploadImages(id);
        toast.success('Business updated! It will be reviewed again.');
      } else {
        const result = await createBusiness.mutateAsync({
          name: data.name,
          category_id: data.category_id,
          description: data.description || null,
          address: data.address,
          city: data.city,
          state: data.state,
          phone: data.phone,
          email: data.email,
          website: data.website || null,
        });
        await uploadImages(result.id);
        toast.success('Business submitted for review!');
      }
      
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
        {/* Header */}
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

        {/* Form */}
        <div className="bg-card rounded-2xl border p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>
                
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business..."
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
              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold">Location</h2>
                
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                
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

              {/* Images */}
              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-semibold">Images</h2>
                
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
                    <span className="text-sm text-muted-foreground">Add Image</span>
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
