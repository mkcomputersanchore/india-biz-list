import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/business/SearchBar';
import { CategoryCard } from '@/components/business/CategoryCard';
import { BusinessCard } from '@/components/business/BusinessCard';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useApprovedBusinesses } from '@/hooks/useBusinesses';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO, generateWebsiteSchema, generateOrganizationSchema, BRAND } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, Shield } from 'lucide-react';

const Index = () => {
  const { settings } = usePlatform();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: businesses, isLoading: businessesLoading } = useApprovedBusinesses();

  const appName = settings?.app_name || BRAND.name;
  const siteUrl = BRAND.url;
  const seoDescription = settings?.seo_description || `Discover trusted local businesses across India. Find restaurants, services, shops and more on ${appName}.`;

  const schema = [
    generateWebsiteSchema(appName, siteUrl),
    generateOrganizationSchema(settings || {}),
  ];

  return (
    <Layout>
      <SEO
        title={settings?.seo_title || `${appName} - Find Local Businesses Across India`}
        description={seoDescription}
        canonicalUrl={siteUrl}
        schema={schema}
      />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Find Local Businesses <br />Across India
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover trusted businesses in your city. From restaurants to services, 
              find everything you need right here.
            </p>
          </div>
          <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">Verified Businesses</h3>
                <p className="text-muted-foreground text-sm">All listings are reviewed and approved by our team</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">Local Community</h3>
                <p className="text-muted-foreground text-sm">Connect with businesses in your neighborhood</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">Trusted Platform</h3>
                <p className="text-muted-foreground text-sm">Secure and reliable business directory</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Browse Categories</h2>
            <Button variant="ghost" asChild>
              <Link to="/categories" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories?.slice(0, 10).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Businesses */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Businesses</h2>
            <Button variant="ghost" asChild>
              <Link to="/businesses" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {businessesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : businesses?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No businesses listed yet. Be the first to list yours!</p>
              <Button asChild className="mt-4">
                <Link to="/auth?mode=signup">List Your Business</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {businesses?.slice(0, 8).map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of businesses across India. List your business today and reach new customers.
          </p>
          <Button size="xl" variant="outline-light" asChild>
            <Link to="/auth?mode=signup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
