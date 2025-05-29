'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicLucideIcon } from '@/components/icons/DynamicLucideIcon';
import { PublishedToolMetadata } from '@/app/tools/actions';

interface ToolCardProps {
  tool: PublishedToolMetadata;
}

export function ToolCard({ tool }: ToolCardProps) {
  // Truncate description for card display
  const truncateDescription = (text: string | null, maxLength: number = 120) => {
    if (!text) return 'Generate unique names with this AI-powered tool.';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card className={`group h-full flex flex-col hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-border/50 hover:border-border ${tool.accent_color_class || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Icon with accent color if provided */}
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <DynamicLucideIcon 
                iconName={tool.icon_name} 
                className={`h-8 w-8 ${tool.accent_color_class || 'text-primary'}`} 
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Non-truncating title - allows wrapping */}
              <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {tool.name}
              </CardTitle>
            </div>
          </div>
          {tool.category && (
            <Badge variant="secondary" className="text-xs shrink-0 ml-2">
              {tool.category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pb-4">
        <CardDescription className="text-muted-foreground flex-1 line-clamp-3">
          {truncateDescription(tool.description)}
        </CardDescription>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          asChild 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
        >
          <Link href={`/tools/${tool.slug}`}>
            Try the Tool
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 