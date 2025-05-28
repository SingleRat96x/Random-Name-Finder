'use client';

import { FileText, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface StaticPageSelectorProps {
  pages: ContentPage[];
  onPageSelect: (page: ContentPage) => void;
}

export function StaticPageSelector({ pages, onPageSelect }: StaticPageSelectorProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Pages Found</h3>
        <p className="text-muted-foreground">
          No static pages are available for editing. Pages should be created in the database first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {pages.length} page{pages.length !== 1 ? 's' : ''} available for editing
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      /{page.slug}
                    </Badge>
                  </CardDescription>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {page.meta_description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {page.meta_description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {formatDate(page.updated_at)}
                </div>
                
                <Button 
                  size="sm" 
                  onClick={() => onPageSelect(page)}
                  className="ml-2"
                >
                  Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">About Content Management</h4>
        <p className="text-sm text-muted-foreground">
          Select a page above to manage its content blocks. You can add, edit, reorder, and delete 
          content blocks to customize the page layout and content. Changes are saved immediately 
          and will be visible on the live site.
        </p>
      </div>
    </div>
  );
} 