-- =====================================================
-- Create Content Pages Table
-- =====================================================
-- Purpose: Creates the content_pages table for storing metadata about static pages
-- that can be edited through the admin interface (e.g., About Us, Privacy Policy, etc.)
--
-- This table stores page-level information like title, slug, and meta description
-- while the actual content blocks are stored in the content_blocks table.
--
-- Usage: Execute this in Supabase SQL Editor after profiles table setup
-- =====================================================

-- Create the content_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_pages (
    -- Primary key using UUID for consistency with Supabase patterns
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- URL slug for the page (e.g., 'about-us', 'privacy-policy')
    -- This will be used in URLs like /pages/about-us
    slug TEXT UNIQUE NOT NULL,
    
    -- Page title for <title> tag and main heading
    title TEXT NOT NULL,
    
    -- Meta description for SEO purposes
    meta_description TEXT,
    
    -- Timestamp tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.content_pages IS 'Stores metadata for static pages that can be edited through the admin interface';
COMMENT ON COLUMN public.content_pages.id IS 'Unique identifier for the page';
COMMENT ON COLUMN public.content_pages.slug IS 'URL-friendly identifier used in page URLs (e.g., about-us, privacy-policy)';
COMMENT ON COLUMN public.content_pages.title IS 'Page title used in <title> tag and main heading';
COMMENT ON COLUMN public.content_pages.meta_description IS 'SEO meta description for the page';
COMMENT ON COLUMN public.content_pages.created_at IS 'Timestamp when the page was created';
COMMENT ON COLUMN public.content_pages.updated_at IS 'Timestamp when the page was last updated';

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON public.content_pages(slug);

-- Add constraint to ensure slug follows URL-friendly format
ALTER TABLE public.content_pages 
ADD CONSTRAINT IF NOT EXISTS chk_content_pages_slug_format 
CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Add constraint to ensure title is not empty
ALTER TABLE public.content_pages 
ADD CONSTRAINT IF NOT EXISTS chk_content_pages_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_content_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_content_pages_updated_at ON public.content_pages;
CREATE TRIGGER trigger_update_content_pages_updated_at
    BEFORE UPDATE ON public.content_pages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_content_pages_updated_at();

-- Insert some default pages that are commonly needed
INSERT INTO public.content_pages (slug, title, meta_description) VALUES
    ('about-us', 'About Us', 'Learn more about Random Name Finder and our mission to help you find the perfect names.'),
    ('privacy-policy', 'Privacy Policy', 'Our privacy policy explains how we collect, use, and protect your personal information.'),
    ('terms-of-service', 'Terms of Service', 'Terms and conditions for using the Random Name Finder service.'),
    ('contact', 'Contact Us', 'Get in touch with the Random Name Finder team for support or feedback.')
ON CONFLICT (slug) DO NOTHING;

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'Content pages table created successfully with default pages';
END $$; 