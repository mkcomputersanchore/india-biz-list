import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BusinessTag {
  id: string;
  tag_id: string | null;
  custom_tag: string | null;
  tag?: {
    id: string;
    name: string;
    slug: string | null;
  };
}

interface BusinessTagsProps {
  tags: BusinessTag[];
}

export function BusinessTags({ tags }: BusinessTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tagAssignment) => (
          <Badge
            key={tagAssignment.id}
            variant="outline"
            className="text-sm font-medium px-3 py-1"
          >
            {tagAssignment.tag?.name || tagAssignment.custom_tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
