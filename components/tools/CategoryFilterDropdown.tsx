'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, ChevronDown } from 'lucide-react';

interface CategoryFilterDropdownProps {
  allCategories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string, isSelected: boolean) => void;
}

export function CategoryFilterDropdown({
  allCategories,
  selectedCategories,
  onCategoryChange,
}: CategoryFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {selectedCategories.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {selectedCategories.length}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[220px]" align="end">
        <DropdownMenuLabel>Categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {allCategories.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No categories available
          </div>
        ) : (
          allCategories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={selectedCategories.includes(category)}
              onCheckedChange={(isChecked) => onCategoryChange(category, isChecked)}
            >
              {category}
            </DropdownMenuCheckboxItem>
          ))
        )}
        
        {selectedCategories.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => selectedCategories.forEach(cat => onCategoryChange(cat, false))}
              >
                Clear All
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 