import { Layout } from '@/components/layout/Layout';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO, BRAND } from '@/components/SEO';

export default function Terms() {
  const { settings } = usePlatform();
  const appName = settings?.app_name || BRAND.name;
  const siteUrl = BRAND.url;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Terms of Service - ${appName}`,
    description: `Terms of service for ${appName}. Understand the rules and guidelines for using our business directory platform.`,
    url: `${siteUrl}/terms`,
    mainEntity: {
      '@type': 'WebContent',
      about: {
        '@type': 'Thing',
        name: 'Terms of Service',
      },
    },
  };

  return (
    <Layout>
      <SEO
        title={`Terms of Service - ${appName}`}
        description={`Terms of service for ${appName}. Understand the rules and guidelines for using our business directory platform.`}
        canonicalUrl={`${siteUrl}/terms`}
        schema={schema}
      />
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container-wide text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-white/80">
            Last updated: December 2024
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-narrow">
          <div className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using {appName}, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              {appName} is a business directory platform that allows users to discover local businesses and 
              allows business owners to list their businesses. We provide a platform for connecting businesses 
              with potential customers.
            </p>

            <h2>3. User Accounts</h2>
            <p>To use certain features of our service, you must register for an account. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h2>4. Business Listings</h2>
            <p>When listing a business on our platform, you agree that:</p>
            <ul>
              <li>You have the authority to list the business</li>
              <li>All information provided is accurate and truthful</li>
              <li>You will keep your listing information up to date</li>
              <li>Your listing complies with all applicable laws and regulations</li>
              <li>We reserve the right to approve, reject, or remove any listing at our discretion</li>
            </ul>

            <h2>5. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose</li>
              <li>Post false, inaccurate, or misleading content</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service to send spam or unsolicited communications</li>
              <li>Collect or store personal data about other users without their consent</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by {appName} and 
              are protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>

            <h2>7. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the 
              service will be uninterrupted, timely, secure, or error-free. We do not guarantee the accuracy 
              or reliability of any information obtained through the service.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall {appName}, its directors, employees, partners, agents, or affiliates be liable 
              for any indirect, incidental, special, consequential, or punitive damages resulting from your 
              access to or use of, or inability to access or use, the service.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these terms at any time. We will provide notice of 
              any changes by posting the new terms on this page. Your continued use of the service after any 
              such changes constitutes your acceptance of the new terms.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
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