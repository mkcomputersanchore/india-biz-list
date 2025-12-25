import { useSearchParams, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/business/SearchBar';
import { BusinessCard } from '@/components/business/BusinessCard';
import { useApprovedBusinesses } from '@/hooks/useBusinesses';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

export default function Businesses() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';

  const { data: categories } = useCategories();
  const selectedCategory = categories?.find(c => c.slug === categorySlug);

  const { data: businesses, isLoading } = useApprovedBusinesses({
    search: search || undefined,
    categorySlug: categorySlug || undefined,
    city: city || undefined,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {selectedCategory ? selectedCategory.name : 'All Businesses'}
          </h1>
          <SearchBar 
            initialSearch={search} 
            initialCategory={categorySlug || ''} 
            initialCity={city} 
          />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container-wide">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {isLoading 
                ? 'Loading...' 
                : `${businesses?.length || 0} businesses found`
              }
              {(search || city) && (
                <span>
                  {search && ` for "${search}"`}
                  {city && ` in ${city}`}
                </span>
              )}
            </p>
          </div>

          {/* Business Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : businesses && businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <div
                  key={business.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BusinessCard business={business} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search filters or browse all categories
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
