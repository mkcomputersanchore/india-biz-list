import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/lib/types';
import { 
  Utensils, 
  Hotel, 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Wrench, 
  Home, 
  Car, 
  Sparkles, 
  Dumbbell,
  LucideIcon,
  Folder
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  hotel: Hotel,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  'shopping-bag': ShoppingBag,
  wrench: Wrench,
  home: Home,
  car: Car,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = category.icon ? iconMap[category.icon] || Folder : Folder;

  return (
    <Link to={`/businesses?category=${category.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <IconComponent className="h-7 w-7" />
          </div>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
