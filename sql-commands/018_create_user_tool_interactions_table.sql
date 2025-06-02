-- Create user_tool_interactions table for tracking user tool usage
-- This table stores records of users interacting with tools, focusing on last_used_at timestamp
-- to enable "Recently Used Tools" functionality in the user dashboard

-- Create the table (idempotent)
CREATE TABLE IF NOT EXISTS public.user_tool_interactions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to auth.users table
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tool identifier (references tools.slug)
    tool_slug TEXT NOT NULL,
    
    -- Timestamp of last interaction with this tool
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Optional: count of total interactions (can be incremented on each use)
    interaction_count INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint to ensure one record per user-tool pair
-- This enables efficient upsert operations in logToolUsage
ALTER TABLE public.user_tool_interactions 
ADD CONSTRAINT IF NOT EXISTS user_tool_interactions_user_tool_unique 
UNIQUE (user_id, tool_slug);

-- Create indexes for efficient querying

-- Index on user_id for general user-based queries
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_user_id 
ON public.user_tool_interactions (user_id);

-- Index on tool_slug for tool-based analytics (optional)
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_tool_slug 
ON public.user_tool_interactions (tool_slug);

-- Composite index on (user_id, last_used_at DESC) for efficiently fetching
-- recent interactions for a specific user - this is the primary query pattern
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_user_recent 
ON public.user_tool_interactions (user_id, last_used_at DESC);

-- Index on last_used_at for general temporal queries
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_last_used 
ON public.user_tool_interactions (last_used_at DESC);

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_user_tool_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (idempotent)
DROP TRIGGER IF EXISTS trigger_update_user_tool_interactions_updated_at 
ON public.user_tool_interactions;

CREATE TRIGGER trigger_update_user_tool_interactions_updated_at
    BEFORE UPDATE ON public.user_tool_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_tool_interactions_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.user_tool_interactions IS 
'Tracks user interactions with tools for dashboard "Recently Used Tools" feature';

COMMENT ON COLUMN public.user_tool_interactions.user_id IS 
'References auth.users.id - the user who used the tool';

COMMENT ON COLUMN public.user_tool_interactions.tool_slug IS 
'References tools.slug - identifier of the tool used';

COMMENT ON COLUMN public.user_tool_interactions.last_used_at IS 
'Timestamp of the most recent interaction with this tool by this user';

COMMENT ON COLUMN public.user_tool_interactions.interaction_count IS 
'Total number of times this user has used this tool';

COMMENT ON INDEX idx_user_tool_interactions_user_recent IS 
'Optimized for fetching recent tool interactions for dashboard display'; 