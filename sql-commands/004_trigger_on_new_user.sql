-- Create trigger to automatically create profile when new user signs up
-- This trigger fires after a new user is inserted into auth.users
-- and calls the handle_new_user() function to create the corresponding profile

-- Drop the trigger if it already exists (for idempotent execution)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Add comment explaining the trigger's purpose
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
    'Automatically creates a profile record in public.profiles when a new user is created in auth.users. 
     This ensures every authenticated user has a corresponding profile for storing additional information.';

-- Additional notes:
-- 1. The trigger fires AFTER INSERT to ensure the auth.users record is fully committed
-- 2. FOR EACH ROW ensures the function is called for every new user
-- 3. The handle_new_user() function handles the actual profile creation logic
-- 4. If the function fails, the entire user creation transaction will be rolled back
-- 5. This maintains data consistency between auth.users and public.profiles tables 