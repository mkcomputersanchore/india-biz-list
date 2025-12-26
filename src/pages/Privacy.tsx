import { Layout } from '@/components/layout/Layout';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO, BRAND } from '@/components/SEO';

export default function Privacy() {
  const { settings } = usePlatform();
  const appName = settings?.app_name || BRAND.name;
  const siteUrl = BRAND.url;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy - ${appName}`,
    description: `Privacy policy for ${appName}. Learn how we collect, use, and protect your personal information.`,
    url: `${siteUrl}/privacy`,
    mainEntity: {
      '@type': 'WebContent',
      about: {
        '@type': 'Thing',
        name: 'Privacy Policy',
      },
    },
  };

  return (
    <Layout>
      <SEO
        title={`Privacy Policy - ${appName}`}
        description={`Privacy policy for ${appName}. Learn how we collect, use, and protect your personal information on our business directory platform.`}
        canonicalUrl={`${siteUrl}/privacy`}
        schema={schema}
      />
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container-wide text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/80">
            Last updated: December 2024
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-narrow">
          <div className="prose prose-slate max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to {appName}. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              website and tell you about your privacy rights.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
            <ul>
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address, telephone numbers, and business address.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, 
              time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process business listings and manage your account</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent security incidents</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information with service providers who assist us in operating our website and conducting our 
              business, as long as those parties agree to keep this information confidential.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being 
              accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal 
              data to those employees and partners who have a business need to know.
            </p>

            <h2>6. Your Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
            <ul>
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our service and store 
              certain information. You can instruct your browser to refuse all cookies or to indicate when a 
              cookie is being sent.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new privacy policy on this page and updating the "Last updated" date.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              {settings?.contact_email && <li>By email: {settings.contact_email}</li>}
              {settings?.contact_phone && <li>By phone: {settings.contact_phone}</li>}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}