import { BarChart3 } from 'lucide-react';
import { UserKPICards } from '@/components/admin/analytics/UserKPICards';
import { UserRegistrationChart } from '@/components/admin/analytics/UserRegistrationChart';
import { RecentUsersTable } from '@/components/admin/analytics/RecentUsersTable';
import { 
  fetchUserKPIs, 
  fetchUserRegistrationTrend, 
  fetchRecentUsersForComponent 
} from '../actions/analyticsActions';

export default async function UserAnalyticsPage() {
  // Fetch all analytics data in parallel
  const [userKPIs, registrationTrend, recentUsers] = await Promise.all([
    fetchUserKPIs(),
    fetchUserRegistrationTrend('30d'), // Default to 30-day view
    fetchRecentUsersForComponent(20) // Get 20 recent users for the table
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">User Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive insights into user registration trends and growth metrics.
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Key Metrics</h2>
        <UserKPICards kpis={userKPIs} />
      </div>

      {/* Registration Trend Chart */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Registration Trends</h2>
        <UserRegistrationChart 
          initialData={registrationTrend} 
          initialPeriod="30d"
        />
      </div>

      {/* Recent Users Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Registrations</h2>
        <RecentUsersTable initialUsers={recentUsers} />
      </div>
    </div>
  );
} 