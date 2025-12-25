import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useBusiness } from '@/hooks/useBusinesses';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft,
  Building2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: business, isLoading, error } = useBusiness(id || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !business) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Business not found</h2>
            <p className="text-muted-foreground mb-6">
              The business you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/businesses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const primaryImage = business.images?.find(img => img.is_primary) || business.images?.[0];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/businesses" className="text-muted-foreground hover:text-foreground">
              Businesses
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{business.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              {primaryImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-24 w-24 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Business Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{business.name}</h1>
                  {business.category && (
                    <Badge variant="secondary" className="text-sm">
                      {business.category.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {business.city}, {business.state}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Listed {format(new Date(business.created_at), 'MMM dd, yyyy')}
                </span>
              </div>

              {business.description && (
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {business.images && business.images.length > 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {business.images.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square rounded-xl overflow-hidden bg-muted"
                    >
                      <img
                        src={image.image_url}
                        alt={`${business.name} gallery`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-card rounded-2xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {business.address}<br />
                      {business.city}, {business.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
                
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
              <h3 className="text-lg font-semibold mb-2">Get in Touch</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in this business? Contact them directly using the information above.
              </p>
              <Button className="w-full" asChild>
                <a href={`tel:${business.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
