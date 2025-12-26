import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useBusiness } from '@/hooks/useBusinesses';
import { useGoogleMapsKey } from '@/hooks/useGoogleMapsKey';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import { ClaimBusinessDialog } from '@/components/business/ClaimBusinessDialog';
import { BusinessHours } from '@/components/business/BusinessHours';
import { BusinessTags } from '@/components/business/BusinessTags';
import { ShareBusiness } from '@/components/business/ShareBusiness';
import { GoogleMap } from '@/components/business/GoogleMap';
import { SEO, generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Tag,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Send,
  Flag
} from 'lucide-react';
import { format } from 'date-fns';

export default function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading, error } = useBusiness(slug || '');
  const { data: mapsApiKey } = useGoogleMapsKey();
  const { user, isAdmin } = useAuth();
  const { settings } = usePlatform();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
        <div className="min-h-screen bg-background">
          <div className="container max-w-6xl mx-auto px-4 py-12">
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

  const getPriceDisplay = (range: string | null) => {
    if (!range) return null;
    switch (range) {
      case 'budget': return '₹';
      case 'moderate': return '₹₹';
      case 'premium': return '₹₹₹';
      case 'luxury': return '₹₹₹₹';
      default: return range;
    }
  };

  const getPriceLabel = (range: string | null) => {
    if (!range) return null;
    switch (range) {
      case 'budget': return 'Budget Friendly';
      case 'moderate': return 'Moderate pricing';
      case 'premium': return 'Premium pricing';
      case 'luxury': return 'Luxury pricing';
      default: return range;
    }
  };

  const getBusinessTypeLabel = (type: string | null) => {
    if (!type) return null;
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const appName = settings?.app_name || 'LocalBiz India';
  const siteUrl = window.location.origin;
  
  const pageTitle = `${business.name} - ${business.city}, ${business.state} | ${appName}`;
  const pageDescription = business.short_description || business.description 
    ? (business.short_description || business.description || '').substring(0, 155) + '...'
    : `${business.name} in ${business.city}, ${business.state}. Contact details, hours, location and more on ${appName}.`;
  
  const canonicalUrl = `${siteUrl}/business/${business.slug}/`;
  
  const breadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'Businesses', url: `${siteUrl}/businesses/` },
    ...(business.category ? [{ name: business.category.name, url: `${siteUrl}/businesses/${business.category.slug || ''}/` }] : []),
    { name: business.name, url: canonicalUrl },
  ];

  const schema = [
    generateLocalBusinessSchema(business),
    generateBreadcrumbSchema(breadcrumbs),
  ];

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        type="business.business"
        image={primaryImage?.image_url || business.logo_url || undefined}
        schema={schema}
      />
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  {/* Business Header */}
                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
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
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Title & Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">
                          {business.name}
                        </h1>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {business.category && (
                          <Badge className="bg-primary/10 text-primary border-0 font-medium">
                            {business.category.name}
                          </Badge>
                        )}
                        {business.price_range && (
                          <span className="text-muted-foreground text-sm font-medium">
                            {getPriceDisplay(business.price_range)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {business.status === 'approved' && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" asChild>
                          <Link to="/contact">
                            <Flag className="h-3 w-3 mr-1" />
                            Report Business
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Section */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
                  {business.description ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {business.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">No description available.</p>
                  )}

                  {/* Business Meta Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    {business.year_established && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Established</p>
                          <p className="font-medium text-sm">{business.year_established}</p>
                        </div>
                      </div>
                    )}
                    {business.price_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Price Range</p>
                          <p className="font-medium text-sm">{getPriceLabel(business.price_range)}</p>
                        </div>
                      </div>
                    )}
                    {business.business_type && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-medium text-sm">{getBusinessTypeLabel(business.business_type)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Amenities Section */}
              {business.amenities && business.amenities.length > 0 && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {business.amenities.map((assignment) => {
                        const amenity = assignment.amenity;
                        if (!amenity) return null;
                        return (
                          <div 
                            key={assignment.id}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="text-primary">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags Section */}
              {business.tags && business.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {business.tags.map((tagAssignment) => {
                        const tagName = tagAssignment.tag?.name || tagAssignment.custom_tag;
                        if (!tagName) return null;
                        return (
                          <Badge 
                            key={tagAssignment.id}
                            className="bg-primary text-primary-foreground font-medium"
                          >
                            #{tagName}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links Section */}
              {(business.facebook_url || business.instagram_url || business.twitter_url || 
                business.youtube_url || business.linkedin_url) && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Follow Us</h2>
                    <div className="flex flex-wrap gap-3">
                      {business.facebook_url && (
                        <Button variant="default" size="sm" className="bg-[#1877F2] hover:bg-[#1877F2]/90" asChild>
                          <a href={business.facebook_url} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                          </a>
                        </Button>
                      )}
                      {business.instagram_url && (
                        <Button variant="default" size="sm" className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90" asChild>
                          <a href={business.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      {business.twitter_url && (
                        <Button variant="default" size="sm" className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90" asChild>
                          <a href={business.twitter_url} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </a>
                        </Button>
                      )}
                      {business.youtube_url && (
                        <Button variant="default" size="sm" className="bg-[#FF0000] hover:bg-[#FF0000]/90" asChild>
                          <a href={business.youtube_url} target="_blank" rel="noopener noreferrer">
                            <Youtube className="h-4 w-4 mr-2" />
                            YouTube
                          </a>
                        </Button>
                      )}
                      {business.linkedin_url && (
                        <Button variant="default" size="sm" className="bg-[#0A66C2] hover:bg-[#0A66C2]/90" asChild>
                          <a href={business.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Business Hours */}
              {business.hours && business.hours.length > 0 && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Business Hours
                    </h2>
                    <BusinessHours hours={business.hours} />
                  </CardContent>
                </Card>
              )}

              {/* Location Section */}
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
                  
                  {mapsApiKey && (
                    <div className="rounded-lg overflow-hidden border mb-4">
                      <GoogleMap
                        address={business.address}
                        city={business.city}
                        state={business.state}
                        apiKey={mapsApiKey}
                        googleMapsUrl={business.google_maps_url}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    {business.google_maps_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={business.google_maps_url} target="_blank" rel="noopener noreferrer">
                          <MapPin className="h-4 w-4 mr-2" />
                          Open in Google Maps
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${business.address}, ${business.city}, ${business.state}`)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Address:</strong> {business.address}, {business.city}, {business.state}
                    {business.pincode && `, ${business.pincode}`}
                  </p>
                </CardContent>
              </Card>

              {/* Gallery */}
              {hasImage && (
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {business.images?.map((image, index) => (
                        <div
                          key={image.id}
                          className="aspect-square rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={image.image_url}
                            alt={`${business.name} ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
              {/* Contact Information Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground">
                          {business.address}<br />
                          {business.city}, {business.state}
                          {business.pincode && ` ${business.pincode}`}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <a 
                          href={`tel:${business.phone}`}
                          className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                        >
                          {business.phone}
                        </a>
                        {business.whatsapp && (
                          <div className="mt-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs border-green-500 text-green-600 hover:bg-green-50" 
                              asChild
                            >
                              <a 
                                href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-sm text-foreground hover:text-primary transition-colors break-all"
                      >
                        {business.email}
                      </a>
                    </div>

                    {/* Alternate Contact */}
                    {(business.alternate_phone || business.alternate_email) && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Additional Contact</p>
                          {business.alternate_phone && (
                            <div className="flex gap-3 mb-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">{business.alternate_phone}</span>
                            </div>
                          )}
                          {business.whatsapp && (
                            <div className="flex gap-3">
                              <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm">WhatsApp</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Business Owner Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Business Owner</h3>
                  <p className="text-sm text-muted-foreground">Contact information available upon request</p>
                </CardContent>
              </Card>

              {/* Get in Touch Card */}
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Get in Touch</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact this business directly for more information
                  </p>
                  
                  <div className="space-y-3">
                    {business.whatsapp && (
                      <Button 
                        className="w-full bg-green-500 hover:bg-green-600 text-white" 
                        asChild
                      >
                        <a 
                          href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    
                    <Button className="w-full" asChild>
                      <a href={`tel:${business.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>

                  <Separator className="my-4" />
                  
                  <p className="text-xs text-muted-foreground mb-3">Share this business</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out ${business.name}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        const url = window.location.href;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                      }}
                    >
                      <Facebook className="h-3 w-3 mr-1" />
                      Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out ${business.name}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                    >
                      <Twitter className="h-3 w-3 mr-1" />
                      Twitter
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Claim Business */}
              {user && business.owner_id !== user.id && (
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Own This Business?</h3>
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
      </div>
    </Layout>
  );
}
