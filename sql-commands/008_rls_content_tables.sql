-- =====================================================
-- Row Level Security for Content Tables
-- =====================================================
-- Purpose: Enables RLS and defines security policies for content_pages and content_blocks tables
-- 
-- Security Model:
-- - Public users can read all content (SELECT)
-- - Only admin users can create, update, or delete content
-- - Admin role is determined by checking the profiles table
--
-- Usage: Execute this in Supabase SQL Editor after creating content tables
-- =====================================================

-- Enable RLS on content_pages table
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on content_blocks table  
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONTENT PAGES POLICIES
-- =====================================================

-- Create policies for content_pages (idempotent)
DO $$
BEGIN
    -- Policy: Allow public read access to all content pages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_pages' AND policyname = 'content_pages_select_public'
    ) THEN
        CREATE POLICY "content_pages_select_public" 
        ON public.content_pages FOR SELECT 
        TO public 
        USING (true);
    END IF;

    -- Policy: Allow admin users to view all content pages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_pages' AND policyname = 'content_pages_select_admin'
    ) THEN
        CREATE POLICY "content_pages_select_admin" 
        ON public.content_pages FOR SELECT 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to insert new content pages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_pages' AND policyname = 'content_pages_insert_admin'
    ) THEN
        CREATE POLICY "content_pages_insert_admin" 
        ON public.content_pages FOR INSERT 
        TO authenticated 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to update content pages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_pages' AND policyname = 'content_pages_update_admin'
    ) THEN
        CREATE POLICY "content_pages_update_admin" 
        ON public.content_pages FOR UPDATE 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to delete content pages
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_pages' AND policyname = 'content_pages_delete_admin'
    ) THEN
        CREATE POLICY "content_pages_delete_admin" 
        ON public.content_pages FOR DELETE 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;
END $$;

-- =====================================================
-- CONTENT BLOCKS POLICIES
-- =====================================================

-- Create policies for content_blocks (idempotent)
DO $$
BEGIN
    -- Policy: Allow public read access to all content blocks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_blocks' AND policyname = 'content_blocks_select_public'
    ) THEN
        CREATE POLICY "content_blocks_select_public" 
        ON public.content_blocks FOR SELECT 
        TO public 
        USING (true);
    END IF;

    -- Policy: Allow admin users to view all content blocks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_blocks' AND policyname = 'content_blocks_select_admin'
    ) THEN
        CREATE POLICY "content_blocks_select_admin" 
        ON public.content_blocks FOR SELECT 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to insert new content blocks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_blocks' AND policyname = 'content_blocks_insert_admin'
    ) THEN
        CREATE POLICY "content_blocks_insert_admin" 
        ON public.content_blocks FOR INSERT 
        TO authenticated 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to update content blocks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_blocks' AND policyname = 'content_blocks_update_admin'
    ) THEN
        CREATE POLICY "content_blocks_update_admin" 
        ON public.content_blocks FOR UPDATE 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    -- Policy: Allow admin users to delete content blocks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_blocks' AND policyname = 'content_blocks_delete_admin'
    ) THEN
        CREATE POLICY "content_blocks_delete_admin" 
        ON public.content_blocks FOR DELETE 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS FOR ADMIN CHECKS
-- =====================================================

-- Function to check if current user is admin (for use in application code)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for the helper function
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has admin role';

-- Function to get current user role (for use in application code)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM public.profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for the role getter function
COMMENT ON FUNCTION public.get_current_user_role() IS 'Returns the role of the current authenticated user';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on the content_block_type_enum to authenticated users
GRANT USAGE ON TYPE public.content_block_type_enum TO authenticated;
GRANT USAGE ON TYPE public.content_block_type_enum TO anon;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_page_blocks(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_tool_blocks(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_content_block_types() TO authenticated, anon;

-- =====================================================
-- VALIDATION AND TESTING
-- =====================================================

-- Function to test RLS policies (for admin testing)
CREATE OR REPLACE FUNCTION public.test_content_rls()
RETURNS TABLE (
    test_name TEXT,
    result BOOLEAN,
    message TEXT
) AS $$
DECLARE
    test_page_id UUID;
    test_block_id UUID;
    is_user_admin BOOLEAN;
BEGIN
    -- Check if current user is admin
    is_user_admin := public.is_admin();
    
    -- Test 1: Can read content pages
    BEGIN
        SELECT id INTO test_page_id FROM public.content_pages LIMIT 1;
        RETURN QUERY SELECT 'Read content pages'::TEXT, true, 'Can read content pages'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Read content pages'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test 2: Can read content blocks
    BEGIN
        SELECT id INTO test_block_id FROM public.content_blocks LIMIT 1;
        RETURN QUERY SELECT 'Read content blocks'::TEXT, true, 'Can read content blocks'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Read content blocks'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test 3: Admin check
    RETURN QUERY SELECT 'Admin status'::TEXT, is_user_admin, 
        CASE WHEN is_user_admin THEN 'User is admin' ELSE 'User is not admin' END::TEXT;
    
    -- Test 4: Try to insert (should work for admin, fail for non-admin)
    IF is_user_admin THEN
        BEGIN
            INSERT INTO public.content_pages (slug, title) VALUES ('test-rls-' || gen_random_uuid()::TEXT, 'Test Page');
            RETURN QUERY SELECT 'Insert test (admin)'::TEXT, true, 'Admin can insert'::TEXT;
            -- Clean up
            DELETE FROM public.content_pages WHERE slug LIKE 'test-rls-%';
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'Insert test (admin)'::TEXT, false, SQLERRM::TEXT;
        END;
    ELSE
        RETURN QUERY SELECT 'Insert test (non-admin)'::TEXT, false, 'Non-admin cannot insert (expected)'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for the test function
COMMENT ON FUNCTION public.test_content_rls() IS 'Tests RLS policies for content tables';

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'RLS policies created successfully for content tables';
    RAISE NOTICE 'Public users can read content, only admins can modify';
    RAISE NOTICE 'Use SELECT * FROM public.test_content_rls() to test policies';
END $$; 