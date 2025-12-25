import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone } from 'lucide-react';
import type { Business } from '@/lib/types';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const primaryImage = business.images?.find(img => img.is_primary) || business.images?.[0];

  return (
    <Link to={`/business/${business.slug || business.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-display text-primary/30">
                {business.name.charAt(0)}
              </span>
            </div>
          )}
          {business.category && (
            <Badge variant="category" className="absolute top-3 left-3">
              {business.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {business.name}
          </h3>
          {business.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {business.description}
            </p>
          )}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{business.city}, {business.state}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{business.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
