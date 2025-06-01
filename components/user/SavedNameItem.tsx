'use client';

import { useState } from 'react';
import { Copy, Heart, Calendar, Tag, Loader2 } from 'lucide-react';
import { SavedName } from '@/lib/types/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SavedNameItemProps {
  savedName: SavedName;
  onUnfavorite: (nameId: string) => Promise<void>;
  formatToolSlug: (slug: string) => string;
}

export function SavedNameItem({ savedName, onUnfavorite, formatToolSlug }: SavedNameItemProps) {
  const [isUnfavoriting, setIsUnfavoriting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(savedName.name_text);
      toast.success('Name copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy name');
    } finally {
      setIsCopying(false);
    }
  };

  const handleUnfavorite = async () => {
    setIsUnfavoriting(true);
    try {
      await onUnfavorite(savedName.id);
    } finally {
      setIsUnfavoriting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Name Text */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 break-words">
            {savedName.name_text}
          </h3>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {/* Tool Source */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <Badge variant="outline" className="text-xs">
              {formatToolSlug(savedName.tool_slug)}
            </Badge>
          </div>

          {/* Date Saved */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(savedName.favorited_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={isCopying}
            className="flex-1"
          >
            {isCopying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleUnfavorite}
            disabled={isUnfavoriting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300"
          >
            {isUnfavoriting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4 fill-current" />
            )}
            {isUnfavoriting ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 