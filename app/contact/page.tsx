import type { Metadata } from 'next';
import { ContentBlockRenderer } from '@/components/content/ContentBlockRenderer';
import { ContactForm } from '@/components/contact/ContactForm';
import { getPageWithBlocks, generatePageMetadata } from '@/lib/content/database';

const PAGE_SLUG = 'contact';

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata(PAGE_SLUG);
}

export default async function ContactPage() {
  const { blocks } = await getPageWithBlocks(PAGE_SLUG);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* CMS Content from Database */}
      <article className="space-y-6 mb-12">
        {blocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </article>

      {/* Hardcoded Contact Form */}
      <section className="border-t border-border pt-12">
        <ContactForm />
      </section>
    </div>
  );
} 