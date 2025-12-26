import { useEffect, useState } from 'react';

export default function Sitemap() {
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://dovwynkusvmwjfykkmmw.supabase.co/functions/v1/sitemap');
        const content = await response.text();
        setXmlContent(content);
      } catch (err) {
        console.error('Error fetching sitemap:', err);
        setError(true);
      }
    };

    fetchSitemap();
  }, []);

  useEffect(() => {
    if (xmlContent) {
      // Create a blob with XML content type and redirect to it
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      window.location.replace(url);
    }
  }, [xmlContent]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading sitemap</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading sitemap...</p>
    </div>
  );
}
