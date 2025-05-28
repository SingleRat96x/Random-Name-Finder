import { notFound } from 'next/navigation';
import { AIModelForm } from '@/components/admin/ai-models/AIModelForm';
import { fetchAIModelById } from '../../actions';

interface EditAIModelPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function EditAIModelPage({ params }: EditAIModelPageProps) {
  const { modelId } = await params;
  const model = await fetchAIModelById(modelId);

  if (!model) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit AI Model</h1>
        <p className="text-muted-foreground">
          Update the configuration for &quot;{model.display_name}&quot;.
        </p>
      </div>
      
      <AIModelForm model={model} isEditing={true} />
    </div>
  );
} 