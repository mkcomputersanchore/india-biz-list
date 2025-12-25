import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessAmenity } from '@/lib/types';

export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_amenities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as BusinessAmenity[];
    },
  });
}
