-- ============================================================================
-- Add category column to tools table for tool categorization
-- ============================================================================
-- Purpose: Add a category field to the tools table to enable grouping and filtering
-- Dependencies: Requires tools table (009_create_tools_table.sql)
-- Migration: 016_alter_tools_table_add_category.sql
-- Created: Phase 5.3 Implementation
-- ============================================================================

-- Add category column to the tools table
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS category TEXT;

-- ============================================================================
-- Create index for performance optimization
-- ============================================================================

-- Index on category for fast filtering on the public tools listing page
CREATE INDEX IF NOT EXISTS idx_tools_category 
ON public.tools(category);

-- Composite index for published tools by category (common query pattern)
CREATE INDEX IF NOT EXISTS idx_tools_published_category 
ON public.tools(is_published, category) WHERE is_published = true;

-- ============================================================================
-- Add column comment for documentation
-- ============================================================================

COMMENT ON COLUMN public.tools.category IS 
'Category for grouping tools on public listing page (e.g., "Fantasy", "Sci-Fi", "Pet Names", "Business"). Used for filtering and organization.';

-- ============================================================================
-- Verification query (optional - for testing)
-- ============================================================================

-- Uncomment to verify the column was added successfully:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'tools' AND column_name = 'category'; 