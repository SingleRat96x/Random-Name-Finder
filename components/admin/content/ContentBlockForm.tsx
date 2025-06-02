'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  addContentBlock, 
  updateContentBlock, 
  fetchContentBlockTypes 
} from '@/app/(admin)/admin/content/actions';
import { 
  addContentBlockForTool,
  updateContentBlock as updateToolContentBlock
} from '@/app/(admin)/admin/tools/content/actions';
import { ListEditor } from '@/components/admin/content/ListEditor';

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

interface ContentBlockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pageId: string | null;
  toolSlug?: string | null;
  editingBlock: ContentBlock | null;
  nextSortOrder: number;
}

interface FormData {
  block_type: string;
  sort_order: number;
  content_data: Record<string, unknown>;
}

export function ContentBlockForm({ 
  isOpen, 
  onClose, 
  onSave, 
  pageId,
  toolSlug, 
  editingBlock, 
  nextSortOrder 
}: ContentBlockFormProps) {
  const [blockTypes, setBlockTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');

  // Determine if we're in tool mode
  const isToolMode = !!toolSlug;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      block_type: editingBlock?.block_type || '',
      sort_order: editingBlock?.sort_order || nextSortOrder,
      content_data: editingBlock?.content_data || {}
    }
  });

  const watchedBlockType = watch('block_type');

  // Load block types on component mount
  useEffect(() => {
    async function loadBlockTypes() {
      try {
        const types = await fetchContentBlockTypes();
        setBlockTypes(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load block types');
      }
    }

    if (isOpen) {
      loadBlockTypes();
    }
  }, [isOpen]);

  // Reset form when editing block changes
  useEffect(() => {
    if (editingBlock) {
      reset({
        block_type: editingBlock.block_type,
        sort_order: editingBlock.sort_order,
        content_data: editingBlock.content_data
      });
      setSelectedBlockType(editingBlock.block_type);
    } else {
      reset({
        block_type: '',
        sort_order: nextSortOrder,
        content_data: {}
      });
      setSelectedBlockType('');
    }
  }, [editingBlock, nextSortOrder, reset]);

  // Update selected block type when form value changes
  useEffect(() => {
    setSelectedBlockType(watchedBlockType);
  }, [watchedBlockType]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingBlock) {
        // For updates, use the appropriate action based on context
        if (isToolMode && toolSlug) {
          const formData = new FormData();
          formData.append('block_id', editingBlock.id);
          formData.append('block_type', data.block_type);
          formData.append('content_data', JSON.stringify(data.content_data));
          formData.append('tool_slug', toolSlug);
          await updateToolContentBlock(formData);
        } else if (pageId) {
          await updateContentBlock(
            editingBlock.id,
            data.block_type,
            data.content_data,
            data.sort_order
          );
        }
      } else {
        // For new blocks, use the appropriate action
        if (isToolMode && toolSlug) {
          const formData = new FormData();
          formData.append('tool_slug', toolSlug);
          formData.append('block_type', data.block_type);
          formData.append('content_data', JSON.stringify(data.content_data));
          await addContentBlockForTool(formData);
        } else if (pageId) {
          await addContentBlock(
            pageId,
            data.block_type,
            data.content_data,
            data.sort_order
          );
        }
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content block');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get nested error message
  const getNestedErrorMessage = (fieldPath: string): string | undefined => {
    const pathParts = fieldPath.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentError: any = errors;
    
    for (const part of pathParts) {
      if (currentError && typeof currentError === 'object' && part in currentError) {
        currentError = currentError[part];
      } else {
        return undefined;
      }
    }
    
    return currentError?.message;
  };

  // Render content fields based on selected block type
  const renderContentFields = () => {
    if (!selectedBlockType) return null;

    switch (selectedBlockType) {
      case 'heading_h1':
      case 'heading_h2':
      case 'heading_h3':
      case 'heading_h4':
      case 'heading_h5':
      case 'heading_h6':
        const headingError = getNestedErrorMessage('content_data.text');
        return (
          <div className="space-y-2">
            <Label htmlFor="heading-text">Heading Text</Label>
            <Input
              id="heading-text"
              placeholder="Enter heading text"
              className="text-base"
              {...register('content_data.text', { required: 'Heading text is required' })}
            />
            {headingError && (
              <p className="text-sm text-destructive">{headingError}</p>
            )}
          </div>
        );

      case 'paragraph':
        const paragraphError = getNestedErrorMessage('content_data.html_content');
        return (
          <div className="space-y-2">
            <Label htmlFor="paragraph-content">Paragraph Content</Label>
            <Textarea
              id="paragraph-content"
              placeholder="Enter paragraph content (HTML allowed)"
              rows={8}
              className="min-h-[200px] resize-y"
              {...register('content_data.html_content', { required: 'Paragraph content is required' })}
            />
            {paragraphError && (
              <p className="text-sm text-destructive">{paragraphError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You can use basic HTML tags like &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc.
            </p>
          </div>
        );

      case 'ad_slot_manual':
        return (
          <div className="space-y-2">
            <Label htmlFor="ad-identifier">Ad Slot Identifier</Label>
            <Input
              id="ad-identifier"
              placeholder="Enter ad slot identifier (optional)"
              {...register('content_data.identifier')}
            />
            <p className="text-xs text-muted-foreground">
              Optional identifier for this ad slot for targeting purposes.
            </p>
          </div>
        );

      case 'image':
        const imageUrlError = getNestedErrorMessage('content_data.url');
        const imageAltError = getNestedErrorMessage('content_data.alt');
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="Enter image URL"
                  {...register('content_data.url', { required: 'Image URL is required' })}
                />
                {imageUrlError && (
                  <p className="text-sm text-destructive">{imageUrlError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  placeholder="Enter alt text for accessibility"
                  {...register('content_data.alt', { required: 'Alt text is required' })}
                />
                {imageAltError && (
                  <p className="text-sm text-destructive">{imageAltError}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-caption">Caption (Optional)</Label>
              <Input
                id="image-caption"
                placeholder="Enter image caption"
                {...register('content_data.caption')}
              />
            </div>
          </div>
        );

      case 'unordered_list':
      case 'ordered_list':
        return <ListEditor 
          listType={selectedBlockType as 'unordered_list' | 'ordered_list'}
          register={register}
          setValue={setValue}
          editingBlock={editingBlock}
        />;

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="generic-content">Content Data (JSON)</Label>
            <Textarea
              id="generic-content"
              placeholder="Enter content data as JSON"
              rows={6}
              className="min-h-[150px] resize-y font-mono text-sm"
              {...register('content_data', { 
                validate: (value) => {
                  if (typeof value === 'string') {
                    try {
                      JSON.parse(value);
                      return true;
                    } catch {
                      return 'Invalid JSON format';
                    }
                  }
                  return true;
                }
              })}
            />
            {errors.content_data && (
              <p className="text-sm text-destructive">{String(errors.content_data.message || 'Invalid content data')}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This block type doesn&apos;t have a specific form yet. Enter content as JSON.
            </p>
          </div>
        );
    }
  };

  const formatBlockTypeName = (blockType: string) => {
    return blockType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-none sm:w-[80vw] sm:h-[90vh] sm:max-w-[80vw] sm:max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingBlock ? 'Edit Content Block' : 'Add Content Block'}
          </DialogTitle>
          <DialogDescription>
            {editingBlock 
              ? 'Modify the content block settings and content below.'
              : 'Choose a block type and configure its content.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 admin-scrollbar modal-content">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Block Configuration</CardTitle>
                <CardDescription>
                  Configure the basic settings for this content block.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block-type">Block Type</Label>
                    <Select
                      value={watchedBlockType}
                      onValueChange={(value) => {
                        setValue('block_type', value);
                        setValue('content_data', {}); // Reset content data when type changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a block type" />
                      </SelectTrigger>
                      <SelectContent>
                        {blockTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatBlockTypeName(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.block_type && (
                      <p className="text-sm text-destructive">{errors.block_type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Input
                      id="sort-order"
                      type="number"
                      min="1"
                      {...register('sort_order', { 
                        required: 'Sort order is required',
                        min: { value: 1, message: 'Sort order must be at least 1' }
                      })}
                    />
                    {errors.sort_order && (
                      <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Lower numbers appear first. Blocks will be automatically reordered if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedBlockType && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content</CardTitle>
                  <CardDescription>
                    Configure the content for this {formatBlockTypeName(selectedBlockType).toLowerCase()} block.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContentFields()}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedBlockType}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingBlock ? 'Update Block' : 'Add Block'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 