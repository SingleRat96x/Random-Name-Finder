-- ============================================================================
-- Row Level Security (RLS) policies for user_saved_names table
-- ============================================================================
-- Purpose: Ensure users can only access, modify, and delete their own saved names
-- Dependencies: Requires user_saved_names table (014_create_user_saved_names_table.sql)
-- Migration: 015_rls_user_saved_names_table.sql
-- Created: Phase 2.4 & 2.5 Implementation
-- ============================================================================

-- Enable Row Level Security on the user_saved_names table
ALTER TABLE public.user_saved_names ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT Policy: Users can only view their own saved names
-- ============================================================================
CREATE POLICY "Users can view their own saved names"
ON public.user_saved_names
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================================
-- INSERT Policy: Users can only save names for themselves
-- ============================================================================
CREATE POLICY "Users can save names for themselves"
ON public.user_saved_names
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DELETE Policy: Users can only delete their own saved names
-- ============================================================================
CREATE POLICY "Users can delete their own saved names"
ON public.user_saved_names
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATE Policy: Users can only update their own saved names (if needed)
-- ============================================================================
-- Note: Updates may not be necessary for this use case, but included for completeness
CREATE POLICY "Users can update their own saved names"
ON public.user_saved_names
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Policy Comments for documentation
-- ============================================================================

COMMENT ON POLICY "Users can view their own saved names" ON public.user_saved_names IS 
'Allows users to SELECT only their own saved names based on user_id matching auth.uid()';

COMMENT ON POLICY "Users can save names for themselves" ON public.user_saved_names IS 
'Allows users to INSERT new saved names only for their own user_id';

COMMENT ON POLICY "Users can delete their own saved names" ON public.user_saved_names IS 
'Allows users to DELETE only their own saved names based on user_id matching auth.uid()';

COMMENT ON POLICY "Users can update their own saved names" ON public.user_saved_names IS 
'Allows users to UPDATE only their own saved names (included for completeness)'; 