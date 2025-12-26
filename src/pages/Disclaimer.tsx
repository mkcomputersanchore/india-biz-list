import { Layout } from '@/components/layout/Layout';
import { usePlatform } from '@/contexts/PlatformContext';
import { SEO } from '@/components/SEO';

export default function Disclaimer() {
  const { settings } = usePlatform();
  const appName = settings?.app_name || 'LocalBiz India';
  const siteUrl = window.location.origin;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Disclaimer - ${appName}`,
    description: `Disclaimer for ${appName}. Important legal information about using our business directory platform.`,
    url: `${siteUrl}/disclaimer`,
    mainEntity: {
      '@type': 'WebContent',
      about: {
        '@type': 'Thing',
        name: 'Disclaimer',
      },
    },
  };

  return (
    <Layout>
      <SEO
        title={`Disclaimer - ${appName}`}
        description={`Disclaimer for ${appName}. Important legal information about using our business directory platform and business listings.`}
        canonicalUrl={`${siteUrl}/disclaimer`}
        schema={schema}
      />
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container-wide text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Disclaimer
          </h1>
          <p className="text-lg text-white/80">
            Last updated: December 2024
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-narrow">
          <div className="prose prose-slate max-w-none">
            <h2>General Disclaimer</h2>
            <p>
              The information provided on {appName} is for general informational purposes only. All information 
              on the site is provided in good faith, however, we make no representation or warranty of any kind, 
              express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or 
              completeness of any information on the site.
            </p>

            <h2>Business Listings Disclaimer</h2>
            <p>
              While we strive to verify the accuracy of business listings on our platform, {appName} does not 
              guarantee, endorse, or recommend any business listed on the platform. The inclusion of a business 
              listing does not imply our endorsement of that business or the quality of its products or services.
            </p>
            <p>
              Users are encouraged to conduct their own research and due diligence before engaging with any 
              business found through our platform. We recommend:
            </p>
            <ul>
              <li>Verifying business credentials and licenses independently</li>
              <li>Checking reviews from multiple sources</li>
              <li>Confirming contact information directly with the business</li>
              <li>Understanding the terms and conditions of any transaction</li>
            </ul>

            <h2>External Links Disclaimer</h2>
            <p>
              The site may contain links to external websites that are not provided or maintained by or in any 
              way affiliated with {appName}. Please note that we do not guarantee the accuracy, relevance, 
              timeliness, or completeness of any information on these external websites.
            </p>

            <h2>No Professional Advice</h2>
            <p>
              The site cannot and does not contain professional advice. The information is provided for general 
              informational and educational purposes only and is not a substitute for professional advice. 
              Accordingly, before taking any actions based upon such information, we encourage you to consult 
              with appropriate professionals.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Under no circumstances shall {appName} be held responsible or liable in any way for any claims, 
              damages, losses, expenses, costs, or liabilities whatsoever (including, without limitation, any 
              direct or indirect damages for loss of profits, business interruption, or loss of information) 
              resulting or arising directly or indirectly from:
            </p>
            <ul>
              <li>Your use of or inability to use the site or its content</li>
              <li>Any reliance on information provided through the site</li>
              <li>Any transaction or interaction with businesses listed on the platform</li>
              <li>Any unauthorized access to or use of our servers</li>
            </ul>

            <h2>Accuracy of Information</h2>
            <p>
              Business information, including but not limited to hours of operation, contact details, services 
              offered, and pricing, is provided by the businesses themselves and may change without notice. 
              {appName} is not responsible for any inaccuracies or outdated information.
            </p>

            <h2>User Responsibility</h2>
            <p>
              By using {appName}, you acknowledge and agree that you use the platform at your own risk. You are 
              solely responsible for any decisions or actions you take based on the information available on our 
              platform.
            </p>

            <h2>Changes to This Disclaimer</h2>
            <p>
              We reserve the right to modify this disclaimer at any time. Changes will be effective immediately 
              upon posting to the website. Your continued use of the site following the posting of any changes 
              constitutes acceptance of those changes.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us:
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