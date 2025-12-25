import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface OpeningHoursPeriod {
  open: { day: number; time: string };
  close?: { day: number; time: string };
}

interface PlaceResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string; // Google Maps URL
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  place_id: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    weekday_text?: string[];
    periods?: OpeningHoursPeriod[];
    open_now?: boolean;
  };
  photos?: PlacePhoto[];
  editorial_summary?: {
    overview: string;
  };
  icon?: string;
  icon_background_color?: string;
  business_status?: string;
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
        // Get detailed info for each place with all available fields
        for (const place of data.results) {
          if (allPlaces.length >= maxResults) break;
          
          try {
            // Request ALL available fields for comprehensive data
            const detailFields = [
              'name',
              'formatted_address',
              'formatted_phone_number',
              'international_phone_number',
              'website',
              'url',
              'geometry',
              'opening_hours',
              'photos',
              'rating',
              'user_ratings_total',
              'price_level',
              'editorial_summary',
              'icon',
              'icon_background_color',
              'business_status',
              'types'
            ].join(',');
            
            const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=${detailFields}&key=${googleApiKey}`;
            const detailResponse = await fetch(detailUrl);
            const detailData = await detailResponse.json();
            
            if (detailData.result) {
              allPlaces.push({
                ...detailData.result,
                place_id: place.place_id,
                types: detailData.result.types || place.types || [],
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

    // Helper function to get photo URL
    const getPhotoUrl = (photoRef: string, maxWidth = 800) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${googleApiKey}`;
    };

    // Helper to convert price level to our format
    const getPriceRange = (priceLevel?: number) => {
      if (priceLevel === undefined) return null;
      switch (priceLevel) {
        case 0: return 'budget';
        case 1: return 'budget';
        case 2: return 'moderate';
        case 3: return 'premium';
        case 4: return 'luxury';
        default: return null;
      }
    };

    // Helper to parse opening hours
    const parseOpeningHours = (openingHours?: PlaceResult['opening_hours']) => {
      if (!openingHours?.periods) return null;
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const hours: Array<{
        day_of_week: number;
        open_time: string | null;
        close_time: string | null;
        is_closed: boolean;
      }> = [];

      // Initialize all days as closed
      for (let i = 0; i < 7; i++) {
        hours.push({
          day_of_week: i,
          open_time: null,
          close_time: null,
          is_closed: true,
        });
      }

      // Check if 24/7
      if (openingHours.periods.length === 1 && 
          openingHours.periods[0].open?.time === '0000' && 
          !openingHours.periods[0].close) {
        // 24/7 open
        for (let i = 0; i < 7; i++) {
          hours[i] = {
            day_of_week: i,
            open_time: '00:00',
            close_time: '23:59',
            is_closed: false,
          };
        }
        return hours;
      }

      // Parse regular hours
      for (const period of openingHours.periods) {
        const dayIndex = period.open.day;
        const openTime = period.open.time.substring(0, 2) + ':' + period.open.time.substring(2);
        const closeTime = period.close 
          ? period.close.time.substring(0, 2) + ':' + period.close.time.substring(2)
          : '23:59';
        
        hours[dayIndex] = {
          day_of_week: dayIndex,
          open_time: openTime,
          close_time: closeTime,
          is_closed: false,
        };
      }

      return hours;
    };

    // Transform to business format with full details
    const businesses = allPlaces.map(place => {
      // Extract city and state from address
      const addressParts = place.formatted_address?.split(",") || [];
      const extractedCity = addressParts.length > 2 ? addressParts[addressParts.length - 3]?.trim() : city;
      const stateWithPincode = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : "";
      const extractedState = stateWithPincode.replace(/\d+/g, '').trim() || "Gujarat";
      const pincode = stateWithPincode.match(/\d+/)?.[0] || null;

      // Get photo URLs
      const photos = place.photos?.slice(0, 10).map(photo => ({
        photo_reference: photo.photo_reference,
        url: getPhotoUrl(photo.photo_reference),
        is_primary: false,
      })) || [];
      
      // Set first photo as primary
      if (photos.length > 0) {
        photos[0].is_primary = true;
      }

      // Get logo (use icon or first small photo)
      const logoUrl = photos.length > 0 
        ? getPhotoUrl(photos[0].photo_reference, 200) 
        : null;

      // Parse hours
      const hours = parseOpeningHours(place.opening_hours);

      return {
        name: place.name,
        address: place.formatted_address || "",
        city: extractedCity || city,
        state: extractedState,
        pincode: pincode,
        phone: place.formatted_phone_number || place.international_phone_number || "",
        website: place.website || null,
        google_maps_url: place.url || null,
        category_id: categoryId,
        place_id: place.place_id,
        description: place.editorial_summary?.overview || null,
        price_range: getPriceRange(place.price_level),
        rating: place.rating || null,
        rating_count: place.user_ratings_total || null,
        business_status: place.business_status || null,
        logo_url: logoUrl,
        photos: photos,
        hours: hours,
        weekday_text: place.opening_hours?.weekday_text || null,
      };
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        businesses,
        total: businesses.length,
        message: `Found ${businesses.length} businesses with full details`
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
