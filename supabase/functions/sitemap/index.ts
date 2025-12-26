import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://nearindia.in";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all approved businesses
    const { data: businesses } = await supabase
      .from("businesses")
      .select("slug, updated_at")
      .eq("status", "approved");

    // Fetch all categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, created_at");

    const now = new Date().toISOString();

    // Static pages
    const staticPages = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "/businesses", priority: "0.9", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/terms", priority: "0.3", changefreq: "yearly" },
      { url: "/disclaimer", priority: "0.3", changefreq: "yearly" },
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add category pages
    if (categories) {
      for (const category of categories) {
        sitemap += `  <url>
    <loc>${SITE_URL}/businesses/${category.slug}</loc>
    <lastmod>${category.created_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add business pages
    if (businesses) {
      for (const business of businesses) {
        sitemap += `  <url>
    <loc>${SITE_URL}/business/${business.slug}</loc>
    <lastmod>${business.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
});
