import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface RecentActivityItemProps {
  title: string;
  timestamp: string;
  link: string;
}

// Helper function to format dates
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

export function RecentActivityItem({ title, timestamp, link }: RecentActivityItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <Link 
          href={link}
          className="font-medium text-foreground hover:text-primary transition-colors truncate block"
        >
          {title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {formatRelativeTime(timestamp)}
        </p>
      </div>
      <Button asChild size="sm" variant="ghost">
        <Link href={link}>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
} 