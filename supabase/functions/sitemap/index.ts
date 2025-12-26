import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://nearindia.in";

// Format date to W3C Datetime format (Google preferred)
function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

// Escape XML special characters
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "index";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating sitemap: ${type}`);

    let sitemap = '';

    if (type === "index") {
      // Generate Sitemap Index (sitemapindex)
      sitemap = generateSitemapIndex();
    } else if (type === "static") {
      // Generate static pages sitemap
      sitemap = generateStaticSitemap();
    } else if (type === "categories") {
      // Generate categories sitemap
      const { data: categories, error } = await supabase
        .from("categories")
        .select("id, slug, name, description, icon, created_at")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      sitemap = generateCategoriesSitemap(categories || []);
    } else if (type === "businesses") {
      // Generate businesses sitemap with images
      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select(`
          id, slug, name, short_description, logo_url, updated_at, city, state,
          category_id
        `)
        .eq("status", "approved")
        .order("updated_at", { ascending: false });

      if (bizError) {
        console.error("Error fetching businesses:", bizError);
        throw bizError;
      }

      // Fetch business images
      const businessIds = (businesses || []).map(b => b.id);
      let businessImages: Record<string, string[]> = {};

      if (businessIds.length > 0) {
        const { data: images } = await supabase
          .from("business_images")
          .select("business_id, image_url")
          .in("business_id", businessIds);

        if (images) {
          businessImages = images.reduce((acc, img) => {
            if (!acc[img.business_id]) acc[img.business_id] = [];
            acc[img.business_id].push(img.image_url);
            return acc;
          }, {} as Record<string, string[]>);
        }
      }

      // Fetch categories for business context
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");

      const categoryMap = (categories || []).reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<string, string>);

      sitemap = generateBusinessesSitemap(businesses || [], businessImages, categoryMap);
    } else {
      return new Response("Invalid sitemap type", { status: 400 });
    }

    console.log(`Sitemap ${type} generated successfully`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>Error generating sitemap</message>
  <timestamp>${new Date().toISOString()}</timestamp>
</error>`,
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
});

// Generate Sitemap Index
function generateSitemapIndex(): string {
  const now = formatDate(new Date().toISOString());
  const functionUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sitemap`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap-style.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Near India Business Directory - Sitemap Index -->
  <!-- Generated: ${new Date().toISOString()} -->
  
  <sitemap>
    <loc>${functionUrl}?type=static</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${functionUrl}?type=categories</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  
  <sitemap>
    <loc>${functionUrl}?type=businesses</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Generate Static Pages Sitemap
function generateStaticSitemap(): string {
  const now = formatDate(new Date().toISOString());

  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily", title: "Home - Find Local Businesses in India" },
    { url: "/businesses", priority: "0.9", changefreq: "daily", title: "Browse All Businesses" },
    { url: "/categories", priority: "0.8", changefreq: "weekly", title: "Business Categories" },
    { url: "/about", priority: "0.6", changefreq: "monthly", title: "About Us" },
    { url: "/contact", priority: "0.6", changefreq: "monthly", title: "Contact Us" },
    { url: "/sitemap", priority: "0.4", changefreq: "weekly", title: "HTML Sitemap" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly", title: "Privacy Policy" },
    { url: "/terms", priority: "0.3", changefreq: "yearly", title: "Terms of Service" },
    { url: "/disclaimer", priority: "0.3", changefreq: "yearly", title: "Disclaimer" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap-style.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Near India - Static Pages Sitemap -->
  <!-- Total URLs: ${staticPages.length} -->
  <!-- Generated: ${new Date().toISOString()} -->
`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return xml;
}

// Generate Categories Sitemap
function generateCategoriesSitemap(categories: any[]): string {
  const now = formatDate(new Date().toISOString());

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap-style.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Near India - Category Pages Sitemap -->
  <!-- Total Categories: ${categories.length} -->
  <!-- Generated: ${new Date().toISOString()} -->
`;

  for (const category of categories) {
    const lastmod = formatDate(category.created_at);
    
    xml += `
  <url>
    <loc>${SITE_URL}/businesses/${escapeXml(category.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return xml;
}

// Generate Businesses Sitemap with Images
function generateBusinessesSitemap(
  businesses: any[], 
  businessImages: Record<string, string[]>,
  categoryMap: Record<string, string>
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE_URL}/sitemap-style.xsl"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Near India - Business Listings Sitemap -->
  <!-- Total Businesses: ${businesses.length} -->
  <!-- Generated: ${new Date().toISOString()} -->
`;

  for (const business of businesses) {
    const lastmod = formatDate(business.updated_at);
    const images = businessImages[business.id] || [];
    const categoryName = categoryMap[business.category_id] || '';
    
    // Calculate priority based on recency
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(business.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    let priority = "0.6";
    if (daysSinceUpdate < 7) priority = "0.8";
    else if (daysSinceUpdate < 30) priority = "0.7";
    else if (daysSinceUpdate > 180) priority = "0.5";

    xml += `
  <url>
    <loc>${SITE_URL}/business/${escapeXml(business.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>`;

    // Add logo as image if exists
    if (business.logo_url) {
      const imageTitle = `${escapeXml(business.name)} - Logo`;
      const imageCaption = business.short_description 
        ? escapeXml(business.short_description.substring(0, 200))
        : `${escapeXml(business.name)} in ${escapeXml(business.city)}, ${escapeXml(business.state)}`;
      
      xml += `
    <image:image>
      <image:loc>${escapeXml(business.logo_url)}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:caption>${imageCaption}</image:caption>
      <image:geo_location>${escapeXml(business.city)}, ${escapeXml(business.state)}, India</image:geo_location>
    </image:image>`;
    }

    // Add additional business images (max 1000 per page according to Google)
    for (const imageUrl of images.slice(0, 10)) {
      const imageTitle = `${escapeXml(business.name)} - ${escapeXml(categoryName)} in ${escapeXml(business.city)}`;
      
      xml += `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:geo_location>${escapeXml(business.city)}, ${escapeXml(business.state)}, India</image:geo_location>
    </image:image>`;
    }

    xml += `
  </url>`;
  }

  xml += `
</urlset>`;

  return xml;
}
