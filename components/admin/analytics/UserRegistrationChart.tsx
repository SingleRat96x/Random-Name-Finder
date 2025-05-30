'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { UserRegistrationTrendItem, fetchUserRegistrationTrend } from '@/app/(admin)/admin/actions/analyticsActions';

interface UserRegistrationChartProps {
  initialData: UserRegistrationTrendItem[];
  initialPeriod?: '7d' | '30d' | '90d' | 'all_time';
}

type ChartType = 'line' | 'bar';

export function UserRegistrationChart({ 
  initialData, 
  initialPeriod = '30d' 
}: UserRegistrationChartProps) {
  const [data, setData] = useState(initialData);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isPending, startTransition] = useTransition();

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all_time', label: 'All Time' }
  ] as const;

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
    startTransition(async () => {
      try {
        const newData = await fetchUserRegistrationTrend(period);
        setData(newData);
      } catch (error) {
        console.error('Error fetching new data:', error);
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (selectedPeriod === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (selectedPeriod === 'all_time') {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const totalRegistrations = data.reduce((sum, item) => sum + item.count, 0);
  const averageRegistrations = data.length > 0 ? Math.round((totalRegistrations / data.length) * 10) / 10 : 0;
  const maxRegistrations = Math.max(...data.map(item => item.count));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; [key: string]: unknown }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{formatTooltipDate(label || '')}</p>
          <p className="text-primary">
            <span className="font-semibold">{payload[0].value}</span> {payload[0].value === 1 ? 'user' : 'users'} registered
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>User Registration Trend</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{totalRegistrations} total</span>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Period Selection */}
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <Button
                  key={period.value}
                  variant={selectedPeriod === period.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodChange(period.value)}
                  disabled={isPending}
                  className="text-xs"
                >
                  {period.label}
                </Button>
              ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="text-xs h-8"
              >
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="text-xs h-8"
              >
                Bar
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            {isPending ? (
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-muted-foreground">No data available for the selected period</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{totalRegistrations}</div>
              <div className="text-xs text-muted-foreground">Total Registrations</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{averageRegistrations}</div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{maxRegistrations}</div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
            </div>
            <div className="text-center">
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