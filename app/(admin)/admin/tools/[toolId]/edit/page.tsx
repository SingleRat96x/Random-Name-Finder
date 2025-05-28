import { notFound } from 'next/navigation';
import ToolForm from '@/components/admin/tools/ToolForm';
import { fetchToolById } from '../../actions';

interface EditToolPageProps {
  params: Promise<{
    toolId: string;
  }>;
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { toolId } = await params;
  const tool = await fetchToolById(toolId);

  if (!tool) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Tool: {tool.name}</h1>
        <p className="text-muted-foreground">
          Update the configuration and settings for this name generator tool.
        </p>
      </div>

      <ToolForm mode="edit" initialData={tool} />
    </div>
  );
} 