'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ContentBlockItem } from './ContentBlockItem';
import { ContentBlockForm } from './ContentBlockForm';
import { fetchPageContentBlocks } from '@/app/(admin)/admin/content/actions';
import { fetchContentBlocksByToolSlug } from '@/app/(admin)/admin/tools/content/actions';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

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

interface ContentBlockManagerProps {
  page?: ContentPage;
  toolSlug?: string;
  pageId?: string | null;
  onBack?: () => void;
}

export function ContentBlockManager({ page, toolSlug, pageId, onBack }: ContentBlockManagerProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

  // Determine if we're working with a page or tool
  const isToolMode = !!toolSlug;
  const contextId = isToolMode ? toolSlug : (page?.id || pageId);

  // Load content blocks for the selected page or tool
  useEffect(() => {
    async function loadBlocks() {
      try {
        setIsLoading(true);
        setError(null);
        
        if (isToolMode && toolSlug) {
          const fetchedBlocks = await fetchContentBlocksByToolSlug(toolSlug);
          setBlocks(fetchedBlocks);
        } else if (page?.id) {
          const fetchedBlocks = await fetchPageContentBlocks(page.id);
          setBlocks(fetchedBlocks);
        } else if (pageId) {
          const fetchedBlocks = await fetchPageContentBlocks(pageId);
          setBlocks(fetchedBlocks);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content blocks');
      } finally {
        setIsLoading(false);
      }
    }

    if (contextId) {
      loadBlocks();
    }
  }, [contextId, isToolMode, toolSlug, page?.id, pageId]);

  const handleAddBlock = () => {
    setEditingBlock(null);
    setIsFormOpen(true);
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlock(block);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBlock(null);
  };

  const handleBlockSaved = async () => {
    // Refresh blocks after save
    try {
      if (isToolMode && toolSlug) {
        const fetchedBlocks = await fetchContentBlocksByToolSlug(toolSlug);
        setBlocks(fetchedBlocks);
      } else if (page?.id) {
        const fetchedBlocks = await fetchPageContentBlocks(page.id);
        setBlocks(fetchedBlocks);
      } else if (pageId) {
        const fetchedBlocks = await fetchPageContentBlocks(pageId);
        setBlocks(fetchedBlocks);
      }
      handleFormClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh content blocks');
    }
  };

  const handleBlockDeleted = async () => {
    // Refresh blocks after delete
    try {
      if (isToolMode && toolSlug) {
        const fetchedBlocks = await fetchContentBlocksByToolSlug(toolSlug);
        setBlocks(fetchedBlocks);
      } else if (page?.id) {
        const fetchedBlocks = await fetchPageContentBlocks(page.id);
        setBlocks(fetchedBlocks);
      } else if (pageId) {
        const fetchedBlocks = await fetchPageContentBlocks(pageId);
        setBlocks(fetchedBlocks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh content blocks');
    }
  };

  const handleBlockMoved = async () => {
    // Refresh blocks after move
    try {
      if (isToolMode && toolSlug) {
        const fetchedBlocks = await fetchContentBlocksByToolSlug(toolSlug);
        setBlocks(fetchedBlocks);
      } else if (page?.id) {
        const fetchedBlocks = await fetchPageContentBlocks(page.id);
        setBlocks(fetchedBlocks);
      } else if (pageId) {
        const fetchedBlocks = await fetchPageContentBlocks(pageId);
        setBlocks(fetchedBlocks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh content blocks');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading content blocks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render header if we're in tool mode (handled by parent page)
  const showHeader = !isToolMode && page && onBack;

  return (
    <div className="space-y-6">
      {/* Header with back button and page info (only for page mode) */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{page.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">/{page.slug}</Badge>
                <span className="text-sm text-muted-foreground">
                  {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <Button onClick={handleAddBlock}>
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      )}

      {/* Add Block button for tool mode */}
      {isToolMode && (
        <div className="flex justify-end">
          <Button onClick={handleAddBlock}>
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content blocks list */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Content Blocks</CardTitle>
              <CardDescription>
                Manage the content blocks for this {isToolMode ? 'tool' : 'page'}. Blocks are displayed in order on the live site.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {blocks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Content Blocks</h3>
              <p className="text-muted-foreground mb-4">
                This {isToolMode ? 'tool' : 'page'} doesn&apos;t have any content blocks yet. Add your first block to get started.
              </p>
              <Button onClick={handleAddBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Block
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <ContentBlockItem
                  key={block.id}
                  block={block}
                  isFirst={index === 0}
                  isLast={index === blocks.length - 1}
                  onEdit={handleEditBlock}
                  onDelete={handleBlockDeleted}
                  onMove={handleBlockMoved}
                  pageId={isToolMode ? null : (page?.id || pageId || null)}
                  toolSlug={isToolMode ? toolSlug : null}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content block form modal */}
      {isFormOpen && (
        <ContentBlockForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleBlockSaved}
          pageId={isToolMode ? null : (page?.id || pageId || null)}
          toolSlug={isToolMode ? toolSlug : null}
          editingBlock={editingBlock}
          nextSortOrder={blocks.length > 0 ? Math.max(...blocks.map(b => b.sort_order)) + 1 : 1}
        />
      )}
    </div>
  );
} 