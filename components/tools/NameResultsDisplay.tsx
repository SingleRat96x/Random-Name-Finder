'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Heart, Download, Sparkles, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { saveFavoriteName, removeFavoriteName, isNameSaved } from '@/app/tools/actions/favoritesActions';
import Link from 'next/link';

interface NameResultsDisplayProps {
  names: string[];
  isLoading: boolean;
  error: string | null;
  toolName: string;
  toolSlug: string;
}

export function NameResultsDisplay({ names, isLoading, error, toolName, toolSlug }: NameResultsDisplayProps) {
  const [copiedNames, setCopiedNames] = useState<Set<string>>(new Set());
  const [favoriteNames, setFavoriteNames] = useState<Set<string>>(new Set());
  const [savedNamesFromDB, setSavedNamesFromDB] = useState<Set<string>>(new Set());
  const [savingNames, setSavingNames] = useState<Set<string>>(new Set());
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [hasShownGuestPrompt, setHasShownGuestPrompt] = useState(false);
  
  const { user, refreshSavedNames } = useAuth();

  // Check which names are already saved in the database when names change
  useEffect(() => {
    if (user && names.length > 0) {
      const checkSavedNames = async () => {
        const savedChecks = await Promise.all(
          names.map(async (name) => {
            const result = await isNameSaved(name, toolSlug);
            return { name, isSaved: result.isSaved };
          })
        );
        
        const savedNamesSet = new Set(
          savedChecks.filter(check => check.isSaved).map(check => check.name)
        );
        setSavedNamesFromDB(savedNamesSet);
      };
      
      checkSavedNames();
    }
  }, [user, names, toolSlug]);

  const copyToClipboard = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedNames(prev => new Set([...prev, name]));
      toast.success(`"${name}" copied to clipboard!`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedNames(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }, 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyAllNames = async () => {
    try {
      const allNames = names.join('\n');
      await navigator.clipboard.writeText(allNames);
      toast.success(`All ${names.length} names copied to clipboard!`);
    } catch {
      toast.error('Failed to copy names to clipboard');
    }
  };

  const toggleFavorite = async (name: string) => {
    if (user) {
      // Logged-in user: use server actions
      if (savingNames.has(name)) return; // Prevent double-clicking
      
      setSavingNames(prev => new Set([...prev, name]));
      
      try {
        const isCurrentlySaved = savedNamesFromDB.has(name);
        
        if (isCurrentlySaved) {
          // Remove from database
          const result = await removeFavoriteName(name, toolSlug);
          if (result.success) {
            setSavedNamesFromDB(prev => {
              const newSet = new Set(prev);
              newSet.delete(name);
              return newSet;
            });
            toast.success(`"${name}" removed from favorites`);
            // Refresh saved names in auth context
            await refreshSavedNames();
          } else {
            toast.error(result.error || 'Failed to remove from favorites');
          }
        } else {
          // Save to database
          const result = await saveFavoriteName(name, toolSlug);
          if (result.success) {
            setSavedNamesFromDB(prev => new Set([...prev, name]));
            toast.success(`"${name}" added to favorites`);
            // Refresh saved names in auth context
            await refreshSavedNames();
          } else {
            toast.error(result.error || 'Failed to save to favorites');
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        toast.error('Failed to update favorites');
      } finally {
        setSavingNames(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }
    } else {
      // Guest user: use client-side favorites
      setFavoriteNames(prev => {
        const newSet = new Set(prev);
        if (newSet.has(name)) {
          newSet.delete(name);
          toast.success(`"${name}" removed from favorites`);
        } else {
          newSet.add(name);
          toast.success(`"${name}" added to favorites`);
          
          // Show guest prompt if this is their first favorite
          if (newSet.size === 1 && !hasShownGuestPrompt) {
            setShowGuestPrompt(true);
            setHasShownGuestPrompt(true);
          }
        }
        return newSet;
      });
    }
  };

  const downloadNames = () => {
    const content = names.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolName.toLowerCase().replace(/\s+/g, '-')}-names.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Names downloaded successfully!');
  };

  const downloadFavorites = () => {
    const favoritesToDownload = user ? 
      Array.from(savedNamesFromDB) : 
      Array.from(favoriteNames);
      
    if (favoritesToDownload.length === 0) {
      toast.error('No favorite names to download');
      return;
    }
    
    const content = favoritesToDownload.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorited-names.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Favorite names downloaded successfully!');
  };

  const copyFavoriteName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`"${name}" copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const removeFavorite = (name: string) => {
    if (user) {
      // For logged-in users, this will be handled by toggleFavorite
      toggleFavorite(name);
    } else {
      // For guest users, remove from client-side favorites
      setFavoriteNames(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        toast.success(`"${name}" removed from favorites`);
        return newSet;
      });
    }
  };

  // Get the current favorites (either from DB for logged-in users or client-side for guests)
  const currentFavorites = user ? savedNamesFromDB : favoriteNames;

  // Don't render anything if no names and not loading/error
  if (!isLoading && !error && names.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Generated Names</span>
            {names.length > 0 && (
              <Badge variant="secondary">{names.length} names</Badge>
            )}
          </div>
          
          {names.length > 0 && (
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
                onClick={downloadNames}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </CardTitle>
        
        {names.length > 0 && (
          <CardDescription>
            Click any name to copy it, or use the heart to mark favorites.
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating amazing names for you...</p>
            </div>
          </div>
        )}
        
        {names.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {names.map((name, index) => {
                const isFavorited = currentFavorites.has(name);
                const isSaving = savingNames.has(name);
                
                return (
                  <div
                    key={`${name}-${index}`}
                    className="group relative p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer bg-card"
                    onClick={() => copyToClipboard(name)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {name}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(name);
                          }}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                          ) : (
                            <Heart 
                              className={`h-3 w-3 transition-colors ${
                                isFavorited 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground hover:text-red-400'
                              }`} 
                            />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(name);
                          }}
                        >
                          {copiedNames.has(name) ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Mobile action buttons */}
            <div className="flex flex-col sm:hidden space-y-2">
              <Button
                variant="outline"
                onClick={copyAllNames}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Names
              </Button>
              <Button
                variant="outline"
                onClick={downloadNames}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as Text File
              </Button>
            </div>
            
            {currentFavorites.size > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm text-foreground flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Favorite Names ({currentFavorites.size})</span>
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadFavorites}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from(currentFavorites).map((name) => (
                    <div key={name} className="flex items-center justify-between p-2 bg-background rounded border">
                      <span className="font-medium text-sm truncate flex-1">{name}</span>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                          onClick={() => copyFavoriteName(name)}
                          title="Copy name"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                          onClick={() => removeFavorite(name)}
                          title="Remove from favorites"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Guest User Prompt */}
            {showGuestPrompt && !user && (
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">Your favorites are saved for this session only!</p>
                      <p className="text-sm">
                        To save them permanently, please{' '}
                        <Link href="/signup" className="font-medium underline hover:no-underline">
                          Sign Up
                        </Link>
                        {' '}or{' '}
                        <Link href="/login" className="font-medium underline hover:no-underline">
                          Log In
                        </Link>
                        .
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => setShowGuestPrompt(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 