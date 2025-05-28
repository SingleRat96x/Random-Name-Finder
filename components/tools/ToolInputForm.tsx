'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { ConfigurableField, AIGenerationResponse } from '@/lib/types/tools';
import { generateNamesAction } from '@/app/tools/[toolSlug]/actions';

interface ToolInputFormProps {
  toolName: string;
  configurable_fields: ConfigurableField[];
  default_parameters: Record<string, unknown>;
  ai_prompt_category: string;
  ai_model_preference?: string | null;
  onNamesGenerated: (names: string[]) => void;
  onError: (error: string) => void;
}

export function ToolInputForm({
  toolName,
  configurable_fields,
  default_parameters,
  ai_prompt_category,
  ai_model_preference,
  onNamesGenerated,
  onError
}: ToolInputFormProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    // Initialize form values with defaults
    const initialValues: Record<string, unknown> = { ...default_parameters };
    
    configurable_fields.forEach(field => {
      if (field.name in default_parameters) {
        initialValues[field.name] = default_parameters[field.name];
      } else if (field.default !== undefined) {
        initialValues[field.name] = field.default;
      }
    });
    
    return initialValues;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create FormData
      const formData = new FormData();
      formData.append('ai_prompt_category', ai_prompt_category);
      if (ai_model_preference) {
        formData.append('ai_model_preference', ai_model_preference);
      }
      
      // Add all form values
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      // Call server action
      const result: AIGenerationResponse = await generateNamesAction(formData);
      
      if (result.success && result.names) {
        onNamesGenerated(result.names);
      } else {
        const errorMessage = result.error || 'Failed to generate names';
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: ConfigurableField) => {
    const value = formValues[field.name];
    
    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="text"
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
        
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="number"
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.name, parseInt(e.target.value, 10) || 0)}
              min={field.min}
              max={field.max}
              required={field.required}
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select
              value={String(value || '')}
              onValueChange={(newValue) => handleInputChange(field.name, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
            />
          </div>
        );
        
      case 'switch':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Generate Names</span>
        </CardTitle>
        <CardDescription>
          Customize your {toolName.toLowerCase()} generation settings below.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configurable_fields.map(renderField)}
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Names...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Names
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 