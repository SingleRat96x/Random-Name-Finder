-- =====================================================
-- Create Contact Form Submissions Table
-- =====================================================
-- Purpose: Creates a table to store contact form submissions from the website
-- This provides a temporary solution for contact forms without relying on the CMS
--
-- Usage: Execute this in Supabase SQL Editor
-- =====================================================

-- Create the contact_form_submissions table
CREATE TABLE IF NOT EXISTS public.contact_form_submissions (
    -- Primary key using UUID for consistency
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Additional metadata
    user_agent TEXT,
    ip_address INET,
    referrer_url TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    admin_notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comprehensive comments for documentation
COMMENT ON TABLE public.contact_form_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON COLUMN public.contact_form_submissions.id IS 'Unique identifier for the submission';
COMMENT ON COLUMN public.contact_form_submissions.name IS 'Full name of the person submitting the form';
COMMENT ON COLUMN public.contact_form_submissions.email IS 'Email address of the submitter';
COMMENT ON COLUMN public.contact_form_submissions.subject IS 'Subject line of the contact message';
COMMENT ON COLUMN public.contact_form_submissions.message IS 'Main message content';
COMMENT ON COLUMN public.contact_form_submissions.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN public.contact_form_submissions.ip_address IS 'IP address of the submitter';
COMMENT ON COLUMN public.contact_form_submissions.referrer_url IS 'URL the user came from';
COMMENT ON COLUMN public.contact_form_submissions.status IS 'Current status of the submission';
COMMENT ON COLUMN public.contact_form_submissions.admin_notes IS 'Internal notes for admin reference';
COMMENT ON COLUMN public.contact_form_submissions.submitted_at IS 'Timestamp when form was submitted';
COMMENT ON COLUMN public.contact_form_submissions.read_at IS 'Timestamp when first read by admin';
COMMENT ON COLUMN public.contact_form_submissions.replied_at IS 'Timestamp when reply was sent';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_form_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read_status ON public.contact_form_submissions(status, submitted_at DESC);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_admin_view 
ON public.contact_form_submissions(status, submitted_at DESC, email);

-- Add email validation constraint
ALTER TABLE public.contact_form_submissions 
ADD CONSTRAINT chk_contact_submissions_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraint for name length
ALTER TABLE public.contact_form_submissions 
ADD CONSTRAINT chk_contact_submissions_name_length 
CHECK (char_length(trim(name)) >= 2);

-- Add constraint for message length
ALTER TABLE public.contact_form_submissions 
ADD CONSTRAINT chk_contact_submissions_message_length 
CHECK (char_length(trim(message)) >= 10);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS trigger_update_contact_submissions_updated_at ON public.contact_form_submissions;
CREATE TRIGGER trigger_update_contact_submissions_updated_at
    BEFORE UPDATE ON public.contact_form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_submissions_updated_at();

-- Function to get submission statistics
CREATE OR REPLACE FUNCTION public.get_contact_submission_stats()
RETURNS TABLE (
    total_submissions BIGINT,
    new_submissions BIGINT,
    read_submissions BIGINT,
    replied_submissions BIGINT,
    archived_submissions BIGINT,
    this_week_submissions BIGINT,
    this_month_submissions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_submissions,
        COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_submissions,
        COUNT(*) FILTER (WHERE status = 'read')::BIGINT as read_submissions,
        COUNT(*) FILTER (WHERE status = 'replied')::BIGINT as replied_submissions,
        COUNT(*) FILTER (WHERE status = 'archived')::BIGINT as archived_submissions,
        COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days')::BIGINT as this_week_submissions,
        COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '30 days')::BIGINT as this_month_submissions
    FROM public.contact_form_submissions;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the stats function
COMMENT ON FUNCTION public.get_contact_submission_stats() IS 'Returns statistics about contact form submissions';

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'Contact form submissions table created successfully';
END $$; 