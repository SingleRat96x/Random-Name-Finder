-- ============================================================================
-- Add accent_color_class column to tools table for visual styling
-- ============================================================================
-- Purpose: Add an accent color class field to the tools table for visual customization
-- Dependencies: Requires tools table (009_create_tools_table.sql)
-- Migration: 017_alter_tools_table_add_accent_color.sql
-- Created: Phase 5.1E Implementation
-- ============================================================================

-- Add accent_color_class column to the tools table
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS accent_color_class TEXT;

-- ============================================================================
-- Add column comment for documentation
-- ============================================================================

COMMENT ON COLUMN public.tools.accent_color_class IS 
'Optional Tailwind CSS class string for visual accent on tool cards (e.g., "border-t-4 border-blue-500", "text-green-600"). Used for styling tool cards on the public listing page.';

-- ============================================================================
-- Verification query (optional - for testing)
-- ============================================================================

-- Uncomment to verify the column was added successfully:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'tools' AND column_name = 'accent_color_class'; 