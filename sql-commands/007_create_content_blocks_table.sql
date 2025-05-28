-- =====================================================
-- Create Content Blocks Table
-- =====================================================
-- Purpose: Creates the content_blocks table for storing structured content blocks
-- that can be associated with either static pages or tool pages.
--
-- This table uses JSONB for flexible content storage and supports various
-- block types for rich content creation and strategic ad placement.
--
-- Usage: Execute this in Supabase SQL Editor after content_pages table and ENUM creation
-- =====================================================

-- Create the content_blocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_blocks (
    -- Primary key using UUID for consistency with Supabase patterns
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to content_pages (nullable - used for static pages)
    page_id UUID REFERENCES public.content_pages(id) ON DELETE CASCADE,
    
    -- Tool slug for tool pages (nullable - temporary until tools table exists)
    -- This will be replaced with tool_id FK when tools table is created
    tool_slug TEXT,
    
    -- Type of content block using the ENUM for type safety
    block_type public.content_block_type_enum NOT NULL,
    
    -- Flexible JSONB storage for block-specific data
    content_data JSONB NOT NULL DEFAULT '{}',
    
    -- Sort order for arranging blocks on a page
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamp tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: block must belong to either a page OR a tool, but not both or neither
    CONSTRAINT chk_content_blocks_belongs_to_page_or_tool 
    CHECK (
        (page_id IS NOT NULL AND tool_slug IS NULL) OR 
        (page_id IS NULL AND tool_slug IS NOT NULL)
    )
);

-- Add comprehensive comments for documentation
COMMENT ON TABLE public.content_blocks IS 'Stores structured content blocks for static pages and tool pages';
COMMENT ON COLUMN public.content_blocks.id IS 'Unique identifier for the content block';
COMMENT ON COLUMN public.content_blocks.page_id IS 'Foreign key to content_pages table (for static pages)';
COMMENT ON COLUMN public.content_blocks.tool_slug IS 'Tool identifier (temporary - will be replaced with tool_id FK)';
COMMENT ON COLUMN public.content_blocks.block_type IS 'Type of content block (heading, paragraph, image, etc.)';
COMMENT ON COLUMN public.content_blocks.content_data IS 'JSONB data specific to the block type';
COMMENT ON COLUMN public.content_blocks.sort_order IS 'Order of blocks on the page (lower numbers appear first)';
COMMENT ON COLUMN public.content_blocks.created_at IS 'Timestamp when the block was created';
COMMENT ON COLUMN public.content_blocks.updated_at IS 'Timestamp when the block was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_id ON public.content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_tool_slug ON public.content_blocks(tool_slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_sort_order ON public.content_blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_content_blocks_block_type ON public.content_blocks(block_type);

-- Composite index for page blocks ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_sorted 
ON public.content_blocks(page_id, sort_order) WHERE page_id IS NOT NULL;

-- Composite index for tool blocks ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_content_blocks_tool_sorted 
ON public.content_blocks(tool_slug, sort_order) WHERE tool_slug IS NOT NULL;

-- Add constraint for tool_slug format (URL-friendly)
ALTER TABLE public.content_blocks 
ADD CONSTRAINT IF NOT EXISTS chk_content_blocks_tool_slug_format 
CHECK (tool_slug IS NULL OR tool_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Add constraint to ensure sort_order is non-negative
ALTER TABLE public.content_blocks 
ADD CONSTRAINT IF NOT EXISTS chk_content_blocks_sort_order_positive 
CHECK (sort_order >= 0);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_content_blocks_updated_at ON public.content_blocks;
CREATE TRIGGER trigger_update_content_blocks_updated_at
    BEFORE UPDATE ON public.content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_content_blocks_updated_at();

-- Function to get blocks for a specific page ordered by sort_order
CREATE OR REPLACE FUNCTION public.get_page_blocks(page_slug TEXT)
RETURNS TABLE (
    id UUID,
    block_type TEXT,
    content_data JSONB,
    sort_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cb.id,
        cb.block_type::TEXT,
        cb.content_data,
        cb.sort_order,
        cb.created_at,
        cb.updated_at
    FROM public.content_blocks cb
    JOIN public.content_pages cp ON cb.page_id = cp.id
    WHERE cp.slug = page_slug
    ORDER BY cb.sort_order ASC, cb.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get blocks for a specific tool ordered by sort_order
CREATE OR REPLACE FUNCTION public.get_tool_blocks(tool_slug_param TEXT)
RETURNS TABLE (
    id UUID,
    block_type TEXT,
    content_data JSONB,
    sort_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cb.id,
        cb.block_type::TEXT,
        cb.content_data,
        cb.sort_order,
        cb.created_at,
        cb.updated_at
    FROM public.content_blocks cb
    WHERE cb.tool_slug = tool_slug_param
    ORDER BY cb.sort_order ASC, cb.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for the helper functions
COMMENT ON FUNCTION public.get_page_blocks(TEXT) IS 'Returns all content blocks for a page ordered by sort_order';
COMMENT ON FUNCTION public.get_tool_blocks(TEXT) IS 'Returns all content blocks for a tool ordered by sort_order';

-- Insert some example content blocks for the default pages
DO $$
DECLARE
    about_page_id UUID;
    privacy_page_id UUID;
    terms_page_id UUID;
    contact_page_id UUID;
BEGIN
    -- Get page IDs
    SELECT id INTO about_page_id FROM public.content_pages WHERE slug = 'about-us';
    SELECT id INTO privacy_page_id FROM public.content_pages WHERE slug = 'privacy-policy';
    SELECT id INTO terms_page_id FROM public.content_pages WHERE slug = 'terms-of-service';
    SELECT id INTO contact_page_id FROM public.content_pages WHERE slug = 'contact';
    
    -- Insert example blocks for About Us page
    IF about_page_id IS NOT NULL THEN
        INSERT INTO public.content_blocks (page_id, block_type, content_data, sort_order) VALUES
            (about_page_id, 'heading_h1', '{"text": "About Random Name Finder"}', 10),
            (about_page_id, 'paragraph', '{"html_content": "<p>Welcome to Random Name Finder, your go-to resource for discovering unique and creative names for all your needs.</p>"}', 20),
            (about_page_id, 'heading_h2', '{"text": "Our Mission"}', 30),
            (about_page_id, 'paragraph', '{"html_content": "<p>We believe that finding the perfect name should be easy, fun, and inspiring. Our tools help you generate names for characters, businesses, projects, and more.</p>"}', 40)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Insert example blocks for Contact page
    IF contact_page_id IS NOT NULL THEN
        INSERT INTO public.content_blocks (page_id, block_type, content_data, sort_order) VALUES
            (contact_page_id, 'heading_h1', '{"text": "Contact Us"}', 10),
            (contact_page_id, 'paragraph', '{"html_content": "<p>Have questions, suggestions, or feedback? We''d love to hear from you!</p>"}', 20),
            (contact_page_id, 'contact_form', '{"form_id": "main_contact", "fields": ["name", "email", "subject", "message"]}', 30)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'Content blocks table created successfully with example content';
    RAISE NOTICE 'Total content blocks: %', (SELECT COUNT(*) FROM public.content_blocks);
END $$; 