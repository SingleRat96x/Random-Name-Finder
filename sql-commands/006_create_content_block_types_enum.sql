-- =====================================================
-- Create Content Block Types ENUM
-- =====================================================
-- Purpose: Creates an ENUM type for content block types to ensure data integrity
-- and type safety for the content management system.
--
-- This ENUM defines all the supported content block types that can be used
-- in static pages and tool pages for rich content creation.
--
-- Usage: Execute this in Supabase SQL Editor before creating content_blocks table
-- =====================================================

-- Check if the ENUM type already exists and create it if it doesn't
DO $$
BEGIN
    -- Check if the type exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_block_type_enum') THEN
        -- Create the ENUM type with all supported block types
        CREATE TYPE public.content_block_type_enum AS ENUM (
            -- Heading types for different hierarchy levels
            'heading_h1',
            'heading_h2', 
            'heading_h3',
            'heading_h4',
            'heading_h5',
            'heading_h6',
            
            -- Text content types
            'paragraph',
            'blockquote',
            
            -- List types
            'unordered_list',
            'ordered_list',
            
            -- Media types
            'image',
            'video',
            
            -- Interactive content
            'faq_item',
            'call_to_action_button',
            'contact_form',
            
            -- Layout and structure
            'divider',
            'spacer',
            'two_column_layout',
            'three_column_layout',
            
            -- Special content types
            'code_block',
            'table',
            'embed_iframe',
            
            -- Advertisement placeholders
            'ad_slot_manual',
            'ad_slot_auto',
            
            -- Tool-specific content
            'tool_generator_widget',
            'tool_results_display',
            
            -- SEO and meta content
            'meta_keywords',
            'structured_data'
        );
        
        RAISE NOTICE 'Created content_block_type_enum with % values', 
            (SELECT COUNT(*) FROM unnest(enum_range(NULL::public.content_block_type_enum)));
    ELSE
        RAISE NOTICE 'content_block_type_enum already exists, skipping creation';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON TYPE public.content_block_type_enum IS 'Defines all supported content block types for the CMS system';

-- Function to add new enum values safely (for future extensions)
CREATE OR REPLACE FUNCTION public.add_content_block_type(new_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the value already exists
    IF EXISTS (
        SELECT 1 FROM unnest(enum_range(NULL::public.content_block_type_enum)) AS enum_val 
        WHERE enum_val::TEXT = new_type
    ) THEN
        RAISE NOTICE 'Content block type % already exists', new_type;
        RETURN FALSE;
    END IF;
    
    -- Add the new enum value
    EXECUTE format('ALTER TYPE public.content_block_type_enum ADD VALUE %L', new_type);
    RAISE NOTICE 'Added new content block type: %', new_type;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to add content block type %: %', new_type, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the helper function
COMMENT ON FUNCTION public.add_content_block_type(TEXT) IS 'Safely adds new content block types to the enum';

-- Function to list all available content block types
CREATE OR REPLACE FUNCTION public.get_content_block_types()
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT enum_val::TEXT 
        FROM unnest(enum_range(NULL::public.content_block_type_enum)) AS enum_val
        ORDER BY enum_val::TEXT
    );
END;
$$ LANGUAGE plpgsql;

-- Add comment for the getter function
COMMENT ON FUNCTION public.get_content_block_types() IS 'Returns an array of all available content block types';

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'Content block types ENUM created successfully with % types', 
        array_length(public.get_content_block_types(), 1);
END $$; 