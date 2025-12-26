import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformSettings } from '@/lib/types';

interface PlatformContextType {
  settings: PlatformSettings | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as PlatformSettings | null);
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update favicon dynamically when settings change
  useEffect(() => {
    if (settings?.favicon_url) {
      const faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = settings.favicon_url;
      }
    }
  }, [settings?.favicon_url]);

  const value = {
    settings,
    isLoading,
    refetch: fetchSettings,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
