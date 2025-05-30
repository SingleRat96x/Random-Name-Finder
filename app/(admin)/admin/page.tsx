import { Users, FileText, Settings, Bot, Clock } from 'lucide-react';
import { createServerComponentClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { QuickLinkCard } from '@/components/admin/dashboard/QuickLinkCard';
import { RecentActivityItem } from '@/components/admin/dashboard/RecentActivityItem';
import { UserAnalyticsCard } from '@/components/admin/dashboard/UserAnalyticsCard';
import { SimpleBarChart } from '@/components/admin/analytics/SimpleBarChart';
import { fetchNewUserCounts, fetchUserRegistrationTrend } from './actions/analyticsActions';

// Dashboard data fetching functions
async function fetchDashboardCounts() {
  const supabase = await createServerComponentClient();
  
  // Verify admin access
  const { data: isAdmin, error: adminError } = await supabase
    .rpc('is_current_user_admin');
    
  if (adminError || !isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    // Fetch all counts in parallel
    const [
      { count: totalUsers },
      { count: totalTools },
      { count: totalContentPages },
      { count: totalAiModels }
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('tools').select('id', { count: 'exact', head: true }),
      supabase.from('content_pages').select('id', { count: 'exact', head: true }),
      supabase.from('ai_models').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalTools: totalTools || 0,
      totalContentPages: totalContentPages || 0,
      totalAiModels: totalAiModels || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    return {
      totalUsers: 0,
      totalTools: 0,
      totalContentPages: 0,
      totalAiModels: 0
    };
  }
}

async function fetchRecentActivity() {
  const supabase = await createServerComponentClient();
  
  try {
    // Fetch recent tools and content pages in parallel
    const [
      { data: recentTools },
      { data: recentContentPages }
    ] = await Promise.all([
      supabase
        .from('tools')
        .select('id, name, slug, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('content_pages')
        .select('id, title, slug, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)
    ]);

    return {
      recentTools: recentTools || [],
      recentContentPages: recentContentPages || []
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      recentTools: [],
      recentContentPages: []
    };
  }
}

export default async function AdminDashboard() {
  // Fetch dashboard data including analytics
  const [counts, activity, newUserCounts, registrationTrend] = await Promise.all([
    fetchDashboardCounts(),
    fetchRecentActivity(),
    fetchNewUserCounts(),
    fetchUserRegistrationTrend('30d') // Fetch 30-day trend for chart
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the Admin Area. Overview and quick navigation for site management.
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={counts.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Total Tools"
          value={counts.totalTools}
          icon={Settings}
        />
        <StatCard
          title="Content Pages"
          value={counts.totalContentPages}
          icon={FileText}
        />
        <StatCard
          title="AI Models"
          value={counts.totalAiModels}
          icon={Bot}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Registration Summary */}
        <UserAnalyticsCard newUserCounts={newUserCounts} />
        
        {/* User Registration Trend Chart */}
        <SimpleBarChart 
          data={registrationTrend} 
          title="30-Day Registration Trend"
          period="30d"
        />
      </div>

      {/* Quick Actions */}
      <QuickLinkCard />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Updated Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recently Updated Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.recentTools.length > 0 ? (
              <div className="space-y-3">
                {activity.recentTools.map((tool) => (
                  <RecentActivityItem
                    key={tool.id}
                    title={tool.name}
                    timestamp={tool.updated_at}
                    link={`/admin/tools/${tool.id}/edit`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No tools found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated Content Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recently Updated Pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.recentContentPages.length > 0 ? (
              <div className="space-y-3">
                {activity.recentContentPages.map((page) => (
                  <RecentActivityItem
                    key={page.id}
                    title={page.title}
                    timestamp={page.updated_at}
                    link="/admin/content"
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No content pages found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 