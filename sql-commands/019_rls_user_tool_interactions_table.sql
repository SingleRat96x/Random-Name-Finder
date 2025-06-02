-- Row Level Security (RLS) policies for user_tool_interactions table
-- Ensures users can only access their own interaction records

-- Enable RLS on the table (idempotent)
ALTER TABLE public.user_tool_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can insert their own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can update their own tool interactions" ON public.user_tool_interactions;
DROP POLICY IF EXISTS "Users can delete their own tool interactions" ON public.user_tool_interactions;

-- Policy for SELECT: Users can only view their own tool interactions
CREATE POLICY "Users can view their own tool interactions"
ON public.user_tool_interactions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for INSERT: Users can only insert records for themselves
CREATE POLICY "Users can insert their own tool interactions"
ON public.user_tool_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can only update their own tool interactions
-- This is important for the upsert operation in logToolUsage
CREATE POLICY "Users can update their own tool interactions"
ON public.user_tool_interactions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can only delete their own tool interactions
-- This allows users to clear their interaction history if needed
CREATE POLICY "Users can delete their own tool interactions"
ON public.user_tool_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- Add helpful comments on policies
COMMENT ON POLICY "Users can view their own tool interactions" ON public.user_tool_interactions IS 
'Allows users to SELECT only their own tool interaction records';

COMMENT ON POLICY "Users can insert their own tool interactions" ON public.user_tool_interactions IS 
'Allows users to INSERT new tool interaction records for themselves';

COMMENT ON POLICY "Users can update their own tool interactions" ON public.user_tool_interactions IS 
'Allows users to UPDATE their own tool interaction records (needed for upsert operations)';

COMMENT ON POLICY "Users can delete their own tool interactions" ON public.user_tool_interactions IS 
'Allows users to DELETE their own tool interaction records';

-- Note: No admin-specific policies are needed for this table since it's purely user-generated data
-- The application logic handles admin access patterns separately if needed 