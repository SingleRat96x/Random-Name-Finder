import { Shield, Users, FileText, Settings } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Admin Area. Management tools will appear here.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content Items</p>
              <p className="text-2xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold text-foreground">-</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">
          Activity logs and recent changes will be displayed here once the admin features are implemented.
        </p>
      </div>
    </div>
  );
} 