import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ContentBlockManager } from '@/components/admin/content/ContentBlockManager';
import { fetchToolById } from '../../actions';

interface ToolContentPageProps {
  params: Promise<{
    toolId: string;
  }>;
}

export default async function ToolContentPage({ params }: ToolContentPageProps) {
  const { toolId } = await params;
  const tool = await fetchToolById(toolId);

  if (!tool) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Managing Content for: {tool.name}
          </h1>
          <p className="text-muted-foreground">
            Configure the content blocks that will appear on the {tool.name} tool page.
          </p>
        </div>
      </div>

      <ContentBlockManager toolSlug={tool.slug} pageId={null} />
    </div>
  );
} 