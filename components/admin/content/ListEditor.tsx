'use client';

import { useState, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

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

interface FormData {
  block_type: string;
  sort_order: number;
  content_data: Record<string, unknown>;
}

interface ListEditorProps {
  listType: 'unordered_list' | 'ordered_list';
  register: UseFormRegister<FormData>;
  setValue: UseFormSetValue<FormData>;
  editingBlock: ContentBlock | null;
}

export function ListEditor({ 
  listType, 
  register, 
  setValue, 
  editingBlock 
}: ListEditorProps) {
  const [listItems, setListItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // Initialize list items from editing block or start with empty list
  useEffect(() => {
    if (editingBlock && editingBlock.content_data?.items) {
      const items = editingBlock.content_data.items as string[];
      setListItems(items);
      setValue('content_data.items', items);
    } else {
      setListItems(['']);
      setValue('content_data.items', ['']);
    }
  }, [editingBlock, setValue]);

  // Update form data when list items change
  useEffect(() => {
    setValue('content_data.items', listItems);
  }, [listItems, setValue]);

  const addItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...listItems, newItem.trim()];
      setListItems(updatedItems);
      setNewItem('');
    } else {
      // Add empty item if no text entered
      const updatedItems = [...listItems, ''];
      setListItems(updatedItems);
    }
  };

  const removeItem = (index: number) => {
    if (listItems.length > 1) {
      const updatedItems = listItems.filter((_, i) => i !== index);
      setListItems(updatedItems);
    }
  };

  const updateItem = (index: number, value: string) => {
    const updatedItems = [...listItems];
    updatedItems[index] = value;
    setListItems(updatedItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= listItems.length) return;
    
    const updatedItems = [...listItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    setListItems(updatedItems);
  };

  const isUnorderedList = listType === 'unordered_list';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {isUnorderedList ? 'Bullet List Items' : 'Numbered List Items'}
        </Label>
        <span className="text-sm text-muted-foreground">
          {listItems.length} item{listItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Preview */}
      <div className="border border-border rounded-lg p-4 bg-muted/20">
        <div className="text-sm font-medium text-muted-foreground mb-2">Preview:</div>
        {isUnorderedList ? (
          <ul className="list-disc list-inside space-y-1">
            {listItems.map((item, index) => (
              <li key={index} className="text-sm">
                {item || <span className="italic text-muted-foreground">Empty item</span>}
              </li>
            ))}
          </ul>
        ) : (
          <ol className="list-decimal list-inside space-y-1">
            {listItems.map((item, index) => (
              <li key={index} className="text-sm">
                {item || <span className="italic text-muted-foreground">Empty item</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* List Items Editor */}
      <div className="space-y-3">
        {listItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2 group">
            <div className="flex items-center gap-1 mt-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <span className="text-sm text-muted-foreground w-6">
                {isUnorderedList ? '•' : `${index + 1}.`}
              </span>
            </div>
            
            <div className="flex-1">
              <Textarea
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Enter ${isUnorderedList ? 'bullet' : 'numbered'} point ${index + 1}...`}
                rows={2}
                className="min-h-[60px] resize-none"
              />
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              {/* Move up button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ↑
              </Button>
              
              {/* Move down button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === listItems.length - 1}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ↓
              </Button>
              
              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={listItems.length <= 1}
                className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add new ${isUnorderedList ? 'bullet' : 'numbered'} point...`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <Button type="button" onClick={addItem} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Use the text areas to edit list items</p>
        <p>• Press Enter in the input field or click &quot;Add Item&quot; to add new items</p>
        <p>• Use the arrow buttons to reorder items</p>
        <p>• Use the trash button to remove items (minimum 1 item required)</p>
      </div>

      {/* Hidden input to register with react-hook-form */}
      <input
        type="hidden"
        {...register('content_data.items', { required: 'At least one list item is required' })}
      />
    </div>
  );
} 