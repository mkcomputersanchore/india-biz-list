import { useState } from 'react';
import { useAllBusinesses } from '@/hooks/useAdmin';
import { useToggleFeatured } from '@/hooks/useFeatured';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Star,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFeatured() {
  const { data: businesses, isLoading } = useAllBusinesses();
  const toggleFeatured = useToggleFeatured();
  
  const [search, setSearch] = useState('');

  // Only show approved businesses
  const approvedBusinesses = businesses?.filter(b => b.status === 'approved');
  
  const filteredBusinesses = approvedBusinesses?.filter((business) => {
    return business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.city.toLowerCase().includes(search.toLowerCase());
  });

  // Sort: featured first, then by name
  const sortedBusinesses = filteredBusinesses?.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return a.name.localeCompare(b.name);
  });

  const featuredCount = approvedBusinesses?.filter(b => b.is_featured).length || 0;

  const handleToggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      await toggleFeatured.mutateAsync({ id, is_featured: !currentValue });
      toast.success(currentValue ? 'Business unfeatured' : 'Business featured');
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Featured Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Manage which businesses appear as featured on the homepage
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-primary fill-primary" />
          <div>
            <p className="font-semibold text-lg">{featuredCount} Featured</p>
            <p className="text-sm text-muted-foreground">
              out of {approvedBusinesses?.length || 0} approved businesses
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Business List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedBusinesses && sortedBusinesses.length > 0 ? (
        <div className="space-y-3">
          {sortedBusinesses.map((business) => (
            <div
              key={business.id}
              className={`bg-card rounded-xl border p-4 transition-colors ${
                business.is_featured ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Business Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {business.images?.[0] ? (
                    <img
                      src={business.images[0].image_url}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{business.name}</h3>
                    {business.is_featured && (
                      <Badge variant="default" className="bg-primary">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {business.category?.name} • {business.city}, {business.state}
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {business.is_featured ? 'Featured' : 'Not Featured'}
                  </span>
                  <Switch
                    checked={business.is_featured || false}
                    onCheckedChange={() => handleToggleFeatured(business.id, business.is_featured || false)}
                    disabled={toggleFeatured.isPending}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
          <p className="text-muted-foreground">
            {search 
              ? 'Try adjusting your search' 
              : 'No approved businesses available yet'
            }
          </p>
        </div>
      )}
    </div>
  );
}
