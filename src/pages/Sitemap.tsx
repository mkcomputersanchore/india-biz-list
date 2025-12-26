import { useEffect, useState } from "react";

export default function Sitemap() {
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndRender = async () => {
      try {
        // Add cache-busting timestamp
        const timestamp = Date.now();
        const response = await fetch(
          `https://dovwynkusvmwjfykkmmw.supabase.co/functions/v1/sitemap?t=${timestamp}`,
          {
            headers: {
              Accept: "application/xml,text/xml,*/*",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error(`Failed to fetch sitemap: ${response.status}`);

        const xml = await response.text();
        const normalizedXml = xml.trimStart().startsWith("<?xml")
          ? xml
          : `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;

        // Render directly at /sitemap.xml
        document.open("application/xml");
        document.write(normalizedXml);
        document.close();
      } catch (err) {
        console.error("Error fetching sitemap:", err);
        setError(true);
      }
    };

    fetchAndRender();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
