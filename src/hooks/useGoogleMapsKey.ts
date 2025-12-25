import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleMapsKey() {
  return useQuery({
    queryKey: ['google-maps-key'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-maps-key');
      if (error) throw error;
      return data?.apiKey as string | undefined;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
