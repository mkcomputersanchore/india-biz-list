import { useEffect, useState } from 'react';

export default function Sitemap() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndDisplaySitemap = async () => {
      try {
        const response = await fetch('https://dovwynkusvmwjfykkmmw.supabase.co/functions/v1/sitemap');
        const xmlContent = await response.text();
        
        // Create a new document with the XML content
        document.open('text/xml');
        document.write(xmlContent);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        setLoading(false);
      }
    };

    fetchAndDisplaySitemap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading sitemap...</p>
      </div>
    );
  }

  return null;
}
