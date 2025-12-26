import { useEffect } from 'react';

export default function Sitemap() {
  useEffect(() => {
    // Redirect to the edge function sitemap
    window.location.href = 'https://dovwynkusvmwjfykkmmw.supabase.co/functions/v1/sitemap';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to sitemap...</p>
    </div>
  );
}
