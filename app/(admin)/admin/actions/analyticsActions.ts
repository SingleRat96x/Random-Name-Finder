'use server';

import { createServerComponentClient, createServerActionClient } from '@/lib/supabase/server';

export interface NewUserCounts {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export interface UserRegistrationTrendItem {
  date: string;
  count: number;
}

export interface UserKPIs {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersPreviousMonth: number;
  monthOverMonthGrowthPercent: number;
  averageDailyRegistrations: number;
}

export interface RecentUser {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

/**
 * Verify that the current user is an admin (for component context)
 */
async function verifyAdminAccessComponent() {
  const supabase = await createServerComponentClient();
  
  const { data: isAdmin, error } = await supabase
    .rpc('is_current_user_admin');
    
  if (error || !isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Verify that the current user is an admin (for action context)
 */
async function verifyAdminAccessAction() {
  const supabase = await createServerActionClient();
  
  const { data: isAdmin, error } = await supabase
    .rpc('is_current_user_admin');
    
  if (error || !isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Fetch new user registration counts for different time periods
 */
export async function fetchNewUserCounts(): Promise<NewUserCounts> {
  await verifyAdminAccessComponent();
  
  const supabase = await createServerComponentClient();
  
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Query auth.users for new registrations in different time periods
    const [
      { count: count24h },
      { count: count7d },
      { count: count30d }
    ] = await Promise.all([
      // Last 24 hours
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', last24Hours.toISOString()),
      
      // Last 7 days
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', last7Days.toISOString()),
      
      // Last 30 days
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', last30Days.toISOString())
    ]);

    return {
      last24Hours: count24h || 0,
      last7Days: count7d || 0,
      last30Days: count30d || 0
    };
  } catch (error) {
    console.error('Error fetching new user counts:', error);
    return {
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };
  }
}

/**
 * Enhanced user registration trend fetcher with flexible date ranges
 */
export async function fetchUserRegistrationTrend(
  period: '7d' | '30d' | '90d' | 'all_time' = '30d',
  startDate?: string,
  endDate?: string
): Promise<UserRegistrationTrendItem[]> {
  await verifyAdminAccessComponent();
  
  const supabase = await createServerComponentClient();
  
  try {
    const now = new Date();
    let queryStartDate: Date;
    let daysBack: number;
    
    if (startDate && endDate) {
      // Custom date range
      queryStartDate = new Date(startDate);
      const queryEndDate = new Date(endDate);
      daysBack = Math.ceil((queryEndDate.getTime() - queryStartDate.getTime()) / (24 * 60 * 60 * 1000));
    } else {
      // Predefined periods
      switch (period) {
        case '7d':
          daysBack = 7;
          break;
        case '30d':
          daysBack = 30;
          break;
        case '90d':
          daysBack = 90;
          break;
        case 'all_time':
          daysBack = 365; // Cap at 1 year for performance
          break;
        default:
          daysBack = 30;
      }
      queryStartDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    }

    // Fetch all users created within the period
    const { data: users, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', queryStartDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching user registration trend:', error);
      return [];
    }

    // Group users by date
    const dateCountMap = new Map<string, number>();
    
    // Initialize all dates in the range with 0
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(queryStartDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateCountMap.set(dateStr, 0);
    }
    
    // Count actual registrations
    (users || []).forEach(user => {
      const dateStr = user.created_at.split('T')[0];
      const currentCount = dateCountMap.get(dateStr) || 0;
      dateCountMap.set(dateStr, currentCount + 1);
    });

    // For longer periods, group by week or month to keep performance good
    if (daysBack > 90) {
      return groupByWeek(Array.from(dateCountMap.entries()));
    }

    // Convert to array format for charts
    return Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching user registration trend:', error);
    return [];
  }
}

/**
 * Group daily data by week for longer time periods
 */
function groupByWeek(dailyData: [string, number][]): UserRegistrationTrendItem[] {
  const weeklyData = new Map<string, number>();
  
  dailyData.forEach(([date, count]) => {
    const dateObj = new Date(date);
    // Get Monday of the week
    const dayOfWeek = dateObj.getDay();
    const daysToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(dateObj.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
    const weekKey = monday.toISOString().split('T')[0];
    
    const currentCount = weeklyData.get(weekKey) || 0;
    weeklyData.set(weekKey, currentCount + count);
  });
  
  return Array.from(weeklyData.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch user KPIs for the analytics dashboard
 */
export async function fetchUserKPIs(): Promise<UserKPIs> {
  await verifyAdminAccessComponent();
  
  const supabase = await createServerComponentClient();
  
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: totalUsers },
      { count: newUsersThisMonth },
      { count: newUsersPreviousMonth },
      { count: newUsersLast30Days }
    ] = await Promise.all([
      // Total users
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      
      // New users this month
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfThisMonth.toISOString()),
      
      // New users previous month
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lt('created_at', startOfThisMonth.toISOString()),
      
      // New users last 30 days (for average calculation)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', last30Days.toISOString())
    ]);

    // Calculate month-over-month growth percentage
    const monthOverMonthGrowthPercent = newUsersPreviousMonth && newUsersPreviousMonth > 0
      ? Math.round(((newUsersThisMonth || 0) - newUsersPreviousMonth) / newUsersPreviousMonth * 100)
      : newUsersThisMonth && newUsersThisMonth > 0 ? 100 : 0;

    // Calculate average daily registrations over last 30 days
    const averageDailyRegistrations = newUsersLast30Days ? Math.round((newUsersLast30Days / 30) * 10) / 10 : 0;

    return {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      newUsersPreviousMonth: newUsersPreviousMonth || 0,
      monthOverMonthGrowthPercent,
      averageDailyRegistrations
    };
  } catch (error) {
    console.error('Error fetching user KPIs:', error);
    return {
      totalUsers: 0,
      newUsersThisMonth: 0,
      newUsersPreviousMonth: 0,
      monthOverMonthGrowthPercent: 0,
      averageDailyRegistrations: 0
    };
  }
}

/**
 * Fetch recent users for server components (using profiles table)
 */
export async function fetchRecentUsersForComponent(limit: number = 10, offset: number = 0): Promise<RecentUser[]> {
  await verifyAdminAccessComponent();
  
  const supabase = await createServerComponentClient();
  
  try {
    // Query profiles table since we can't use auth admin API in component context
    // We'll display user_id instead of email as a workaround
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, created_at, role')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching recent users for component:', error);
      return [];
    }

    return (profiles || []).map(profile => ({
      id: profile.user_id,
      email: `User ${profile.user_id.slice(0, 8)}`, // Display shortened user ID instead of email
      created_at: profile.created_at,
      role: profile.role
    }));
  } catch (error) {
    console.error('Error fetching recent users for component:', error);
    return [];
  }
}

/**
 * Fetch recent users for the analytics table - Server Action
 */
export async function fetchRecentUsers(limit: number = 10, offset: number = 0): Promise<RecentUser[]> {
  await verifyAdminAccessAction();
  
  const supabase = await createServerActionClient();
  
  try {
    // Query auth.users directly for email and created_at using admin API
    const { data: users, error } = await supabase.auth.admin.listUsers({
      page: Math.floor(offset / limit) + 1,
      perPage: limit
    });

    if (error) {
      console.error('Error fetching recent users:', error);
      return [];
    }

    // Transform and sort the data to match the RecentUser interface
    return (users.users || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at
      }));
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }
} 