'use client';

import { useState } from 'react';
import { ToolInputForm } from '@/components/tools/ToolInputForm';
import { NameResultsDisplay } from '@/components/tools/NameResultsDisplay';
import { ConfigurableField, AvailableAIModel } from '@/lib/types/tools';

interface ToolPageClientProps {
  toolName: string;
  configurable_fields: ConfigurableField[];
  default_parameters: Record<string, unknown>;
  ai_prompt_category: string;
  default_ai_model_identifier?: string | null;
  available_ai_models: AvailableAIModel[];
}

export function ToolPageClient({
  toolName,
  configurable_fields,
  default_parameters,
  ai_prompt_category,
  default_ai_model_identifier,
  available_ai_models
}: ToolPageClientProps) {
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNamesGenerated = (names: string[]) => {
    setGeneratedNames(names);
    setIsLoading(false);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setGeneratedNames([]);
  };

  return (
    <div className="space-y-6">
      {/* Tool Input Form */}
      <ToolInputForm
        toolName={toolName}
        configurable_fields={configurable_fields}
        default_parameters={default_parameters}
        ai_prompt_category={ai_prompt_category}
        default_ai_model_identifier={default_ai_model_identifier}
        available_ai_models={available_ai_models}
        onNamesGenerated={handleNamesGenerated}
        onError={handleError}
      />

      {/* Results Display */}
      <NameResultsDisplay
        names={generatedNames}
        isLoading={isLoading}
        error={error}
        toolName={toolName}
      />
    </div>
  );
} 