import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Business, BusinessStatus } from '@/lib/types';

interface BusinessFilters {
  category?: string;
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

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(*),
          images:business_images(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Business | null;
    },
    enabled: !!id,
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
      category_id: string;
      description?: string;
      address: string;
      city: string;
      state: string;
      phone: string;
      email: string;
      website?: string;
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
