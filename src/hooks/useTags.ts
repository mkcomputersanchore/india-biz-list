import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessTag } from '@/lib/types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as BusinessTag[];
    },
  });
}
