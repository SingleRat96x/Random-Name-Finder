import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { SavedNamesList } from '@/components/user/SavedNamesList';

export const metadata: Metadata = {
  title: 'My Profile - Random Name Finder',
  description: 'View and manage your Random Name Finder profile information.',
};



export default async function ProfilePage() {
  const supabase = await createServerComponentClient();

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      redirect('/login');
    }

    // Check if email is verified
    const isEmailVerified = !!user?.email_confirmed_at;

    // Fetch user profile data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role, created_at')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // Continue with just auth data if profile fetch fails
    }

    // Format the join date
    const joinDate = profile?.created_at 
      ? new Date(profile.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Unknown';

    // Get role color based on role type
    const getRoleColor = (role: string) => {
      switch (role?.toLowerCase()) {
        case 'admin':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'premium':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'user':
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      }
    };

    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              View your account information and manage your saved names
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Profile Card */}
            <Card className="shadow-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  {profile?.username || 'User'}
                </CardTitle>
                <CardDescription>
                  Random Name Finder Member
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Address</p>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {isEmailVerified && (
                        <Badge 
                          variant="outline" 
                          className="ml-2 border-green-500 text-green-600 dark:border-green-400 dark:text-green-400 text-xs px-1.5 py-0.5"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Username</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.username || 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-sm font-medium text-foreground">Account Type</p>
                      <p className="text-sm text-muted-foreground">Your current membership level</p>
                    </div>
                    <Badge className={getRoleColor(profile?.role || 'user')}>
                      {profile?.role || 'User'}
                    </Badge>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Member Since</p>
                    <p className="text-sm text-muted-foreground">{joinDate}</p>
                  </div>
                </div>

                {/* User ID (for debugging/support) */}
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <span className="text-xs font-mono text-muted-foreground">#</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">User ID</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {user.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Names Section */}
            <div className="lg:col-span-1">
              <SavedNamesList />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need to update your profile information? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Unexpected error in profile page:', error);
    redirect('/login');
  }
} 