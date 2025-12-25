import { Badge } from '@/components/ui/badge';
import type { BusinessStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: BusinessStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  
  return <Badge variant={variant}>{label}</Badge>;
}
