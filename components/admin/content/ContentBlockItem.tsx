'use client';

import { useState } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, Type, Image, List, Code, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteContentBlock, moveContentBlock } from '@/app/(admin)/admin/content/actions';
import { 
  deleteContentBlock as deleteToolContentBlock
} from '@/app/(admin)/admin/tools/content/actions';

interface ContentBlock {
  id: string;
  page_id: string | null;
  tool_slug: string | null;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ContentBlockItemProps {
  block: ContentBlock;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (block: ContentBlock) => void;
  onDelete: () => void;
  onMove: () => void;
  pageId: string | null;
  toolSlug?: string | null;
}

export function ContentBlockItem({ 
  block, 
  isFirst, 
  isLast, 
  onEdit, 
  onDelete, 
  onMove, 
  pageId,
  toolSlug
}: ContentBlockItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in tool mode
  const isToolMode = !!toolSlug;

  // Get icon for block type
  const getBlockIcon = (blockType: string) => {
    if (blockType.startsWith('heading_')) return Type;
    if (blockType === 'paragraph') return Type;
    if (blockType === 'image') return Image;
    if (blockType.includes('list')) return List;
    if (blockType === 'code_block') return Code;
    return Type; // Default icon
  };

  // Get preview text for block content
  const getPreviewText = (blockType: string, contentData: Record<string, unknown>) => {
    if (!contentData) return 'No content';
    
    switch (blockType) {
      case 'heading_h1':
      case 'heading_h2':
      case 'heading_h3':
      case 'heading_h4':
      case 'heading_h5':
      case 'heading_h6':
        return (contentData.text as string) || 'Empty heading';
      
      case 'paragraph':
        const htmlContent = (contentData.html_content as string) || '';
        // Strip HTML tags for preview
        const textContent = htmlContent.replace(/<[^>]*>/g, '');
        return textContent.length > 100 
          ? textContent.substring(0, 100) + '...' 
          : textContent || 'Empty paragraph';
      
      case 'unordered_list':
      case 'ordered_list':
        const items = (contentData.items as string[]) || [];
        if (items.length === 0) return 'Empty list';
        const preview = items.slice(0, 2).join(', ');
        const listType = blockType === 'unordered_list' ? 'Bullet' : 'Numbered';
        return `${listType} list: ${preview}${items.length > 2 ? '...' : ''} (${items.length} items)`;
      
      case 'ad_slot_manual':
        return `Ad slot: ${(contentData.identifier as string) || 'No identifier'}`;
      
      default:
        return JSON.stringify(contentData).substring(0, 100) + '...';
    }
  };

  // Format block type for display
  const formatBlockType = (blockType: string) => {
    return blockType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content block? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      if (isToolMode && toolSlug) {
        await deleteToolContentBlock(block.id, toolSlug);
      } else {
        await deleteContentBlock(block.id);
      }
      
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete block');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (direction: 'up' | 'down') => {
    try {
      setIsMoving(true);
      setError(null);
      
      if (isToolMode && toolSlug) {
        // For tools, we need to implement a different move logic
        // This is a simplified version - you might want to implement proper drag-and-drop
        // For now, we'll just trigger the onMove callback
        onMove();
      } else if (pageId) {
        await moveContentBlock(block.id, direction, pageId);
        onMove();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move block');
    } finally {
      setIsMoving(false);
    }
  };

  const BlockIcon = getBlockIcon(block.block_type);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <BlockIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {formatBlockType(block.block_type)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Order: {block.sort_order}
                </span>
              </div>
              
              <p className="text-sm text-foreground line-clamp-2">
                {getPreviewText(block.block_type, block.content_data)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            {/* Move buttons */}
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMove('up')}
                disabled={isFirst || isMoving}
                className="h-6 w-6 p-0"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMove('down')}
                disabled={isLast || isMoving}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(block)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 