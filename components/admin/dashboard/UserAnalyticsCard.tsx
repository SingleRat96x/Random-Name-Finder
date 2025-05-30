import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';
import { NewUserCounts } from '@/app/(admin)/admin/actions/analyticsActions';
import Link from 'next/link';

interface UserAnalyticsCardProps {
  newUserCounts: NewUserCounts;
}

export function UserAnalyticsCard({ newUserCounts }: UserAnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>New User Registrations</span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">View Details</span>
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Last 24 Hours */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Last 24 Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {newUserCounts.last24Hours}
              </span>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          </div>

          {/* Last 7 Days */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Last 7 Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {newUserCounts.last7Days}
              </span>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Last 30 Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">
                {newUserCounts.last30Days}
              </span>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                New
              </Badge>
            </div>
          </div>
        </div>

        {/* Growth Insight */}
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Growth Insight</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {newUserCounts.last7Days > 0 
              ? `Average of ${Math.round(newUserCounts.last7Days / 7)} new users per day this week`
              : 'No new registrations in the past week'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 