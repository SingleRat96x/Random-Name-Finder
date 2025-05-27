import { FileText } from 'lucide-react';

export default function AdminContentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage site content, name generators, and data sources.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Content</h2>
        </div>
        <p className="text-muted-foreground">
          Content management functionality will be implemented here. This will include:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
          <li>Manage name generator categories</li>
          <li>Add/edit name lists and data sources</li>
          <li>Configure generator algorithms</li>
          <li>Moderate user-generated content</li>
          <li>Update site pages and documentation</li>
        </ul>
      </div>
    </div>
  );
} 