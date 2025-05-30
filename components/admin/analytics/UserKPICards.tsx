import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target
} from 'lucide-react';
import { UserKPIs } from '@/app/(admin)/admin/actions/analyticsActions';

interface UserKPICardsProps {
  kpis: UserKPIs;
}

export function UserKPICards({ kpis }: UserKPICardsProps) {
  const getGrowthBadge = (growthPercent: number) => {
    if (growthPercent > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{growthPercent}%
        </Badge>
      );
    } else if (growthPercent < 0) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
          <TrendingDown className="h-3 w-3 mr-1" />
          {growthPercent}%
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <span className="h-3 w-3 mr-1">—</span>
        0%
      </Badge>
    );
  };

  const kpiCards = [
    {
      title: 'Total Users',
      value: kpis.totalUsers,
      icon: Users,
      description: 'All registered users',
      color: 'text-blue-600'
    },
    {
      title: 'New This Month',
      value: kpis.newUsersThisMonth,
      icon: UserPlus,
      description: 'Users registered this month',
      color: 'text-green-600',
      badge: getGrowthBadge(kpis.monthOverMonthGrowthPercent)
    },
    {
      title: 'Previous Month',
      value: kpis.newUsersPreviousMonth,
      icon: Calendar,
      description: 'Users registered last month',
      color: 'text-purple-600'
    },
    {
      title: 'Daily Average',
      value: kpis.averageDailyRegistrations,
      icon: Target,
      description: 'Average new users per day (30d)',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>{kpi.title}</span>
                {kpi.badge && kpi.badge}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-muted/30`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-foreground">
                    {typeof kpi.value === 'number' && kpi.value % 1 !== 0 
                      ? kpi.value.toFixed(1)
                      : kpi.value.toLocaleString()
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                </div>
              </div>
              
              {/* Growth insight for "New This Month" card */}
              {index === 1 && kpis.monthOverMonthGrowthPercent !== 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {kpis.monthOverMonthGrowthPercent > 0 ? 'Growing' : 'Declining'} compared to last month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 