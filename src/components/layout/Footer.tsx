import { Link } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { settings } = usePlatform();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.app_name || 'Logo'} 
                  className="h-8 w-auto brightness-0 invert"
                />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
              <span className="font-display text-xl font-bold">
                {settings?.app_name || 'LocalBiz India'}
              </span>
            </Link>
            <p className="text-background/70 max-w-md">
              Discover and connect with local businesses across India. 
              Your trusted platform for finding the best services in your city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/businesses" className="text-background/70 hover:text-background transition-colors">
                  Browse Businesses
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-background/70 hover:text-background transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-background/70 hover:text-background transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-background/70 hover:text-background transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup" className="text-background/70 hover:text-background transition-colors">
                  List Your Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              {settings?.contact_email && (
                <li className="flex items-center gap-2 text-background/70">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-background transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.contact_phone && (
                <li className="flex items-center gap-2 text-background/70">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-background transition-colors">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2 text-background/70">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/50 text-sm">
          <p>© {new Date().getFullYear()} {settings?.app_name || 'LocalBiz India'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
