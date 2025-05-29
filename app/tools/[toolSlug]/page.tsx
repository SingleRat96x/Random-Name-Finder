import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchToolBySlug, fetchToolContentBlocks, fetchAvailableAIModels } from '@/lib/supabase/server';
import { ContentBlockRenderer } from '@/components/content/ContentBlockRenderer';
import { ToolPageClient } from './ToolPageClient';

interface ToolPageProps {
  params: Promise<{
    toolSlug: string;
  }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { toolSlug } = await params;
  const tool = await fetchToolBySlug(toolSlug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.'
    };
  }

  return {
    title: `${tool.name} | Random Name Finder`,
    description: tool.description || `Generate unique names with our ${tool.name.toLowerCase()}. Powered by AI for creative and personalized results.`,
    keywords: `${tool.name}, name generator, AI names, ${tool.ai_prompt_category}`,
    openGraph: {
      title: tool.name,
      description: tool.description || `Generate unique names with our ${tool.name.toLowerCase()}`,
      type: 'website',
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolSlug } = await params;
  
  // Fetch tool data and content blocks
  const [tool, contentBlocks] = await Promise.all([
    fetchToolBySlug(toolSlug),
    fetchToolContentBlocks(toolSlug)
  ]);

  if (!tool) {
    notFound();
  }

  // Fetch available AI models for this tool
  const availableAIModels = await fetchAvailableAIModels(tool.available_ai_model_identifiers || []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Tool Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {tool.name}
          </h1>
          {tool.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tool.description}
            </p>
          )}
        </div>

        {/* Tool Interface - Client Component */}
        <div className="mb-8">
          <ToolPageClient
            toolSlug={toolSlug}
            toolName={tool.name}
            configurable_fields={tool.configurable_fields}
            default_parameters={tool.default_parameters}
            ai_prompt_category={tool.ai_prompt_category}
            default_ai_model_identifier={tool.default_ai_model_identifier}
            available_ai_models={availableAIModels}
          />
        </div>

        {/* Content Blocks */}
        {contentBlocks.length > 0 && (
          <div className="space-y-6">
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Learn More
              </h2>
              <div className="space-y-4">
                {contentBlocks.map((block) => (
                  <ContentBlockRenderer key={block.id} block={block} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 