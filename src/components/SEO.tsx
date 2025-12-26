import { Helmet } from 'react-helmet-async';

// Brand configuration
export const BRAND = {
  name: 'Near India',
  domain: 'nearindia.in',
  url: 'https://nearindia.in',
};

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'business.business';
  image?: string;
  noIndex?: boolean;
  schema?: object | object[];
}

export function SEO({
  title,
  description,
  canonicalUrl,
  type = 'website',
  image,
  noIndex = false,
  schema,
}: SEOProps) {
  const siteUrl = window.location.origin;
  const fullCanonicalUrl = canonicalUrl || window.location.href;
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={truncatedDescription} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={truncatedDescription} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={truncatedDescription} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : schema)}
        </script>
      )}
    </Helmet>
  );
}

// Helper to generate LocalBusiness schema
export function generateLocalBusinessSchema(business: {
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  pincode?: string | null;
  phone: string;
  email: string;
  website?: string | null;
  logo_url?: string | null;
  images?: { image_url: string; is_primary?: boolean | null }[];
  hours?: {
    day_of_week: number;
    is_closed: boolean;
    open_time?: string | null;
    close_time?: string | null;
  }[];
  category?: { name: string } | null;
  price_range?: string | null;
}) {
  const primaryImage = business.images?.find(img => img.is_primary) || business.images?.[0];
  
  const getPriceRange = (range: string | null) => {
    if (!range) return undefined;
    switch (range) {
      case 'budget': return '$';
      case 'moderate': return '$$';
      case 'premium': return '$$$';
      case 'luxury': return '$$$$';
      default: return undefined;
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const openingHours = business.hours
    ?.filter(h => !h.is_closed && h.open_time && h.close_time)
    .map(h => `${getDayName(h.day_of_week)} ${h.open_time}-${h.close_time}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description || undefined,
    image: primaryImage?.image_url || business.logo_url || undefined,
    logo: business.logo_url || undefined,
    telephone: business.phone,
    email: business.email,
    url: business.website || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.pincode || undefined,
      addressCountry: 'IN',
    },
    ...(business.category && { '@type': ['LocalBusiness', business.category.name] }),
    priceRange: getPriceRange(business.price_range),
    openingHours: openingHours?.length ? openingHours : undefined,
  };
}

// Helper to generate WebSite schema
export function generateWebsiteSchema(appName: string, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/businesses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Helper to generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper to generate Organization schema
export function generateOrganizationSchema(settings: {
  app_name?: string;
  logo_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.app_name || BRAND.name,
    url: BRAND.url,
    logo: settings.logo_url || undefined,
    contactPoint: settings.contact_email || settings.contact_phone ? {
      '@type': 'ContactPoint',
      email: settings.contact_email || undefined,
      telephone: settings.contact_phone || undefined,
      contactType: 'customer service',
    } : undefined,
  };
}

// Helper to generate ItemList schema for directory pages
export function generateItemListSchema(
  businesses: { name: string; slug?: string | null }[],
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: businesses.slice(0, 10).map((business, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: business.name,
      url: `${siteUrl}/business/${business.slug}/`,
    })),
  };
}
