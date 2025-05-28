'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StaticPageSelector } from '@/components/admin/content/StaticPageSelector';
import { ContentBlockManager } from '@/components/admin/content/ContentBlockManager';
import { fetchStaticPages } from './actions';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load static pages on component mount
  useEffect(() => {
    async function loadPages() {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPages = await fetchStaticPages();
        setPages(fetchedPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pages');
      } finally {
        setIsLoading(false);
      }
    }

    loadPages();
  }, []);

  const handlePageSelect = (page: ContentPage) => {
    setSelectedPage(page);
  };

  const handleBackToPages = () => {
    setSelectedPage(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage static page content blocks and structure.
          </p>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading pages...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage static page content blocks and structure.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage static page content blocks and structure.
        </p>
      </div>

      {!selectedPage ? (
        // Show page selector when no page is selected
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Static Pages</CardTitle>
                <CardDescription>
                  Select a page to edit its content blocks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StaticPageSelector 
              pages={pages} 
              onPageSelect={handlePageSelect} 
            />
          </CardContent>
        </Card>
      ) : (
        // Show content block manager for selected page
        <ContentBlockManager 
          page={selectedPage}
          onBack={handleBackToPages}
        />
      )}
    </div>
  );
} 