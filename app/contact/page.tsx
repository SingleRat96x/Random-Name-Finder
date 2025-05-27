import { getPageContent } from '@/lib/content';

export default async function ContactPage() {
  const content = await getPageContent('contact');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">{content.title}</h1>
      <div className="prose prose-lg text-muted-foreground space-y-4">
        {content.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
} 