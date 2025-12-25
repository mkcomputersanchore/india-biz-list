import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useBusiness } from '@/hooks/useBusinesses';
import { useGoogleMapsKey } from '@/hooks/useGoogleMapsKey';
import { useAuth } from '@/contexts/AuthContext';
import { ClaimBusinessDialog } from '@/components/business/ClaimBusinessDialog';
import { BusinessHours } from '@/components/business/BusinessHours';
import { BusinessTags } from '@/components/business/BusinessTags';
import { ShareBusiness } from '@/components/business/ShareBusiness';
import { GoogleMap } from '@/components/business/GoogleMap';
import { BusinessAmenities } from '@/components/business/BusinessAmenities';
import { BusinessInfo } from '@/components/business/BusinessInfo';
import { SocialLinks } from '@/components/business/SocialLinks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft,
  Building2,
  Clock,
  MessageCircle,
  ExternalLink,
  Star,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

export default function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = useBusiness(slug || '');
  const { data: mapsApiKey } = useGoogleMapsKey();
  const { user, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
          <div className="container-wide py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-72 w-full rounded-2xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const canView = business && (
    business.status === 'approved' || 
    business.owner_id === user?.id || 
    isAdmin
  );

  if (error || !business || !canView) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
          <div className="container-wide py-12">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Business not found</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                The business you're looking for doesn't exist or is pending approval.
              </p>
              <Button asChild size="lg">
                <Link to="/businesses">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Listings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const primaryImage = business.images?.find(img => img.is_primary) || business.images?.[0];
  const hasImage = !!primaryImage;
  const hasLogo = !!business.logo_url;

  return (
    <Layout>
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-muted/30">
        {/* Breadcrumb */}
        <div className="border-b bg-background/60 backdrop-blur-sm">
          <div className="container-wide py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <Link to="/businesses" className="text-muted-foreground hover:text-primary transition-colors">
                Businesses
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{business.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="container-wide py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className={`
                w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden 
                bg-card border-2 border-background shadow-xl
                flex items-center justify-center
              `}>
                {hasLogo ? (
                  <img 
                    src={business.logo_url!} 
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : hasImage ? (
                  <img 
                    src={primaryImage.image_url} 
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                )}
              </div>
            </div>

            {/* Business Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                      {business.name}
                    </h1>
                    {business.status === 'approved' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {business.short_description && (
                    <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                      {business.short_description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {business.category && (
                      <Badge variant="outline" className="font-medium">
                        {business.category.name}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {business.city}, {business.state}
                    </span>
                    {business.year_established && (
                      <span className="text-muted-foreground">
                        Est. {business.year_established}
                      </span>
                    )}
                  </div>
                </div>
                
                <ShareBusiness businessName={business.name} businessSlug={business.slug} />
              </div>

              {/* Quick Info Badges */}
              <div className="mt-4">
                <BusinessInfo 
                  businessType={business.business_type}
                  priceRange={business.price_range}
                  yearEstablished={null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {hasImage && (
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="aspect-video relative">
                  <img
                    src={primaryImage.image_url}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {business.images && business.images.length > 1 && (
                  <div className="p-4 bg-muted/30">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {business.images.slice(0, 6).map((image, index) => (
                        <div
                          key={image.id}
                          className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={image.image_url}
                            alt={`${business.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* About Section */}
            {business.description && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    About {business.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {business.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Amenities & Features
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.amenities.map((assignment) => {
                      const amenity = assignment.amenity;
                      if (!amenity) return null;
                      return (
                        <div 
                          key={assignment.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                        >
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{amenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {business.tags && business.tags.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Tags
                  </h2>
                  <BusinessTags tags={business.tags} />
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {(business.facebook_url || business.instagram_url || business.twitter_url || 
              business.youtube_url || business.linkedin_url || business.whatsapp || business.telegram) && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Connect With Us
                  </h2>
                  <SocialLinks
                    facebookUrl={business.facebook_url}
                    instagramUrl={business.instagram_url}
                    twitterUrl={business.twitter_url}
                    youtubeUrl={business.youtube_url}
                    linkedinUrl={business.linkedin_url}
                    whatsapp={business.whatsapp}
                    telegram={business.telegram}
                  />
                </CardContent>
              </Card>
            )}

            {/* Google Map */}
            {mapsApiKey && (
              <Card className="border-0 shadow-lg overflow-hidden">
                <GoogleMap
                  address={business.address}
                  city={business.city}
                  state={business.state}
                  apiKey={mapsApiKey}
                  googleMapsUrl={business.google_maps_url}
                />
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact Card */}
            <Card className="border-0 shadow-lg sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Contact Information</h3>
                
                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {business.address}<br />
                        {business.city}, {business.state}
                        {business.pincode && ` - ${business.pincode}`}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Phone</p>
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {business.phone}
                      </a>
                      {business.alternate_phone && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Alt: {business.alternate_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Email</p>
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-sm text-primary hover:underline font-medium break-all"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  {business.website && (
                    <>
                      <Separator />
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Website</p>
                          <a 
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full font-semibold h-12 text-base" size="lg" asChild>
                    <a href={`tel:${business.phone}`}>
                      <Phone className="h-5 w-5 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  
                  {business.whatsapp && (
                    <Button 
                      variant="outline" 
                      className="w-full font-semibold h-12 text-base border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" 
                      size="lg"
                      asChild
                    >
                      <a 
                        href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}

                  {business.website && (
                    <Button variant="outline" className="w-full font-semibold h-12" size="lg" asChild>
                      <a href={business.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-5 w-5 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            {business.hours && business.hours.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Business Hours
                  </h3>
                  <BusinessHours hours={business.hours} />
                </CardContent>
              </Card>
            )}

            {/* Claim Business */}
            {user && business.owner_id !== user.id && (
              <Card className="border-0 bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-2">Own This Business?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claim this listing to manage and update your business information.
                  </p>
                  <ClaimBusinessDialog 
                    businessId={business.id} 
                    businessName={business.name} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Listed Date */}
            <div className="text-center text-sm text-muted-foreground">
              Listed on {format(new Date(business.created_at), 'MMMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
