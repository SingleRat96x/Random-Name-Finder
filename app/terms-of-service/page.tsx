import type { Metadata } from 'next';
import { ContentBlockRenderer } from '@/components/content/ContentBlockRenderer';
import { getPageWithBlocks, generatePageMetadata } from '@/lib/content/database';

const PAGE_SLUG = 'terms-of-service';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata(PAGE_SLUG);
}

export default async function TermsOfServicePage() {
  const { blocks } = await getPageWithBlocks(PAGE_SLUG);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="space-y-6">
        {blocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </article>
    </div>
  );
} 