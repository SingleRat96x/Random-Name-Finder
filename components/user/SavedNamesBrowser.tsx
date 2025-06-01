'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, SortAsc, SortDesc, Download, Copy, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { removeFavoriteNameById } from '@/app/tools/actions/favoritesActions';
import { SavedNameItem } from './SavedNameItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SortConfig {
  field: 'favorited_at' | 'name_text' | 'tool_slug';
  order: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 20;

export function SavedNamesBrowser() {
  const { savedNames, loading, refreshSavedNames } = useAuth();
  
  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToolSlugs, setSelectedToolSlugs] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'favorited_at', order: 'desc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Loading state for bulk actions
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Get unique tool slugs for filter dropdown
  const availableToolSlugs = useMemo(() => {
    if (!savedNames) return [];
    const slugs = [...new Set(savedNames.map(name => name.tool_slug))].sort();
    return slugs;
  }, [savedNames]);

  // Filter, sort, and paginate the saved names
  const displayedNames = useMemo(() => {
    if (!savedNames) return [];
    
    let filtered = savedNames;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(name => 
        name.name_text.toLowerCase().includes(term)
      );
    }
    
    // Apply tool filter
    if (selectedToolSlugs.length > 0) {
      filtered = filtered.filter(name => 
        selectedToolSlugs.includes(name.tool_slug)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: string | Date;
      let bVal: string | Date;
      
      switch (sortConfig.field) {
        case 'favorited_at':
          aVal = new Date(a.favorited_at);
          bVal = new Date(b.favorited_at);
          break;
        case 'name_text':
          aVal = a.name_text.toLowerCase();
          bVal = b.name_text.toLowerCase();
          break;
        case 'tool_slug':
          aVal = a.tool_slug.toLowerCase();
          bVal = b.tool_slug.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Apply pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(0, startIndex + ITEMS_PER_PAGE);
  }, [savedNames, searchTerm, selectedToolSlugs, sortConfig, currentPage]);

  // Get the full filtered list (without pagination) for bulk actions
  const filteredNames = useMemo(() => {
    if (!savedNames) return [];
    
    let filtered = savedNames;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(name => 
        name.name_text.toLowerCase().includes(term)
      );
    }
    
    if (selectedToolSlugs.length > 0) {
      filtered = filtered.filter(name => 
        selectedToolSlugs.includes(name.tool_slug)
      );
    }
    
    return filtered;
  }, [savedNames, searchTerm, selectedToolSlugs]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedToolSlugs, sortConfig]);

  // Handle tool filter change
  const handleToolFilterChange = (toolSlug: string, checked: boolean) => {
    setSelectedToolSlugs(prev => 
      checked 
        ? [...prev, toolSlug]
        : prev.filter(slug => slug !== toolSlug)
    );
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [SortConfig['field'], SortConfig['order']];
    setSortConfig({ field, order });
  };

  // Handle unfavorite action
  const handleUnfavorite = async (nameId: string) => {
    try {
      const result = await removeFavoriteNameById(nameId);
      if (result.success) {
        await refreshSavedNames();
        toast.success('Name removed from favorites');
      } else {
        toast.error(result.error || 'Failed to remove name');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove name');
    }
  };

  // Handle copy all names
  const handleCopyAll = async () => {
    if (filteredNames.length === 0) {
      toast.error('No names to copy');
      return;
    }
    
    setBulkActionLoading(true);
    try {
      const namesList = filteredNames.map(name => name.name_text).join('\n');
      await navigator.clipboard.writeText(namesList);
      toast.success(`Copied ${filteredNames.length} names to clipboard`);
    } catch (error) {
      console.error('Error copying names:', error);
      toast.error('Failed to copy names to clipboard');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle download all names
  const handleDownloadAll = () => {
    if (filteredNames.length === 0) {
      toast.error('No names to download');
      return;
    }
    
    setBulkActionLoading(true);
    try {
      const namesList = filteredNames.map(name => `${name.name_text} (from ${name.tool_slug})`).join('\n');
      const blob = new Blob([namesList], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `saved-names-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${filteredNames.length} names`);
    } catch (error) {
      console.error('Error downloading names:', error);
      toast.error('Failed to download names');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Format tool slug for display
  const formatToolSlug = (slug: string) => {
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading your saved names...</span>
        </CardContent>
      </Card>
    );
  }

  if (!savedNames || savedNames.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">No Saved Names Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start using our name generation tools and save your favorite names to see them here.
            </p>
            <Button asChild>
              <Link href="/tools">Explore Tools</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasMoreToLoad = filteredNames.length > displayedNames.length;
  const totalFiltered = filteredNames.length;
  const totalSaved = savedNames.length;

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Sort Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tool Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Tools ({selectedToolSlugs.length})
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Tool</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableToolSlugs.map((toolSlug) => (
                  <DropdownMenuCheckboxItem
                    key={toolSlug}
                    checked={selectedToolSlugs.includes(toolSlug)}
                    onCheckedChange={(checked) => handleToolFilterChange(toolSlug, checked)}
                  >
                    {formatToolSlug(toolSlug)}
                  </DropdownMenuCheckboxItem>
                ))}
                {selectedToolSlugs.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedToolSlugs([])}
                    >
                      Clear All
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Options */}
            <Select value={`${sortConfig.field}-${sortConfig.order}`} onValueChange={handleSortChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  {sortConfig.order === 'asc' ? (
                    <SortAsc className="mr-2 h-4 w-4" />
                  ) : (
                    <SortDesc className="mr-2 h-4 w-4" />
                  )}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="favorited_at-desc">Date Saved (Newest)</SelectItem>
                <SelectItem value="favorited_at-asc">Date Saved (Oldest)</SelectItem>
                <SelectItem value="name_text-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_text-desc">Name (Z-A)</SelectItem>
                <SelectItem value="tool_slug-asc">Tool (A-Z)</SelectItem>
                <SelectItem value="tool_slug-desc">Tool (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                disabled={bulkActionLoading || totalFiltered === 0}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                disabled={bulkActionLoading || totalFiltered === 0}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedToolSlugs.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedToolSlugs.map((slug) => (
                <Badge key={slug} variant="secondary" className="gap-1">
                  {formatToolSlug(slug)}
                  <button
                    onClick={() => handleToolFilterChange(slug, false)}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {displayedNames.length} of {totalFiltered} filtered names 
          {totalFiltered !== totalSaved && ` (${totalSaved} total saved)`}
        </p>
      </div>

      {/* Saved Names List */}
      {displayedNames.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Names Match Your Filters</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or removing some filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedNames.map((savedName) => (
            <SavedNameItem
              key={savedName.id}
              savedName={savedName}
              onUnfavorite={handleUnfavorite}
              formatToolSlug={formatToolSlug}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMoreToLoad && (
        <div className="text-center pt-6">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Names
          </Button>
        </div>
      )}
    </div>
  );
} 