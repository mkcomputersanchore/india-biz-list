import { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/business/SearchBar';
import { BusinessCard } from '@/components/business/BusinessCard';
import { useApprovedBusinesses } from '@/hooks/useBusinesses';
import { useCategories } from '@/hooks/useCategories';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO, generateItemListSchema, generateBreadcrumbSchema, BRAND } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function Businesses() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const { settings } = usePlatform();

  const { data: categories } = useCategories();
  const selectedCategory = categories?.find(c => c.slug === categorySlug);

  const { data: businesses, isLoading } = useApprovedBusinesses({
    search: search || undefined,
    categorySlug: categorySlug || undefined,
    city: city || undefined,
  });

  const totalItems = businesses?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBusinesses = businesses?.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const appName = settings?.app_name || BRAND.name;
  const siteUrl = BRAND.url;
  
  const pageTitle = selectedCategory 
    ? `${selectedCategory.name} Businesses - ${appName}`
    : `All Businesses - ${appName}`;
  
  const pageDescription = selectedCategory
    ? `Find the best ${selectedCategory.name.toLowerCase()} businesses in India. Browse verified listings with contact details, hours, and reviews.`
    : `Discover trusted local businesses across India. Browse our directory of verified businesses with contact details, hours, and reviews.`;

  const canonicalUrl = categorySlug 
    ? `${siteUrl}/businesses/${categorySlug}/`
    : `${siteUrl}/businesses/`;

  const breadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'Businesses', url: `${siteUrl}/businesses/` },
    ...(selectedCategory ? [{ name: selectedCategory.name, url: `${siteUrl}/businesses/${categorySlug}/` }] : []),
  ];

  const schema = [
    generateBreadcrumbSchema(breadcrumbs),
    ...(businesses?.length ? [generateItemListSchema(businesses, siteUrl)] : []),
  ];

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        schema={schema}
      />
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
                : `${totalItems} businesses found`
              }
              {(search || city) && (
                <span>
                  {search && ` for "${search}"`}
                  {city && ` in ${city}`}
                </span>
              )}
              {totalPages > 1 && !isLoading && (
                <span className="ml-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>

          {/* Business Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : paginatedBusinesses && paginatedBusinesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBusinesses.map((business, index) => (
                  <div
                    key={business.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <BusinessCard business={business} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and adjacent pages
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      Math.abs(page - currentPage) <= 1;
                    
                    if (!showPage) {
                      // Show ellipsis only once between gaps
                      if (page === 2 && currentPage > 3) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }
                      if (page === totalPages - 1 && currentPage < totalPages - 2) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
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
