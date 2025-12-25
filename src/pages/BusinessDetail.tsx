import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useBusiness } from '@/hooks/useBusinesses';
import { useAuth } from '@/contexts/AuthContext';
import { ClaimBusinessDialog } from '@/components/business/ClaimBusinessDialog';
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
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = useBusiness(slug || '');
  const { user, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-full rounded-xl" />
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

  // Check if user can view this business (approved, or owner, or admin)
  const canView = business && (
    business.status === 'approved' || 
    business.owner_id === user?.id || 
    isAdmin
  );

  if (error || !business || !canView) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Business not found</h2>
            <p className="text-muted-foreground mb-6">
              The business you're looking for doesn't exist or is pending approval.
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
  const hasImage = !!primaryImage;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/businesses" className="text-muted-foreground hover:text-primary transition-colors">
              Businesses
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{business.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Name & Category First */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {business.name}
              </h1>
              {business.category && (
                <Badge variant="secondary" className="text-sm font-medium">
                  {business.category.name}
                </Badge>
              )}
            </div>

            {/* Location & Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                {business.city}, {business.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Listed {format(new Date(business.created_at), 'MMM dd, yyyy')}
              </span>
            </div>

            {/* Image - Smaller if no image */}
            <div className={`relative rounded-xl overflow-hidden bg-muted ${hasImage ? 'aspect-video' : 'aspect-[3/1] max-w-md'}`}>
              {hasImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Description */}
            {business.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed font-normal">
                  {business.description}
                </p>
              </div>
            )}

            {/* Image Gallery */}
            {business.images && business.images.length > 1 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
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
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Address</p>
                    <p className="text-sm text-muted-foreground font-normal">
                      {business.address}<br />
                      {business.city}, {business.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Phone</p>
                    <a 
                      href={`tel:${business.phone}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Email</p>
                    <a 
                      href={`mailto:${business.email}`}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
                
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Website</p>
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {business.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
              <h3 className="text-base font-semibold text-foreground mb-2">Get in Touch</h3>
              <p className="text-sm text-muted-foreground mb-4 font-normal">
                Interested in this business? Contact them directly using the information above.
              </p>
              <Button className="w-full font-semibold" asChild>
                <a href={`tel:${business.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </a>
              </Button>
            </div>

            {/* Claim Business Card */}
            {user && business.owner_id !== user.id && (
              <div className="bg-muted/50 rounded-xl border p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Own This Business?</h3>
                <p className="text-sm text-muted-foreground mb-4 font-normal">
                  If you are the owner of this business, you can claim it to manage the listing.
                </p>
                <ClaimBusinessDialog 
                  businessId={business.id} 
                  businessName={business.name} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
