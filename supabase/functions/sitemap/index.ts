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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Generating complete sitemap.xml");

    const now = formatDate(new Date().toISOString());

    // Fetch all categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("slug, name, created_at")
      .order("name");

    if (catError) {
      console.error("Error fetching categories:", catError);
    }

    // Fetch all approved businesses with images
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
    const categoryMap = (categories || []).reduce((acc, cat) => {
      acc[cat.slug] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    // Static pages
    const staticPages = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "/businesses", priority: "0.9", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
      { url: "/sitemap", priority: "0.4", changefreq: "weekly" },
      { url: "/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/terms", priority: "0.3", changefreq: "yearly" },
      { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
    ];

    const totalUrls = staticPages.length + (categories?.length || 0) + (businesses?.length || 0);

    // Build complete sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
<!-- ================================================================== -->
<!-- Near India - Business Directory Sitemap                           -->
<!-- Website: ${SITE_URL}                                        -->
<!-- Total URLs: ${totalUrls}                                                      -->
<!-- Generated: ${new Date().toISOString()}                       -->
<!-- ================================================================== -->

<!-- ==================== STATIC PAGES ==================== -->
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `<url>
  <loc>${SITE_URL}${page.url}</loc>
  <lastmod>${now}</lastmod>
  <changefreq>${page.changefreq}</changefreq>
  <priority>${page.priority}</priority>
</url>
`;
    }

    // Add category pages
    if (categories && categories.length > 0) {
      xml += `
<!-- ==================== CATEGORY PAGES (${categories.length}) ==================== -->
`;
      for (const category of categories) {
        const lastmod = formatDate(category.created_at);
        xml += `<url>
  <loc>${SITE_URL}/businesses/${escapeXml(category.slug)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
`;
      }
    }

    // Add business pages with images
    if (businesses && businesses.length > 0) {
      xml += `
<!-- ==================== BUSINESS LISTINGS (${businesses.length}) ==================== -->
`;
      for (const business of businesses) {
        const lastmod = formatDate(business.updated_at);
        const images = businessImages[business.id] || [];
        
        // Calculate priority based on recency
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(business.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        let priority = "0.6";
        if (daysSinceUpdate < 7) priority = "0.8";
        else if (daysSinceUpdate < 30) priority = "0.7";
        else if (daysSinceUpdate > 180) priority = "0.5";

        xml += `<url>
  <loc>${SITE_URL}/business/${escapeXml(business.slug)}</loc>
  <lastmod>${lastmod}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>${priority}</priority>`;

        // Add logo as image if exists
        if (business.logo_url) {
          const imageCaption = business.short_description 
            ? escapeXml(business.short_description.substring(0, 200))
            : `${escapeXml(business.name)} in ${escapeXml(business.city)}, ${escapeXml(business.state)}`;
          
          xml += `
  <image:image>
    <image:loc>${escapeXml(business.logo_url)}</image:loc>
    <image:title>${escapeXml(business.name)}</image:title>
    <image:caption>${imageCaption}</image:caption>
    <image:geo_location>${escapeXml(business.city)}, ${escapeXml(business.state)}, India</image:geo_location>
  </image:image>`;
        }

        // Add additional business images (max 10 per listing)
        for (const imageUrl of images.slice(0, 10)) {
          xml += `
  <image:image>
    <image:loc>${escapeXml(imageUrl)}</image:loc>
    <image:title>${escapeXml(business.name)}</image:title>
    <image:geo_location>${escapeXml(business.city)}, ${escapeXml(business.state)}, India</image:geo_location>
  </image:image>`;
        }

        xml += `
</url>
`;
      }
    }

    xml += `
<!-- ================================================================== -->
<!-- End of Sitemap - ${totalUrls} URLs indexed                                    -->
<!-- ================================================================== -->
</urlset>`;

    console.log(`Sitemap generated successfully with ${totalUrls} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
        },
      }
    );
  }
});
