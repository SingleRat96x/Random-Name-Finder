-- Create function to automatically handle new user profile creation
-- This function is triggered when a new user is created in auth.users
-- It creates a corresponding profile record in public.profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important for cross-schema operations and elevated permissions
SET search_path = public -- Ensures objects in 'public' schema are found without qualification
AS $$
DECLARE
    generated_username TEXT;
BEGIN
    -- Generate a username from email or metadata
    -- Priority: 1) username from raw_user_meta_data, 2) email prefix, 3) fallback
    generated_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1),
        'user_' || substr(NEW.id::text, 1, 8)
    );
    
    -- Ensure username is not null and has reasonable length
    IF generated_username IS NULL OR length(generated_username) < 1 THEN
        generated_username := 'user_' || substr(NEW.id::text, 1, 8);
    END IF;
    
    -- Handle potential username conflicts by appending a number
    -- This is a simple approach; in production, you might want more sophisticated handling
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username) LOOP
        generated_username := generated_username || '_' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Insert the new profile record
    INSERT INTO public.profiles (
        user_id,
        username,
        full_name,
        avatar_url,
        website
    ) VALUES (
        NEW.id,
        generated_username,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'website'
    );
    
    -- Return the NEW record to continue the trigger chain
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (in production, you might want to use a proper logging mechanism)
        RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
        -- Re-raise the exception to prevent silent failures
        RAISE;
END;
$$;

-- Add function comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
    'Automatically creates a profile record when a new user is created in auth.users. 
     Extracts username and other profile data from user metadata or generates defaults.
     Handles username conflicts by appending random numbers.';

-- Grant necessary permissions
-- The function runs with SECURITY DEFINER, so it has the permissions of the function owner
-- This is necessary for the trigger to insert into profiles even if the triggering context
-- doesn't have direct INSERT permissions on the profiles table 