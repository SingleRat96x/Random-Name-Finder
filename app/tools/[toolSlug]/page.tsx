import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchToolBySlug, fetchToolContentBlocks, fetchAvailableAIModels } from '@/lib/supabase/server';
import { fetchOtherPublishedTools } from '@/app/tools/actions';
import { ContentBlockRenderer } from '@/components/content/ContentBlockRenderer';
import { SmallToolCard } from '@/components/tools/SmallToolCard';
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

  // Generate dynamic OG image URL
  const ogImageUrl = `https://randomnamefinder.com/api/og?title=${encodeURIComponent(tool.name)}&subtitle=${encodeURIComponent(tool.description || `Generate unique ${tool.ai_prompt_category || 'names'} with AI`)}&category=${encodeURIComponent(tool.category || tool.ai_prompt_category || '')}`;

  return {
    title: `${tool.name} | Random Name Finder`,
    description: tool.description || `Generate unique names with our ${tool.name.toLowerCase()}. Powered by AI for creative and personalized results.`,
    keywords: `${tool.name}, name generator, AI names, ${tool.ai_prompt_category}`,
    alternates: {
      canonical: `https://randomnamefinder.com/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.name,
      description: tool.description || `Generate unique names with our ${tool.name.toLowerCase()}`,
      type: 'website',
      url: `https://randomnamefinder.com/tools/${tool.slug}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.name} - Random Name Finder`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description || `Generate unique names with our ${tool.name.toLowerCase()}`,
      images: [ogImageUrl],
    },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { toolSlug } = await params;
  
  // Fetch tool data, content blocks, and other tools
  const [tool, contentBlocks, availableAIModels, otherTools] = await Promise.all([
    fetchToolBySlug(toolSlug),
    fetchToolContentBlocks(toolSlug),
    fetchToolBySlug(toolSlug).then(async (tool) => {
      if (!tool) return [];
      return fetchAvailableAIModels(tool.available_ai_model_identifiers || []);
    }),
    fetchToolBySlug(toolSlug).then(async (tool) => {
      if (!tool) return [];
      return fetchOtherPublishedTools({
        currentToolSlug: toolSlug,
        count: 4,
        category: tool.category
      });
    })
  ]);

  if (!tool) {
    notFound();
  }

  // Generate JSON-LD structured data for the tool
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description || `Generate unique names with our ${tool.name.toLowerCase()}. Powered by AI for creative and personalized results.`,
    "url": `https://randomnamefinder.com/tools/${tool.slug}`,
    "operatingSystem": "Web",
    "applicationCategory": "UtilityApplication",
    "applicationSubCategory": "Name Generator",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Random Name Finder"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "keywords": `${tool.name}, name generator, AI names, ${tool.ai_prompt_category}`,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "license": "https://randomnamefinder.com/terms",
    "creator": {
      "@type": "Organization",
      "name": "Random Name Finder",
      "url": "https://randomnamefinder.com"
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
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

          {/* Other Tools You Might Like */}
          {otherTools && otherTools.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">
                Other Tools You Might Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {otherTools.map(tool => (
                  <SmallToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
} 