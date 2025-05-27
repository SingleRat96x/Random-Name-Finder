-- Enable Row Level Security (RLS) on the profiles table
-- This ensures that users can only access their own profile data

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
-- This allows users to SELECT their own profile data
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
-- This allows the trigger function and users to create their own profile
-- The WITH CHECK ensures they can only insert a profile for themselves
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
-- This allows users to modify their own profile information
-- Both USING and WITH CHECK ensure they can only update their own data
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Note: No DELETE policy is created for regular users
-- Profile deletion should be handled by admin functions or cascade from auth.users deletion

-- Add comments explaining the security model
COMMENT ON POLICY "Users can view their own profile" ON public.profiles IS 
    'Allows users to read their own profile data only';

COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS 
    'Allows users and trigger functions to create profiles for the authenticated user only';

COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
    'Allows users to modify their own profile information only';

-- Additional security note: 
-- The auth.uid() function returns the UUID of the currently authenticated user
-- This ensures that users can only access profiles where user_id matches their auth ID 