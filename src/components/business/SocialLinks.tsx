import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin,
  MessageCircle,
  Send
} from 'lucide-react';

interface SocialLinksProps {
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
}

export function SocialLinks({
  facebookUrl,
  instagramUrl,
  twitterUrl,
  youtubeUrl,
  linkedinUrl,
  whatsapp,
  telegram,
}: SocialLinksProps) {
  const links = [
    { url: facebookUrl, icon: Facebook, label: 'Facebook', color: 'hover:text-blue-600 hover:border-blue-600' },
    { url: instagramUrl, icon: Instagram, label: 'Instagram', color: 'hover:text-pink-600 hover:border-pink-600' },
    { url: twitterUrl, icon: Twitter, label: 'Twitter', color: 'hover:text-sky-500 hover:border-sky-500' },
    { url: youtubeUrl, icon: Youtube, label: 'YouTube', color: 'hover:text-red-600 hover:border-red-600' },
    { url: linkedinUrl, icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-700 hover:border-blue-700' },
    { 
      url: whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : null, 
      icon: MessageCircle, 
      label: 'WhatsApp', 
      color: 'hover:text-green-600 hover:border-green-600' 
    },
    { 
      url: telegram ? `https://t.me/${telegram.replace('@', '')}` : null, 
      icon: Send, 
      label: 'Telegram', 
      color: 'hover:text-sky-500 hover:border-sky-500' 
    },
  ].filter(link => link.url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          size="sm"
          asChild
          className={`transition-colors ${link.color}`}
        >
          <a href={link.url!} target="_blank" rel="noopener noreferrer">
            <link.icon className="h-4 w-4 mr-2" />
            {link.label}
          </a>
        </Button>
      ))}
    </div>
  );
}
