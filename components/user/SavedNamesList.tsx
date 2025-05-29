'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Copy, 
  Download, 
  Trash2,
  Sparkles,
  Clock,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { removeFavoriteNameById } from '@/app/tools/actions/favoritesActions';
import { SavedName } from '@/lib/types/tools';

interface SavedNamesListProps {
  className?: string;
}

export function SavedNamesList({ className }: SavedNamesListProps) {
  const { savedNames, refreshSavedNames, user } = useAuth();
  const [removingNames, setRemovingNames] = useState<Set<string>>(new Set());

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  // Show loading state if saved names are still being fetched
  if (savedNames === null) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Saved Names</span>
          </CardTitle>
          <CardDescription>Loading your saved names...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show empty state if no saved names
  if (savedNames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Saved Names</span>
            <Badge variant="secondary">0 names</Badge>
          </CardTitle>
          <CardDescription>
            Your favorite names will appear here when you save them from any name generation tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Start generating names with our tools and click the heart icon to save your favorites!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Helper function to copy a single name
  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`"${name}" copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Helper function to remove a name from favorites
  const removeName = async (savedName: SavedName) => {
    if (removingNames.has(savedName.id)) return;

    setRemovingNames(prev => new Set([...prev, savedName.id]));

    try {
      const result = await removeFavoriteNameById(savedName.id);
      
      if (result.success) {
        toast.success(`"${savedName.name_text}" removed from favorites`);
        // Refresh the saved names list
        await refreshSavedNames();
      } else {
        toast.error(result.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      setRemovingNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(savedName.id);
        return newSet;
      });
    }
  };

  // Helper function to copy all names
  const copyAllNames = async () => {
    try {
      const allNames = savedNames.map(saved => saved.name_text).join('\n');
      await navigator.clipboard.writeText(allNames);
      toast.success(`All ${savedNames.length} saved names copied to clipboard!`);
    } catch {
      toast.error('Failed to copy names to clipboard');
    }
  };

  // Helper function to download all names
  const downloadAllNames = () => {
    const content = savedNames.map(saved => saved.name_text).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-saved-names.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Saved names downloaded successfully!');
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group saved names by tool for better organization
  const namesByTool = savedNames.reduce((acc, savedName) => {
    if (!acc[savedName.tool_slug]) {
      acc[savedName.tool_slug] = [];
    }
    acc[savedName.tool_slug].push(savedName);
    return acc;
  }, {} as Record<string, SavedName[]>);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle>Saved Names</CardTitle>
            <Badge variant="secondary">{savedNames.length} names</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllNames}
              className="hidden sm:flex"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAllNames}
              className="hidden sm:flex"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <CardDescription>
          Names you&apos;ve saved from various name generation tools.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mobile action buttons */}
        <div className="flex flex-col sm:hidden space-y-2">
          <Button variant="outline" onClick={copyAllNames} className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Copy All Names
          </Button>
          <Button variant="outline" onClick={downloadAllNames} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download as Text File
          </Button>
        </div>

        {/* Display names grouped by tool */}
        <div className="space-y-6">
          {Object.entries(namesByTool).map(([toolSlug, toolNames]) => (
            <div key={toolSlug} className="space-y-3">
              {/* Tool header */}
              <div className="flex items-center space-x-2 pb-2 border-b border-muted">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm text-foreground capitalize">
                  {toolSlug.replace(/-/g, ' ')}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {toolNames.length} {toolNames.length === 1 ? 'name' : 'names'}
                </Badge>
              </div>

              {/* Names grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {toolNames.map((savedName) => (
                  <div 
                    key={savedName.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {savedName.name_text}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formatDate(savedName.favorited_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:scale-110 transition-transform"
                        onClick={() => copyName(savedName.name_text)}
                        title="Copy name"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:scale-110 transition-transform"
                        onClick={() => removeName(savedName)}
                        disabled={removingNames.has(savedName.id)}
                        title="Remove from favorites"
                      >
                        {removingNames.has(savedName.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-destructive"></div>
                        ) : (
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 