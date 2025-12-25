import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { IndianState } from '@/lib/types';

export function useIndianStates() {
  return useQuery({
    queryKey: ['indian-states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indian_states')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as IndianState[];
    },
  });
}
