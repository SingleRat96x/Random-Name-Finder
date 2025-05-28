'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteTool } from '../../../app/(admin)/admin/tools/actions';

interface DeleteToolButtonProps {
  toolId: string;
  toolName: string;
}

export function DeleteToolButton({ toolId, toolName }: DeleteToolButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${toolName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteTool(toolId);
      toast.success('Tool deleted successfully');
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete tool');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
} 