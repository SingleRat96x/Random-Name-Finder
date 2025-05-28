-- =====================================================
-- Create Tools Table
-- =====================================================
-- Purpose: Creates the tools table for storing name generator tool definitions
-- and configurations. This table will store metadata, AI prompt configurations,
-- and form field definitions for each tool.
--
-- Usage: Execute this in Supabase SQL Editor after content system is set up
-- =====================================================

-- Create the tools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tools (
    -- Primary key using UUID for consistency with Supabase patterns
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User-facing name of the tool
    name TEXT NOT NULL,
    
    -- URL-friendly slug for routing (must be unique)
    slug TEXT UNIQUE NOT NULL,
    
    -- Short description for admin list and tool listing pages
    description TEXT,
    
    -- Optional icon name (e.g., Lucide icon name) for UI
    icon_name TEXT,
    
    -- Core category for AI prompt generation (e.g., "cat names", "fantasy city names")
    ai_prompt_category TEXT NOT NULL,
    
    -- Preferred AI model for this tool (e.g., "openai/gpt-3.5-turbo")
    ai_model_preference TEXT,
    
    -- Default parameters for the tool's form (JSONB for flexibility)
    -- Example: {"tone": "playful", "count": 10, "first_last_option": false}
    default_parameters JSONB DEFAULT '{}',
    
    -- Configuration for form fields shown on public tool page
    -- Example: [{"name": "tone", "label": "Tone", "type": "select", "options": ["playful", "mysterious", "regal"]}, {"name": "count", "label": "Number of Names", "type": "number", "default": 10}]
    configurable_fields JSONB DEFAULT '[]',
    
    -- Controls visibility on public site
    is_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamp tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comprehensive comments for documentation
COMMENT ON TABLE public.tools IS 'Stores name generator tool definitions and configurations';
COMMENT ON COLUMN public.tools.id IS 'Unique identifier for the tool';
COMMENT ON COLUMN public.tools.name IS 'User-facing name of the tool (e.g., "Random Cat Name Generator")';
COMMENT ON COLUMN public.tools.slug IS 'URL-friendly identifier (e.g., "random-cat-name-generator")';
COMMENT ON COLUMN public.tools.description IS 'Short description for admin and public listing';
COMMENT ON COLUMN public.tools.icon_name IS 'Optional icon name for UI (e.g., Lucide icon)';
COMMENT ON COLUMN public.tools.ai_prompt_category IS 'Core category for AI prompt generation';
COMMENT ON COLUMN public.tools.ai_model_preference IS 'Preferred AI model for this tool';
COMMENT ON COLUMN public.tools.default_parameters IS 'Default parameters for tool form (JSONB)';
COMMENT ON COLUMN public.tools.configurable_fields IS 'Form field definitions for public tool page (JSONB)';
COMMENT ON COLUMN public.tools.is_published IS 'Controls visibility on public site';
COMMENT ON COLUMN public.tools.created_at IS 'Timestamp when the tool was created';
COMMENT ON COLUMN public.tools.updated_at IS 'Timestamp when the tool was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tools_slug ON public.tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_is_published ON public.tools(is_published);
CREATE INDEX IF NOT EXISTS idx_tools_ai_prompt_category ON public.tools(ai_prompt_category);

-- Composite index for published tools (for public listing)
CREATE INDEX IF NOT EXISTS idx_tools_published_name 
ON public.tools(is_published, name) WHERE is_published = true;

-- Add constraints for data integrity (idempotent)
DO $$
BEGIN
    -- Add constraint for slug format (URL-friendly)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_tools_slug_format' 
        AND table_name = 'tools'
    ) THEN
        ALTER TABLE public.tools 
        ADD CONSTRAINT chk_tools_slug_format 
        CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
    END IF;

    -- Add constraint to ensure name is not empty
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_tools_name_not_empty' 
        AND table_name = 'tools'
    ) THEN
        ALTER TABLE public.tools 
        ADD CONSTRAINT chk_tools_name_not_empty 
        CHECK (LENGTH(TRIM(name)) > 0);
    END IF;

    -- Add constraint to ensure ai_prompt_category is not empty
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_tools_ai_prompt_category_not_empty' 
        AND table_name = 'tools'
    ) THEN
        ALTER TABLE public.tools 
        ADD CONSTRAINT chk_tools_ai_prompt_category_not_empty 
        CHECK (LENGTH(TRIM(ai_prompt_category)) > 0);
    END IF;
END $$;

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_tools_updated_at ON public.tools;
CREATE TRIGGER trigger_update_tools_updated_at
    BEFORE UPDATE ON public.tools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tools_updated_at();

-- Helper function to get published tools for public listing
CREATE OR REPLACE FUNCTION public.get_published_tools()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.icon_name,
        t.created_at,
        t.updated_at
    FROM public.tools t
    WHERE t.is_published = true
    ORDER BY t.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get a tool by slug (for public tool pages)
CREATE OR REPLACE FUNCTION public.get_tool_by_slug(tool_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    icon_name TEXT,
    ai_prompt_category TEXT,
    ai_model_preference TEXT,
    default_parameters JSONB,
    configurable_fields JSONB,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        t.description,
        t.icon_name,
        t.ai_prompt_category,
        t.ai_model_preference,
        t.default_parameters,
        t.configurable_fields,
        t.is_published,
        t.created_at,
        t.updated_at
    FROM public.tools t
    WHERE t.slug = tool_slug
    AND t.is_published = true;
END;
$$ LANGUAGE plpgsql;

-- Add comments for the helper functions
COMMENT ON FUNCTION public.get_published_tools() IS 'Returns all published tools for public listing';
COMMENT ON FUNCTION public.get_tool_by_slug(TEXT) IS 'Returns a published tool by its slug for public tool pages';

-- Insert some example tools for testing
DO $$
BEGIN
    -- Insert example tools if they don't exist
    INSERT INTO public.tools (name, slug, description, icon_name, ai_prompt_category, ai_model_preference, default_parameters, configurable_fields, is_published) VALUES
        (
            'Random Cat Name Generator',
            'random-cat-name-generator',
            'Generate unique and creative names for your feline friends',
            'Cat',
            'cat names',
            'openai/gpt-3.5-turbo',
            '{"tone": "playful", "count": 10}',
            '[{"name": "tone", "label": "Tone", "type": "select", "options": ["playful", "mysterious", "regal", "cute"], "default": "playful"}, {"name": "count", "label": "Number of Names", "type": "number", "min": 1, "max": 50, "default": 10}]',
            true
        ),
        (
            'Fantasy City Name Generator',
            'fantasy-city-name-generator',
            'Create mystical and epic names for fantasy cities and towns',
            'Castle',
            'fantasy city names',
            'openai/gpt-3.5-turbo',
            '{"style": "medieval", "count": 8}',
            '[{"name": "style", "label": "Style", "type": "select", "options": ["medieval", "elvish", "dwarven", "mystical"], "default": "medieval"}, {"name": "count", "label": "Number of Names", "type": "number", "min": 1, "max": 30, "default": 8}]',
            true
        ),
        (
            'Business Name Generator',
            'business-name-generator',
            'Generate professional and memorable business names',
            'Building',
            'business names',
            'openai/gpt-3.5-turbo',
            '{"industry": "general", "style": "professional", "count": 12}',
            '[{"name": "industry", "label": "Industry", "type": "select", "options": ["general", "tech", "retail", "consulting", "creative"], "default": "general"}, {"name": "style", "label": "Style", "type": "select", "options": ["professional", "creative", "modern", "classic"], "default": "professional"}, {"name": "count", "label": "Number of Names", "type": "number", "min": 1, "max": 25, "default": 12}]',
            false
        )
    ON CONFLICT (slug) DO NOTHING;
END $$; 