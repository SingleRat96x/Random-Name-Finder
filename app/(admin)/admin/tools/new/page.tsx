import ToolForm from '@/components/admin/tools/ToolForm';

export default function NewToolPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add New Name Generator</h1>
        <p className="text-muted-foreground">
          Create a new name generator tool with custom AI prompts and form configurations.
        </p>
      </div>

      <ToolForm mode="create" />
    </div>
  );
} 