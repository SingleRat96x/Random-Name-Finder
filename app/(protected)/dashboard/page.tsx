import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Sparkles, Heart, Clock } from 'lucide-react';
import { fetchRecentToolInteractions } from '@/app/actions/toolInteractionsActions';
import { fetchRecentSavedNames } from '@/app/tools/actions/favoritesActions';
import { RecentlyUsedToolItem } from '@/components/dashboard/RecentlyUsedToolItem';
import { RecentlySavedNameItem } from '@/components/dashboard/RecentlySavedNameItem';

// Force dynamic rendering for this protected route
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard - Random Name Finder',
  description: 'Your personalized dashboard for Random Name Finder tools and features.',
};

export default async function DashboardPage() {
  // Fetch data for dashboard sections
  const [recentToolsResult, recentNamesResult] = await Promise.all([
    fetchRecentToolInteractions(4), // Limit to 4 for dashboard
    fetchRecentSavedNames(6) // Limit to 6 for dashboard
  ]);

  const recentTools = recentToolsResult.success ? recentToolsResult.interactions || [] : [];
  const recentNames = recentNamesResult.success ? recentNamesResult.savedNames || [] : [];

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to your Dashboard!
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your saved names and continue where you left off.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recently Used Tools Section */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-2 flex-1">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Jump Back In</CardTitle>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/tools" className="flex items-center gap-1">
                  All Tools
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTools.length > 0 ? (
                <>
                  <div className="grid gap-3">
                    {recentTools.map((interaction, index) => (
                      <RecentlyUsedToolItem 
                        key={`${interaction.tool_slug}-${index}`} 
                        interaction={interaction} 
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Start exploring our tools!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your recently used tools will appear here once you start generating names.
                  </p>
                  <Button asChild>
                    <Link href="/tools">Browse All Tools</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Saved Names Section */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <div className="flex items-center space-x-2 flex-1">
                <Heart className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Your Latest Favorites</CardTitle>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/saved-names" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNames.length > 0 ? (
                <>
                  <div className="grid gap-3">
                    {recentNames.map((savedName) => (
                      <RecentlySavedNameItem 
                        key={savedName.id} 
                        savedName={savedName} 
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No favorites yet!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start generating names and save your favorites to see them here.
                  </p>
                  <Button asChild>
                    <Link href="/tools">Start Generating</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="shadow-sm group hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Explore Tools
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Discover AI-powered name generators for every need
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tools">Browse Tools</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm group hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Manage Favorites
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                View, search, and organize all your saved names
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/saved-names">View Saved Names</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm group hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">?</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Get Help
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Learn how to make the most of our tools
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/about">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <div className="mt-12 text-center">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              🎉 Welcome to Random Name Finder!
            </h2>
            <p className="text-muted-foreground">
              Start generating names with our AI-powered tools and save your favorites to build your perfect collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 