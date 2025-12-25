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
  url?: string;
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
  business_status?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!googleApiKey) {
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { businessName, city } = await req.json();
    
    console.log(`Rescaping business: "${businessName}" in ${city}`);

    // Search for the business
    const query = `${businessName} in ${city}, India`;
    const encodedQuery = encodeURIComponent(query);
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${googleApiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" || !searchData.results?.length) {
      console.log(`No results found for: ${businessName}`);
      return new Response(
        JSON.stringify({ success: false, error: "Business not found on Google" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the best match (first result)
    const place = searchData.results[0];
    
    // Get detailed info
    const detailFields = [
      'name', 'formatted_address', 'formatted_phone_number', 'international_phone_number',
      'website', 'url', 'geometry', 'opening_hours', 'photos', 'rating', 'user_ratings_total',
      'price_level', 'editorial_summary', 'icon', 'business_status', 'types'
    ].join(',');
    
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=${detailFields}&key=${googleApiKey}`;
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    if (!detailData.result) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not fetch business details" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const placeResult: PlaceResult = {
      ...detailData.result,
      place_id: place.place_id,
      types: detailData.result.types || place.types || [],
    };

    // Helper functions
    const getPhotoUrl = (photoRef: string, maxWidth = 800) => {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${googleApiKey}`;
    };

    const getPriceRange = (priceLevel?: number) => {
      if (priceLevel === undefined) return null;
      switch (priceLevel) {
        case 0: case 1: return 'budget';
        case 2: return 'moderate';
        case 3: return 'premium';
        case 4: return 'luxury';
        default: return null;
      }
    };

    const parseOpeningHours = (openingHours?: PlaceResult['opening_hours']) => {
      if (!openingHours?.periods) return null;
      
      const hours: Array<{
        day_of_week: number;
        open_time: string | null;
        close_time: string | null;
        is_closed: boolean;
      }> = [];

      for (let i = 0; i < 7; i++) {
        hours.push({ day_of_week: i, open_time: null, close_time: null, is_closed: true });
      }

      if (openingHours.periods.length === 1 && 
          openingHours.periods[0].open?.time === '0000' && 
          !openingHours.periods[0].close) {
        for (let i = 0; i < 7; i++) {
          hours[i] = { day_of_week: i, open_time: '00:00', close_time: '23:59', is_closed: false };
        }
        return hours;
      }

      for (const period of openingHours.periods) {
        const dayIndex = period.open.day;
        const openTime = period.open.time.substring(0, 2) + ':' + period.open.time.substring(2);
        const closeTime = period.close 
          ? period.close.time.substring(0, 2) + ':' + period.close.time.substring(2)
          : '23:59';
        hours[dayIndex] = { day_of_week: dayIndex, open_time: openTime, close_time: closeTime, is_closed: false };
      }

      return hours;
    };

    // Extract city and state from address
    const addressParts = placeResult.formatted_address?.split(",") || [];
    const extractedCity = addressParts.length > 2 ? addressParts[addressParts.length - 3]?.trim() : city;
    const stateWithPincode = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : "";
    const extractedState = stateWithPincode.replace(/\d+/g, '').trim() || "Gujarat";
    const pincode = stateWithPincode.match(/\d+/)?.[0] || null;

    // Get photos
    const photos = placeResult.photos?.slice(0, 10).map(photo => ({
      photo_reference: photo.photo_reference,
      url: getPhotoUrl(photo.photo_reference),
      is_primary: false,
    })) || [];
    
    if (photos.length > 0) {
      photos[0].is_primary = true;
    }

    const logoUrl = photos.length > 0 ? getPhotoUrl(photos[0].photo_reference, 200) : null;
    const hours = parseOpeningHours(placeResult.opening_hours);

    const businessData = {
      name: placeResult.name,
      address: placeResult.formatted_address || "",
      city: extractedCity || city,
      state: extractedState,
      pincode: pincode,
      phone: placeResult.formatted_phone_number || placeResult.international_phone_number || "",
      website: placeResult.website || null,
      google_maps_url: placeResult.url || null,
      description: placeResult.editorial_summary?.overview || null,
      price_range: getPriceRange(placeResult.price_level),
      logo_url: logoUrl,
      photos: photos,
      hours: hours,
      weekday_text: placeResult.opening_hours?.weekday_text || null,
    };

    console.log(`Successfully fetched data for: ${placeResult.name}`);

    return new Response(
      JSON.stringify({ success: true, business: businessData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in rescrape-business:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
