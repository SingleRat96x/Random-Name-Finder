-- =====================================================
-- Row Level Security (RLS) for Tools Table
-- =====================================================
-- Purpose: Sets up Row Level Security policies for the tools table
-- to ensure proper access control for tool management.
--
-- Access Rules:
-- - Admins: Full CRUD access to all tools
-- - Authenticated users: Read access to published tools only
-- - Public: Read access to published tools only (for future public listing)
--
-- Usage: Execute this in Supabase SQL Editor after creating the tools table
-- =====================================================

-- Enable Row Level Security on the tools table
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can perform ALL operations on tools
-- This policy allows users with 'admin' role to create, read, update, and delete any tool
CREATE POLICY "Admins can manage all tools" ON public.tools
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy 2: Authenticated users can read published tools
-- This allows authenticated users to view tools that are marked as published
CREATE POLICY "Authenticated users can read published tools" ON public.tools
    FOR SELECT
    TO authenticated
    USING (is_published = true);

-- Policy 3: Public (anonymous) users can read published tools
-- This allows anonymous users to view published tools for public tool listing
CREATE POLICY "Public can read published tools" ON public.tools
    FOR SELECT
    TO anon
    USING (is_published = true);

-- Add comments for documentation
COMMENT ON POLICY "Admins can manage all tools" ON public.tools IS 
    'Allows users with admin role to perform all CRUD operations on tools';

COMMENT ON POLICY "Authenticated users can read published tools" ON public.tools IS 
    'Allows authenticated users to read tools that are published';

COMMENT ON POLICY "Public can read published tools" ON public.tools IS 
    'Allows anonymous users to read published tools for public listing';

-- Create helper function to check if current user is admin (for use in server actions)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for the helper function
COMMENT ON FUNCTION public.is_current_user_admin() IS 
    'Returns true if the current authenticated user has admin role';

-- Grant necessary permissions
-- Grant usage on the tools table to authenticated and anonymous users
GRANT SELECT ON public.tools TO authenticated, anon;
GRANT ALL ON public.tools TO authenticated; -- Admins will be filtered by RLS

-- Grant usage on the helper functions
GRANT EXECUTE ON FUNCTION public.get_published_tools() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_tool_by_slug(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated; 