import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  Calendar,
  Store,
  ShoppingCart,
  Briefcase,
  Globe2
} from 'lucide-react';
import type { BusinessType, PriceRange } from '@/lib/types';

const BUSINESS_TYPE_LABELS: Record<BusinessType, { label: string; icon: React.ReactNode }> = {
  local_business: { label: 'Local Business', icon: <Store className="h-4 w-4" /> },
  franchise: { label: 'Franchise', icon: <Building2 className="h-4 w-4" /> },
  online_store: { label: 'Online Store', icon: <ShoppingCart className="h-4 w-4" /> },
  service_business: { label: 'Service Business', icon: <Briefcase className="h-4 w-4" /> },
};

const PRICE_RANGE_LABELS: Record<PriceRange, { label: string; symbol: string }> = {
  budget: { label: 'Budget', symbol: '₹' },
  moderate: { label: 'Moderate', symbol: '₹₹' },
  expensive: { label: 'Expensive', symbol: '₹₹₹' },
  luxury: { label: 'Luxury', symbol: '₹₹₹₹' },
};

interface BusinessInfoProps {
  businessType?: BusinessType | null;
  priceRange?: PriceRange | null;
  yearEstablished?: number | null;
}

export function BusinessInfo({ businessType, priceRange, yearEstablished }: BusinessInfoProps) {
  if (!businessType && !priceRange && !yearEstablished) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {businessType && BUSINESS_TYPE_LABELS[businessType] && (
        <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3">
          {BUSINESS_TYPE_LABELS[businessType].icon}
          {BUSINESS_TYPE_LABELS[businessType].label}
        </Badge>
      )}
      
      {priceRange && PRICE_RANGE_LABELS[priceRange] && (
        <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3">
          <DollarSign className="h-4 w-4" />
          {PRICE_RANGE_LABELS[priceRange].symbol} • {PRICE_RANGE_LABELS[priceRange].label}
        </Badge>
      )}
      
      {yearEstablished && (
        <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3">
          <Calendar className="h-4 w-4" />
          Est. {yearEstablished}
        </Badge>
      )}
    </div>
  );
}
