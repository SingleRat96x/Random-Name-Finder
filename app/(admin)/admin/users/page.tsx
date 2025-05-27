import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Users</h2>
        </div>
        <p className="text-muted-foreground">
          User management functionality will be implemented here. This will include:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
          <li>View all registered users</li>
          <li>Edit user profiles and roles</li>
          <li>Suspend or activate user accounts</li>
          <li>View user activity logs</li>
          <li>Manage user permissions</li>
        </ul>
      </div>
    </div>
  );
} 