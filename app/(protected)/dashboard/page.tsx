import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Random Name Finder',
  description: 'Your personalized dashboard for Random Name Finder tools and features.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to your Dashboard!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personalized content will appear here soon.
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Stats Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Quick Stats
            </h3>
            <p className="text-muted-foreground text-sm">
              Your usage statistics and insights will be displayed here.
            </p>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Recent Activity
            </h3>
            <p className="text-muted-foreground text-sm">
              Your recent name searches and saved results will appear here.
            </p>
          </div>

          {/* Saved Names Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Saved Names
            </h3>
            <p className="text-muted-foreground text-sm">
              Your favorite and saved name suggestions will be listed here.
            </p>
          </div>

          {/* Tools Access Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tools Access
            </h3>
            <p className="text-muted-foreground text-sm">
              Quick access to all Random Name Finder tools and features.
            </p>
          </div>

          {/* Profile Settings Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Profile Settings
            </h3>
            <p className="text-muted-foreground text-sm">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Help & Support Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Help & Support
            </h3>
            <p className="text-muted-foreground text-sm">
              Get help and support for using Random Name Finder.
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-12 text-center">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              🎉 Welcome to Random Name Finder!
            </h2>
            <p className="text-muted-foreground">
              You&apos;ve successfully logged in. This dashboard will be enhanced with more features and functionality in upcoming updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 