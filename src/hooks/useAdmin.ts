import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Business, BusinessStatus, Profile, PlatformSettings } from '@/lib/types';

export function useAllBusinesses() {
  return useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          category:categories(*),
          images:business_images(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Business[];
    },
  });
}

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      rejection_reason 
    }: { 
      id: string; 
      status: BusinessStatus; 
      rejection_reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('businesses')
        .update({ 
          status, 
          rejection_reason: status === 'rejected' ? rejection_reason : null 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useToggleUserBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_blocked })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<PlatformSettings>) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .limit(1)
        .single();

      if (!existing) throw new Error('No platform settings found');

      const { data, error } = await supabase
        .from('platform_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });
}
