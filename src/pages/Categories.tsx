import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/business/CategoryCard';
import { useCategories } from '@/hooks/useCategories';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO, generateBreadcrumbSchema, BRAND } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3X3 } from 'lucide-react';

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const { settings } = usePlatform();

  const appName = settings?.app_name || BRAND.name;
  const siteUrl = BRAND.url;

  const breadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'Categories', url: `${siteUrl}/categories` },
  ];

  const schema = [
    generateBreadcrumbSchema(breadcrumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Business Categories - ${appName}`,
      description: `Browse all business categories on ${appName}. Find restaurants, services, shops and more.`,
      url: `${siteUrl}/categories`,
    },
  ];

  return (
    <Layout>
      <SEO
        title={`Business Categories - ${appName}`}
        description={`Browse all business categories on ${appName}. Find restaurants, services, retail shops, healthcare providers, and more across India.`}
        canonicalUrl={`${siteUrl}/categories`}
        schema={schema}
      />
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container-wide text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Explore businesses across different categories and find exactly what you're looking for
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Grid3X3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground">
                Categories will appear here once they are added by the admin.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}