-- Enable Row Level Security for rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "rate_limits_service_role_all" ON public.rate_limits;

-- Service role can perform all operations (for server-side rate limiting)
-- This allows our server actions to manage rate limiting without user authentication
CREATE POLICY "rate_limits_service_role_all"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- No public access - all operations should go through server actions
-- Users should not directly access rate limit data
CREATE POLICY "rate_limits_no_public_access"
ON public.rate_limits
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- Grant necessary permissions to service_role
GRANT ALL ON public.rate_limits TO service_role;

-- Grant usage on the sequence (for ID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Add comment about security model
COMMENT ON POLICY "rate_limits_service_role_all" ON public.rate_limits IS 
'Allows service role to manage rate limiting data for server-side operations';

COMMENT ON POLICY "rate_limits_no_public_access" ON public.rate_limits IS 
'Prevents public access to rate limit data - all operations should go through server actions'; 