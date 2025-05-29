'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DynamicLucideIcon } from '@/components/icons/DynamicLucideIcon';
import { PublishedToolMetadata } from '@/app/tools/actions';

interface SmallToolCardProps {
  tool: PublishedToolMetadata;
}

export function SmallToolCard({ tool }: SmallToolCardProps) {
  // Truncate description for compact display
  const truncateDescription = (text: string | null, maxLength: number = 80) => {
    if (!text) return 'AI-powered name generator';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Link href={`/tools/${tool.slug}`} className="block group">
      <Card className={`h-full hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-border/50 hover:border-border ${tool.accent_color_class || ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <DynamicLucideIcon 
                iconName={tool.icon_name} 
                className={`h-6 w-6 ${tool.accent_color_class || 'text-primary'}`} 
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {tool.name}
                </h3>
                {tool.category && (
                  <Badge variant="outline" className="text-xs shrink-0 ml-2">
                    {tool.category}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {truncateDescription(tool.description)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 