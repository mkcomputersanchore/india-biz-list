import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  address: string;
  city: string;
  state: string;
  apiKey: string;
  googleMapsUrl?: string | null;
}

export function GoogleMap({ address, city, state, apiKey, googleMapsUrl }: GoogleMapProps) {
  const fullAddress = `${address}, ${city}, ${state}, India`;
  const encodedAddress = encodeURIComponent(fullAddress);
  
  // Use custom Google Maps URL if provided, otherwise use address-based embed
  const getDirectionsUrl = () => {
    if (googleMapsUrl) return googleMapsUrl;
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  return (
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </h3>
      </div>
      <div className="aspect-video relative">
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title={`Map showing ${fullAddress}`}
        />
      </div>
      <div className="p-4 bg-muted/30">
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
