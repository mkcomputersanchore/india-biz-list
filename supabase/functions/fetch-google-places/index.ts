import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaceResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  place_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!googleApiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Places API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { city, category, categoryId, maxResults = 60 } = await req.json();
    
    console.log(`Fetching places for city: ${city}, category: ${category}, max: ${maxResults}`);

    // Build search query
    const query = `${category} in ${city}, India`;
    const encodedQuery = encodeURIComponent(query);
    
    const allPlaces: PlaceResult[] = [];
    let nextPageToken: string | null = null;
    let pageCount = 0;
    const maxPages = Math.ceil(maxResults / 20); // Google returns 20 per page

    do {
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${googleApiKey}`;
      
      if (nextPageToken) {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${googleApiKey}`;
        // Google requires a short delay before using pagetoken
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`Fetching page ${pageCount + 1}...`);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google API error:", data.status, data.error_message);
        if (pageCount === 0) {
          return new Response(
            JSON.stringify({ error: `Google API error: ${data.status}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
      }

      if (data.results) {
        // Get detailed info for each place
        for (const place of data.results) {
          if (allPlaces.length >= maxResults) break;
          
          try {
            const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,geometry&key=${googleApiKey}`;
            const detailResponse = await fetch(detailUrl);
            const detailData = await detailResponse.json();
            
            if (detailData.result) {
              allPlaces.push({
                ...detailData.result,
                place_id: place.place_id,
                types: place.types || [],
              });
            }
          } catch (err) {
            console.error("Error fetching place details:", err);
            // Still add basic info
            allPlaces.push({
              name: place.name,
              formatted_address: place.formatted_address || place.vicinity,
              geometry: place.geometry,
              types: place.types || [],
              place_id: place.place_id,
            });
          }
        }
      }

      nextPageToken = data.next_page_token || null;
      pageCount++;
      
      console.log(`Page ${pageCount}: Found ${data.results?.length || 0} places, total: ${allPlaces.length}`);
      
    } while (nextPageToken && pageCount < maxPages && allPlaces.length < maxResults);

    console.log(`Total places fetched: ${allPlaces.length}`);

    // Transform to business format
    const businesses = allPlaces.map(place => {
      // Extract city and state from address
      const addressParts = place.formatted_address?.split(",") || [];
      const extractedCity = addressParts.length > 1 ? addressParts[addressParts.length - 3]?.trim() : city;
      const extractedState = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim()?.replace(/\d+/g, '').trim() : "";

      return {
        name: place.name,
        address: place.formatted_address || "",
        city: extractedCity || city,
        state: extractedState || "Gujarat",
        phone: place.formatted_phone_number || "",
        website: place.website || null,
        category_id: categoryId,
        place_id: place.place_id,
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        businesses,
        total: businesses.length,
        message: `Found ${businesses.length} businesses`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-google-places:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});