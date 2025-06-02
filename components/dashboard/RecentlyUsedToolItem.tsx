import Link from 'next/link';
import { RecentToolInteraction } from '@/lib/types/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Wrench } from 'lucide-react';

interface RecentlyUsedToolItemProps {
  interaction: RecentToolInteraction;
}

export function RecentlyUsedToolItem({ interaction }: RecentlyUsedToolItemProps) {
  // Format the last used date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <Link 
          href={`/tools/${interaction.tool_slug}`}
          className="block space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Tool Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {interaction.tool_icon ? (
                  <span className="text-lg">{interaction.tool_icon}</span>
                ) : (
                  <Wrench className="w-5 h-5 text-primary" />
                )}
              </div>
              
              {/* Tool Name and Category */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {interaction.tool_name || interaction.tool_slug}
                </h3>
                {interaction.tool_category && (
                  <p className="text-sm text-muted-foreground truncate">
                    {interaction.tool_category}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Last Used Time */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Used {formatDate(interaction.last_used_at)}</span>
          </div>
          
          {/* Tool Description (if available) */}
          {interaction.tool_description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {interaction.tool_description}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
} 