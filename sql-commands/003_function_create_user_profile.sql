-- Create function to handle user profile creation via Edge Function
-- This function is called by the on-new-user Edge Function triggered by Auth Hooks
-- Replaces the previous trigger-based approach for better reliability and control

CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_raw_user_meta_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated permissions for trusted Edge Function calls
SET search_path = public -- Ensures objects in 'public' schema are found without qualification
AS $$
DECLARE
    v_username TEXT;
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_website TEXT;
    v_temp_username TEXT;
    v_suffix INTEGER := 0;
    v_max_attempts INTEGER := 100; -- Prevent infinite loops in username generation
BEGIN
    -- Validate required parameters
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;

    -- Extract data from metadata with null safety
    v_username := NULLIF(TRIM(p_raw_user_meta_data->>'username'), '');
    v_full_name := NULLIF(TRIM(p_raw_user_meta_data->>'full_name'), '');
    v_avatar_url := NULLIF(TRIM(p_raw_user_meta_data->>'avatar_url'), '');
    v_website := NULLIF(TRIM(p_raw_user_meta_data->>'website'), '');

    -- Generate username if not provided in metadata
    IF v_username IS NULL THEN
        IF p_email IS NOT NULL AND TRIM(p_email) <> '' THEN
            -- Extract username from email prefix
            v_username := split_part(p_email, '@', 1);
            -- Clean up email-derived username (remove dots, plus signs, etc.)
            v_username := REGEXP_REPLACE(v_username, '[^a-zA-Z0-9_]', '_', 'g');
        ELSE
            -- Fallback to UUID-based username
            v_username := 'user_' || substr(p_user_id::text, 1, 8);
        END IF;
    END IF;

    -- Ensure username meets basic requirements
    -- Remove any non-alphanumeric characters except underscores
    v_username := REGEXP_REPLACE(v_username, '[^a-zA-Z0-9_]', '_', 'g');
    
    -- Ensure username is not excessively long (max 30 chars to leave room for suffix)
    v_username := SUBSTRING(v_username FOR 30);
    
    -- Ensure username is not empty after cleaning
    IF v_username IS NULL OR LENGTH(v_username) < 1 THEN
        v_username := 'user_' || substr(p_user_id::text, 1, 8);
    END IF;

    -- Handle potential username conflicts by appending a number
    v_temp_username := v_username;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_temp_username) AND v_suffix < v_max_attempts LOOP
        v_suffix := v_suffix + 1;
        v_temp_username := v_username || '_' || v_suffix::text;
        
        -- Ensure the final username doesn't exceed reasonable length (50 chars)
        IF LENGTH(v_temp_username) > 50 THEN
            -- Truncate original username and try again
            v_username := SUBSTRING(v_username FOR (20 - LENGTH(v_suffix::text)));
            v_temp_username := v_username || '_' || v_suffix::text;
        END IF;
    END LOOP;

    -- Check if we exceeded max attempts (should be very rare)
    IF v_suffix >= v_max_attempts THEN
        -- Use UUID-based fallback as last resort
        v_temp_username := 'user_' || substr(p_user_id::text, 1, 12);
    END IF;

    v_username := v_temp_username;

    -- Insert the new profile record
    INSERT INTO public.profiles (
        user_id,
        username,
        full_name,
        avatar_url,
        website,
        role,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        v_username,
        v_full_name,
        v_avatar_url,
        v_website,
        'user', -- Default role
        NOW(),
        NOW()
    );

    -- Log successful profile creation
    RAISE LOG 'Successfully created profile for user_id % with username %', p_user_id, v_username;

EXCEPTION
    WHEN unique_violation THEN
        -- Handle the rare case where user_id already has a profile
        RAISE LOG 'Profile already exists for user_id %', p_user_id;
        -- Don't re-raise this exception as it's not necessarily an error
    WHEN OTHERS THEN
        -- Log the error with context
        RAISE LOG 'Error in create_user_profile function for user_id %: % (SQLSTATE: %)', 
                  p_user_id, SQLERRM, SQLSTATE;
        -- Re-raise the exception to ensure the Edge Function can handle it
        RAISE;
END;
$$;

-- Add comprehensive function comment for documentation
COMMENT ON FUNCTION public.create_user_profile(UUID, TEXT, JSONB) IS 
    'Creates a profile record in public.profiles for a new user. Called by the on-new-user Edge Function 
     triggered by Supabase Auth Hooks. Extracts username and profile data from user metadata or generates 
     defaults. Handles username conflicts by appending numbers. Uses SECURITY DEFINER for trusted 
     server-side operations.';

-- Grant execute permission to authenticated users (Edge Function will use admin client)
-- This is mainly for documentation as the admin client bypasses RLS
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, JSONB) TO authenticated;

-- Additional security note:
-- This function is designed to be called by the Supabase Admin client from an Edge Function
-- The SECURITY DEFINER ensures it runs with the necessary permissions to insert into profiles
-- even when called from the Edge Function context 