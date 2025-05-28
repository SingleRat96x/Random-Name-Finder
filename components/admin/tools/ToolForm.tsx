'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { addTool, updateTool, generateSlug, type Tool } from '../../../app/(admin)/admin/tools/actions';

interface ToolFormProps {
  initialData?: Tool | null;
  mode: 'create' | 'edit';
}

const AI_MODELS = [
  'mistralai/devstral-small:free',
  'meta-llama/llama-3.3-8b-instruct:free',
  'openai/gpt-3.5-turbo',
  'google/gemini-2.0-flash-exp:free',
  'openai/gpt-4',
  'openai/gpt-4-turbo',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-opus',
];

export default function ToolForm({ initialData, mode }: ToolFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    icon_name: initialData?.icon_name || '',
    ai_prompt_category: initialData?.ai_prompt_category || '',
    ai_model_preference: initialData?.ai_model_preference || '',
    default_parameters: JSON.stringify(initialData?.default_parameters || {}, null, 2),
    configurable_fields: JSON.stringify(initialData?.configurable_fields || [], null, 2),
    is_published: initialData?.is_published || false,
  });

  // Auto-generate slug from name
  const handleNameChange = async (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    // Only auto-generate slug if we're creating a new tool or if slug is empty
    if (mode === 'create' || !formData.slug) {
      const generatedSlug = await generateSlug(name);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  // Validate JSON fields
  const validateJsonField = (value: string, fieldName: string): boolean => {
    if (!value.trim()) return true; // Empty is valid
    
    try {
      JSON.parse(value);
      return true;
    } catch {
      toast.error(`Invalid JSON format in ${fieldName}`);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Tool name is required');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('Tool slug is required');
      return;
    }
    
    if (!formData.ai_prompt_category.trim()) {
      toast.error('AI prompt category is required');
      return;
    }

    // Validate JSON fields
    if (!validateJsonField(formData.default_parameters, 'Default Parameters')) return;
    if (!validateJsonField(formData.configurable_fields, 'Configurable Fields')) return;

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      toast.error('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSubmit = new FormData();
      
      // Add tool ID for updates
      if (mode === 'edit' && initialData?.id) {
        formDataToSubmit.append('tool_id', initialData.id);
      }
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'is_published') {
          formDataToSubmit.append(key, value.toString());
        } else {
          formDataToSubmit.append(key, value as string);
        }
      });

      if (mode === 'create') {
        await addTool(formDataToSubmit);
        toast.success('Tool created successfully!');
      } else {
        await updateTool(formDataToSubmit);
        toast.success('Tool updated successfully!');
      }
      
      // Navigation will be handled by the server action redirect
    } catch (error) {
      console.error('Error saving tool:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save tool');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the basic details of your name generator tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tool Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Random Cat Name Generator"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., random-cat-name-generator"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Only lowercase letters, numbers, and hyphens allowed"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this tool generates"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_name">Icon Name</Label>
            <Input
              id="icon_name"
              value={formData.icon_name}
              onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
              placeholder="e.g., Cat, Castle, Building (Lucide icon name)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Configure how the AI will generate names for this tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai_prompt_category">AI Prompt Category *</Label>
            <Input
              id="ai_prompt_category"
              value={formData.ai_prompt_category}
              onChange={(e) => setFormData(prev => ({ ...prev, ai_prompt_category: e.target.value }))}
              placeholder="e.g., cat names, fantasy city names, business names"
              required
            />
            <p className="text-sm text-muted-foreground">
              This will be used as the core category in AI prompts.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_model_preference">Preferred AI Model</Label>
            <Select
              value={formData.ai_model_preference}
              onValueChange={(value) => setFormData(prev => ({ ...prev, ai_model_preference: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Configuration</CardTitle>
          <CardDescription>
            Configure the default parameters and form fields for this tool.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default_parameters">Default Parameters (JSON)</Label>
            <Textarea
              id="default_parameters"
              value={formData.default_parameters}
              onChange={(e) => setFormData(prev => ({ ...prev, default_parameters: e.target.value }))}
              placeholder='{"tone": "playful", "count": 10}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Default values for the tool&apos;s form parameters in JSON format.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configurable_fields">Configurable Fields (JSON)</Label>
            <Textarea
              id="configurable_fields"
              value={formData.configurable_fields}
              onChange={(e) => setFormData(prev => ({ ...prev, configurable_fields: e.target.value }))}
              placeholder='[{"name": "tone", "label": "Tone", "type": "select", "options": ["playful", "mysterious"]}]'
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Form field definitions that will be shown on the public tool page.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            Control whether this tool is visible to the public.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="is_published">Publish this tool</Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            When published, this tool will be visible on the public website.
          </p>
        </CardContent>
      </Card>

      <hr />

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/tools')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Tool' : 'Update Tool'}
        </Button>
      </div>
    </form>
  );
} 