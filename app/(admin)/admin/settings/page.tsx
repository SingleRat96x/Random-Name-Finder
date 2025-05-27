import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        </div>
        <p className="text-muted-foreground">
          System settings functionality will be implemented here. This will include:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
          <li>Site configuration and branding</li>
          <li>Email and notification settings</li>
          <li>Security and authentication options</li>
          <li>API rate limits and quotas</li>
          <li>Backup and maintenance schedules</li>
        </ul>
      </div>
    </div>
  );
} 