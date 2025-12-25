import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Business, BusinessStatus } from '@/lib/types';

interface BusinessFilters {
  category?: string;
  categorySlug?: string;
  city?: string;
  search?: string;
  status?: BusinessStatus;
  ownerId?: string;
}

export function useBusinesses(filters?: BusinessFilters) {
  return useQuery({
    queryKey: ['businesses', filters],
    queryFn: async () => {
      let query = supabase
        .from('businesses')
        .select(`
          *,
          category:categories(*),
          images:business_images(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.categorySlug) {
        // First get the category ID from slug
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.categorySlug)
          .single();
        if (cat) {
          query = query.eq('category_id', cat.id);
        }
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useApprovedBusinesses(filters?: Omit<BusinessFilters, 'status'>) {
  return useBusinesses({ ...filters, status: 'approved' });
}

export function useBusiness(idOrSlug: string) {
  return useQuery({
    queryKey: ['business', idOrSlug],
    queryFn: async () => {
      // Try to find by slug first, then by id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(*),
          images:business_images(*)
        `)
        .eq(isUuid ? 'id' : 'slug', idOrSlug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch tags, hours, and amenities separately
      const [tagsResult, hoursResult, amenitiesResult] = await Promise.all([
        supabase
          .from('business_tag_assignments')
          .select(`
            *,
            tag:business_tags(*)
          `)
          .eq('business_id', data.id),
        supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', data.id)
          .order('day_of_week', { ascending: true }),
        supabase
          .from('business_amenity_assignments')
          .select(`
            *,
            amenity:business_amenities(*)
          `)
          .eq('business_id', data.id)
      ]);

      return {
        ...data,
        tags: tagsResult.data || [],
        hours: hoursResult.data || [],
        amenities: amenitiesResult.data || []
      } as Business;
    },
    enabled: !!idOrSlug,
  });
}

export function useMyBusinesses() {
  return useQuery({
    queryKey: ['my-businesses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(*),
          images:business_images(*)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (business: {
      name: string;
      slug?: string;
      category_id: string;
      description?: string | null;
      address: string;
      city: string;
      state: string;
      phone: string;
      email: string;
      website?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...business,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Business> & { id: string }) => {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.id] });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
    },
  });
}
