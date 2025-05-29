-- ============================================================================
-- Create user_saved_names table for storing user's favorited names
-- ============================================================================
-- Purpose: Store names that logged-in users have favorited/saved for later reference
-- Dependencies: Requires auth.users table (Supabase Auth)
-- Migration: 014_create_user_saved_names_table.sql
-- Created: Phase 2.4 & 2.5 Implementation
-- ============================================================================

-- Create the user_saved_names table
CREATE TABLE IF NOT EXISTS public.user_saved_names (
    -- Primary key: unique identifier for each saved name entry
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to auth.users: which user saved this name
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- The actual saved name text
    name_text TEXT NOT NULL,
    
    -- Tool slug context: which tool generated this name
    tool_slug TEXT NOT NULL,
    
    -- Timestamp when the name was favorited
    favorited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure user can't save the same name from the same tool twice
    CONSTRAINT unique_user_name_tool UNIQUE (user_id, name_text, tool_slug)
);

-- ============================================================================
-- Create indexes for performance optimization
-- ============================================================================

-- Index on user_id for fast retrieval of a user's saved names
CREATE INDEX IF NOT EXISTS idx_user_saved_names_user_id 
ON public.user_saved_names(user_id);

-- Composite index for efficient "is this name already favorited?" checks
CREATE INDEX IF NOT EXISTS idx_user_saved_names_lookup 
ON public.user_saved_names(user_id, name_text, tool_slug);

-- Index on favorited_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_user_saved_names_favorited_at 
ON public.user_saved_names(favorited_at DESC);

-- Index on tool_slug for filtering by tool
CREATE INDEX IF NOT EXISTS idx_user_saved_names_tool_slug 
ON public.user_saved_names(tool_slug);

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE public.user_saved_names IS 
'Stores names that logged-in users have favorited/saved from various name generation tools';

COMMENT ON COLUMN public.user_saved_names.id IS 
'Unique identifier for each saved name entry';

COMMENT ON COLUMN public.user_saved_names.user_id IS 
'Foreign key reference to auth.users - identifies which user saved this name';

COMMENT ON COLUMN public.user_saved_names.name_text IS 
'The actual name text that was saved/favorited by the user';

COMMENT ON COLUMN public.user_saved_names.tool_slug IS 
'Slug identifier of the tool that generated this name (provides context)';

COMMENT ON COLUMN public.user_saved_names.favorited_at IS 
'Timestamp when the user favorited/saved this name';

COMMENT ON CONSTRAINT unique_user_name_tool ON public.user_saved_names IS 
'Prevents duplicate entries: a user cannot save the same name from the same tool twice'; 