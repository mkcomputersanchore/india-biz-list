import { Layout } from '@/components/layout/Layout';
import { usePlatform } from '@/contexts/PlatformContext';
import { Building2, Users, Shield, Target } from 'lucide-react';

export default function About() {
  const { settings } = usePlatform();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container-wide text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            About {settings?.app_name || 'LocalBiz India'}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Connecting local businesses with customers across India since 2024
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We believe every local business deserves visibility. Our platform helps businesses 
              reach new customers while helping people discover trusted services in their community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Local First</h3>
              <p className="text-muted-foreground text-sm">
                Supporting local businesses and communities across India
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Community Driven</h3>
              <p className="text-muted-foreground text-sm">
                Built by the community, for the community
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Verified Listings</h3>
              <p className="text-muted-foreground text-sm">
                All businesses are reviewed before being listed
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Easy Discovery</h3>
              <p className="text-muted-foreground text-sm">
                Find exactly what you need with powerful search
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-narrow">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                {settings?.app_name || 'LocalBiz India'} was founded with a simple idea: make it easier for 
                people to discover and connect with local businesses in their area. In a world dominated 
                by large corporations, we believe local businesses are the backbone of our communities.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform provides a space where local entrepreneurs can showcase their products and 
                services, while customers can find trusted businesses that meet their needs. Every listing 
                is verified by our team to ensure quality and authenticity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're looking for a restaurant, a service provider, or a retail store, 
                {settings?.app_name || 'LocalBiz India'} helps you find the best local options. 
                Join us in supporting local businesses and strengthening our communities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}