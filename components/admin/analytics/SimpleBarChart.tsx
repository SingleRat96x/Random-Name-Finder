'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';
import { UserRegistrationTrendItem } from '@/app/(admin)/admin/actions/analyticsActions';

interface SimpleBarChartProps {
  data: UserRegistrationTrendItem[];
  title?: string;
  period?: '7d' | '30d' | '90d';
}

export function SimpleBarChart({ 
  data, 
  title = "User Registration Trend",
  period = '30d' 
}: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No registration data available for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));
  const totalRegistrations = data.reduce((sum, item) => sum + item.count, 0);
  
  // Format date based on period
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show fewer labels for longer periods to avoid overcrowding
  const shouldShowLabel = (index: number) => {
    if (period === '7d') return true;
    if (period === '30d') return index % 5 === 0 || index === data.length - 1;
    return index % 10 === 0 || index === data.length - 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{title}</span>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{totalRegistrations} total</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-48 flex items-end justify-between space-x-1 bg-muted/20 p-4 rounded-lg">
            {data.map((item, index) => {
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={item.date} className="flex flex-col items-center space-y-1 flex-1">
                  {/* Bar */}
                  <div 
                    className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80 relative group min-h-[2px]"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{formatDate(item.date)}</div>
                      <div className="text-muted-foreground">
                        {item.count} {item.count === 1 ? 'user' : 'users'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Date label */}
                  {shouldShowLabel(index) && (
                    <span className="text-xs text-muted-foreground transform -rotate-45 origin-left">
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">{totalRegistrations}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {data.length > 0 ? Math.round(totalRegistrations / data.length * 10) / 10 : 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg/Day</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{maxCount}</div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {data.filter(item => item.count > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 