'use client';

import Link from 'next/link';
import { SavedName } from '@/lib/types/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Calendar } from 'lucide-react';
import { useState } from 'react';

interface RecentlySavedNameItemProps {
  savedName: SavedName;
}

export function RecentlySavedNameItem({ savedName }: RecentlySavedNameItemProps) {
  const [copied, setCopied] = useState(false);

  // Format the saved date
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

  // Handle copy to clipboard
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(savedName.name_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy name:', error);
    }
  };

  // Format tool name from slug
  const formatToolName = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Name and Copy Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {savedName.name_text}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                <span>Saved {formatDate(savedName.favorited_at)}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy name"
            >
              <Copy className={`w-3 h-3 ${copied ? 'text-green-600' : 'text-muted-foreground'}`} />
            </Button>
          </div>
          
          {/* Tool Source */}
          <div className="flex items-center justify-between">
            <Link 
              href={`/tools/${savedName.tool_slug}`}
              className="text-sm text-primary hover:text-primary/80 transition-colors truncate"
            >
              From {formatToolName(savedName.tool_slug)}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 