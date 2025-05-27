-- Create profiles table for storing user profile information
-- This table links to auth.users and stores publicly viewable/editable profile data

-- Enable UUID extension if not already enabled (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    -- Primary key using UUID to align with auth.users.id type
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to auth.users table with cascade delete
    -- This ensures profile is deleted when user account is deleted
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Username for display purposes - unique across all users
    -- Can be nullable initially to allow gradual profile completion
    username TEXT UNIQUE,
    
    -- Full display name for the user (optional)
    full_name TEXT,
    
    -- URL to user's avatar image (optional)
    -- This will typically be a URL to a file storage service
    avatar_url TEXT,
    
    -- User's website URL (optional)
    website TEXT,
    
    -- User role for permission management
    -- Default to 'user', can be manually set to 'admin' for elevated permissions
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    
    -- Timestamp tracking
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Add comments to the table and columns for documentation
COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON COLUMN public.profiles.id IS 'Primary key for the profile record';
COMMENT ON COLUMN public.profiles.user_id IS 'Foreign key reference to auth.users.id';
COMMENT ON COLUMN public.profiles.username IS 'Unique username for display and identification';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full display name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user''s profile avatar image';
COMMENT ON COLUMN public.profiles.website IS 'User''s personal or business website URL';
COMMENT ON COLUMN public.profiles.role IS 'User role for permission management (user, admin)';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when profile was last updated'; 