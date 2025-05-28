'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain } from 'lucide-react';
import { AIModel } from '@/lib/types/tools';
import { addAIModel, updateAIModel } from '@/app/(admin)/admin/ai-models/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AIModelFormProps {
  model?: AIModel;
  isEditing?: boolean;
}

export function AIModelForm({ model, isEditing = false }: AIModelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      if (isEditing && model) {
        formData.append('id', model.id);
        await updateAIModel(formData);
        toast.success('AI model updated successfully!');
      } else {
        await addAIModel(formData);
        toast.success('AI model created successfully!');
      }
      
      router.push('/admin/ai-models');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>{isEditing ? 'Edit AI Model' : 'Add New AI Model'}</span>
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the AI model configuration below.'
            : 'Configure a new AI model for name generation tools.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model_identifier">Model Identifier *</Label>
                <Input
                  id="model_identifier"
                  name="model_identifier"
                  type="text"
                  placeholder="e.g., anthropic/claude-3.5-sonnet"
                  defaultValue={model?.model_identifier || ''}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The unique identifier used with the AI provider (e.g., OpenRouter)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  type="text"
                  placeholder="e.g., Claude 3.5 Sonnet"
                  defaultValue={model?.display_name || ''}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Human-readable name shown in the admin interface
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider_name">Provider Name *</Label>
              <Input
                id="provider_name"
                name="provider_name"
                type="text"
                placeholder="e.g., Anthropic, OpenAI, Google"
                defaultValue={model?.provider_name || ''}
                required
              />
              <p className="text-xs text-muted-foreground">
                The company or organization that provides this AI model
              </p>
            </div>
          </div>
          
          {/* Capabilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Capabilities</h3>
            
            <div className="space-y-2">
              <Label htmlFor="capabilities_tags">Capabilities Tags</Label>
              <Textarea
                id="capabilities_tags"
                name="capabilities_tags"
                placeholder="e.g., High Quality, Creative, Fast, Cost Effective"
                defaultValue={model?.capabilities_tags?.join(', ') || ''}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of capabilities or features (e.g., &quot;Fast, Creative, Cost Effective&quot;)
              </p>
            </div>
          </div>
          
          {/* Status and Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status & Notes</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                name="is_active"
                defaultChecked={model?.is_active ?? true}
              />
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-muted-foreground ml-2">
                Only active models can be used in tools
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes_for_admin">Admin Notes</Label>
              <Textarea
                id="notes_for_admin"
                name="notes_for_admin"
                placeholder="Internal notes about this model (optional)"
                defaultValue={model?.notes_for_admin || ''}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Internal notes visible only to administrators
              </p>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update AI Model' : 'Create AI Model'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 