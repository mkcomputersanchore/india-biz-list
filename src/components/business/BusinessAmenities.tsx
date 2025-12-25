import { 
  Wifi, 
  Car, 
  Truck, 
  Snowflake, 
  Accessibility, 
  CreditCard, 
  Clock, 
  Shield, 
  Dog, 
  TreeDeciduous, 
  Music, 
  Key,
  Coffee,
  Utensils,
  Dumbbell,
  Bath,
  Tv,
  Zap,
  Heart,
  Star,
  CheckCircle
} from 'lucide-react';
import type { BusinessAmenityAssignment } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Car, Truck, Snowflake, Accessibility, CreditCard, Clock, Shield,
  Dog, TreeDeciduous, Music, Key, Coffee, Utensils, Dumbbell, Bath, Tv, Zap, Heart, Star
};

interface BusinessAmenitiesProps {
  amenities: BusinessAmenityAssignment[];
}

export function BusinessAmenities({ amenities }: BusinessAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-4">Amenities</h3>
      <div className="grid grid-cols-2 gap-3">
        {amenities.map((assignment) => {
          const amenity = assignment.amenity;
          if (!amenity) return null;
          
          const IconComponent = amenity.icon ? ICON_MAP[amenity.icon] : CheckCircle;
          
          return (
            <div 
              key={assignment.id}
              className="flex items-center gap-2 text-sm"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <IconComponent className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
