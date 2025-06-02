-- Create rate_limits table for tracking submission attempts
-- This table tracks rate limiting for various form types (contact, auth, etc.)

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP address or user identifier
    form_type VARCHAR(50) NOT NULL, -- 'contact', 'login', 'signup', etc.
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    lockout_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_type ON public.rate_limits(identifier, form_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lockout_until ON public.rate_limits(lockout_until);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON public.rate_limits(last_attempt);

-- Create composite unique index to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique_identifier_type 
ON public.rate_limits(identifier, form_type);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON public.rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_rate_limits_updated_at();

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete records older than 24 hours that are not currently locked out
    DELETE FROM public.rate_limits 
    WHERE last_attempt < NOW() - INTERVAL '24 hours'
    AND (lockout_until IS NULL OR lockout_until < NOW());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Add comment
COMMENT ON TABLE public.rate_limits IS 'Tracks rate limiting for forms to prevent spam and abuse';
COMMENT ON COLUMN public.rate_limits.identifier IS 'IP address or user identifier for rate limiting';
COMMENT ON COLUMN public.rate_limits.form_type IS 'Type of form being rate limited (contact, login, signup, etc.)';
COMMENT ON COLUMN public.rate_limits.attempts IS 'Number of failed/spam attempts';
COMMENT ON COLUMN public.rate_limits.lockout_until IS 'Timestamp when the lockout expires (NULL if not locked out)'; 