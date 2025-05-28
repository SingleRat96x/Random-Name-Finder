import { AIModelForm } from '@/components/admin/ai-models/AIModelForm';

export default function NewAIModelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New AI Model</h1>
        <p className="text-muted-foreground">
          Configure a new AI model for name generation tools.
        </p>
      </div>
      
      <AIModelForm />
    </div>
  );
} 