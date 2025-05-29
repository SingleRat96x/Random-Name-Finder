'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { ToolCardSkeleton } from './ToolCardSkeleton';
import { CategoryFilterDropdown } from './CategoryFilterDropdown';
import { fetchAllPublishedToolsMetadata, PublishedToolMetadata } from '@/app/tools/actions';

const INITIAL_LOAD_COUNT = 12;
const LOAD_MORE_COUNT = 12;

export function ToolBrowser() {
  // State management
  const [allTools, setAllTools] = useState<PublishedToolMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tools data on mount
  useEffect(() => {
    const loadTools = async () => {
      try {
        setIsLoading(true);
        const tools = await fetchAllPublishedToolsMetadata();
        setAllTools(tools);
        setError(null);
      } catch (err) {
        console.error('Error loading tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTools();
  }, []);

  // Get unique categories from all tools
  const availableCategories = useMemo(() => {
    const categories = allTools
      .map(tool => tool.category)
      .filter((category): category is string => category !== null && category !== '')
      .filter((category, index, arr) => arr.indexOf(category) === index)
      .sort();
    return categories;
  }, [allTools]);

  // Filter tools based on search term and selected categories
  const filteredTools = useMemo(() => {
    let filtered = allTools;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchLower) ||
        (tool.description && tool.description.toLowerCase().includes(searchLower)) ||
        (tool.category && tool.category.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(tool =>
        tool.category && selectedCategories.includes(tool.category)
      );
    }

    return filtered;
  }, [allTools, searchTerm, selectedCategories]);

  // Get displayed tools (for progressive loading)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, visibleCount);
  }, [filteredTools, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD_COUNT);
  }, [searchTerm, selectedCategories]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle category toggle
  const handleCategoryChange = (category: string, isSelected: boolean) => {
    setSelectedCategories(prev =>
      isSelected
        ? [...prev, category]
        : prev.filter(cat => cat !== category)
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  // Check if there are more tools to load
  const hasMoreTools = displayedTools.length < filteredTools.length;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Name Generator Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover AI-powered name generators for every need. From fantasy characters to business names, 
          find the perfect tool to spark your creativity.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-6">
        {/* Search Bar and Category Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
          {/* Search Bar - takes up more space */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tools by name, description, or category..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          {/* Category Filter Dropdown */}
          <div className="sm:w-auto">
            <CategoryFilterDropdown
              allCategories={availableCategories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {filteredTools.length === 0 ? (
                'No tools found matching your criteria'
              ) : (
                <>
                  Showing {displayedTools.length} of {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
                  {searchTerm || selectedCategories.length > 0 ? ' (filtered)' : ''}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Loading State with Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 12 }, (_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Tools Grid */}
      {!isLoading && displayedTools.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {displayedTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreTools && (
            <div className="text-center">
              <Button 
                onClick={handleLoadMore} 
                variant="outline" 
                size="lg"
                className="px-8"
              >
                Load More Tools ({filteredTools.length - displayedTools.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}

      {/* No Results State */}
      {!isLoading && filteredTools.length === 0 && allTools.length > 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No tools found matching your criteria
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Try adjusting your search terms or clearing the category filters
          </p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
            }}
            variant="outline"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State (no tools at all) */}
      {!isLoading && allTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No tools are currently available
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new name generation tools!
          </p>
        </div>
      )}
    </div>
  );
} 