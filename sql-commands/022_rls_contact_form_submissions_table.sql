-- =====================================================
-- Row Level Security for Contact Form Submissions Table
-- =====================================================
-- Purpose: Sets up RLS policies to secure contact form submissions
-- Only authenticated admin users should be able to view/manage submissions
--
-- Usage: Execute this in Supabase SQL Editor after creating the table
-- =====================================================

-- Enable RLS on the contact_form_submissions table
ALTER TABLE public.contact_form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserting new contact form submissions (public access for form submission)
CREATE POLICY "Anyone can insert contact form submissions"
ON public.contact_form_submissions
FOR INSERT
WITH CHECK (true);

-- Policy: Only admin users can view contact form submissions
CREATE POLICY "Admin users can view all contact form submissions"
ON public.contact_form_submissions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: Only admin users can update contact form submissions
CREATE POLICY "Admin users can update contact form submissions"
ON public.contact_form_submissions
FOR UPDATE
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

-- Policy: Only admin users can delete contact form submissions (if needed)
CREATE POLICY "Admin users can delete contact form submissions"
ON public.contact_form_submissions
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Grant necessary permissions to authenticated users (for inserts)
GRANT INSERT ON public.contact_form_submissions TO authenticated;
GRANT INSERT ON public.contact_form_submissions TO anon;

-- Grant full access to admin users through the service role
GRANT ALL ON public.contact_form_submissions TO service_role;

-- Ensure the stats function can be called by admin users
GRANT EXECUTE ON FUNCTION public.get_contact_submission_stats() TO authenticated;

-- Log successful execution
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for contact form submissions created successfully';
END $$; 