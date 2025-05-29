'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Heart, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface NameResultsDisplayProps {
  names: string[];
  isLoading: boolean;
  error: string | null;
  toolName: string;
}

export function NameResultsDisplay({ names, isLoading, error, toolName }: NameResultsDisplayProps) {
  const [copiedNames, setCopiedNames] = useState<Set<string>>(new Set());
  const [favoriteNames, setFavoriteNames] = useState<Set<string>>(new Set());

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

  const toggleFavorite = (name: string) => {
    setFavoriteNames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
        toast.success(`"${name}" removed from favorites`);
      } else {
        newSet.add(name);
        toast.success(`"${name}" added to favorites`);
      }
      return newSet;
    });
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
              {names.map((name, index) => (
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
                      >
                        <Heart 
                          className={`h-3 w-3 transition-colors ${
                            favoriteNames.has(name) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground hover:text-red-400'
                          }`} 
                        />
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
              ))}
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
            
            {favoriteNames.size > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Favorite Names ({favoriteNames.size})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(favoriteNames).map((name) => (
                    <Badge key={name} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(name)}>
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 