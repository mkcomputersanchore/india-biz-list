import { Link } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Building2, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const { settings } = usePlatform();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.app_name || 'Logo'} 
                  className="h-10 w-auto rounded-lg"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="font-display text-xl font-bold text-white">
                {settings?.app_name || 'Near India'}
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Discover and connect with verified local businesses in India. Building stronger communities through trusted business connections.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/businesses" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5 text-white">For Businesses</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <Link to="/business/new" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Add Your Business
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Browse Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-display text-base font-semibold mb-5 text-white">Contact & Support</h3>
            <ul className="space-y-3">
              {settings?.contact_email && (
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors text-sm">
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-center gap-2 text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{settings.address}</span>
                </li>
              )}
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {settings?.app_name || 'Near India'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
              Privacy
            </Link>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
              Terms
            </Link>
            <Link to="/disclaimer" className="text-slate-400 hover:text-white transition-colors text-sm">
              Disclaimer
            </Link>
            <a 
              href="/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
