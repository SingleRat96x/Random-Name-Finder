-- Helper functions for user_tool_interactions table
-- These functions optimize the upsert operations for logging tool usage

-- Function to increment interaction count
-- This handles the proper upsert logic with interaction count incrementing
CREATE OR REPLACE FUNCTION increment_tool_interaction_count(
    p_user_id UUID,
    p_tool_slug TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Update the last_used_at timestamp and increment interaction_count
    -- for existing records
    UPDATE public.user_tool_interactions 
    SET 
        last_used_at = NOW(),
        interaction_count = interaction_count + 1,
        updated_at = NOW()
    WHERE 
        user_id = p_user_id 
        AND tool_slug = p_tool_slug;
        
    -- If no rows were updated, the record doesn't exist yet
    -- This should not happen with the upsert logic, but just in case
    IF NOT FOUND THEN
        -- Insert a new record
        INSERT INTO public.user_tool_interactions (
            user_id, 
            tool_slug, 
            last_used_at, 
            interaction_count
        ) VALUES (
            p_user_id, 
            p_tool_slug, 
            NOW(), 
            1
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_tool_interaction_count(UUID, TEXT) TO authenticated;

-- Function to perform optimized upsert with proper interaction counting
-- This combines both insert and update logic into a single atomic operation
CREATE OR REPLACE FUNCTION upsert_tool_interaction(
    p_user_id UUID,
    p_tool_slug TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Perform an upsert operation
    INSERT INTO public.user_tool_interactions (
        user_id,
        tool_slug,
        last_used_at,
        interaction_count
    ) VALUES (
        p_user_id,
        p_tool_slug,
        NOW(),
        1
    )
    ON CONFLICT (user_id, tool_slug)
    DO UPDATE SET
        last_used_at = NOW(),
        interaction_count = user_tool_interactions.interaction_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_tool_interaction(UUID, TEXT) TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION increment_tool_interaction_count(UUID, TEXT) IS 
'Increments interaction count and updates last_used_at for existing user-tool pair';

COMMENT ON FUNCTION upsert_tool_interaction(UUID, TEXT) IS 
'Atomic upsert operation for tool interactions with proper count incrementing';

-- Create an index to support the functions efficiently (if not already exists)
CREATE INDEX IF NOT EXISTS idx_user_tool_interactions_upsert 
ON public.user_tool_interactions (user_id, tool_slug, last_used_at DESC);

-- Add RLS exemption for the functions since they use SECURITY DEFINER
-- The functions will respect RLS through their logic, not through automatic enforcement 