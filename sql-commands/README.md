# SQL Commands for Random Name Finder

This directory contains SQL commands for setting up the database schema for user authentication and profile management in the Random Name Finder application.

## Execution Order

Execute these SQL files in the following order in your Supabase SQL editor:

### 1. `001_create_profiles_table.sql`
**Purpose**: Creates the `public.profiles` table for storing user profile information.

**What it does**:
- Creates the profiles table with all necessary columns
- Sets up foreign key relationship to `auth.users`
- Adds indexes for performance
- Includes comprehensive column comments

**Key Features**:
- UUID primary key aligned with Supabase Auth
- Unique username field with conflict handling
- Role-based access control (user/admin)
- Timestamp tracking for created/updated dates

### 2. `002_rls_profiles_table.sql`
**Purpose**: Enables Row Level Security (RLS) and defines security policies for the profiles table.

**What it does**:
- Enables RLS on the profiles table
- Creates policies for SELECT, INSERT, and UPDATE operations
- Ensures users can only access their own profile data

**Security Policies**:
- Users can view their own profile
- Users can insert their own profile (for trigger function)
- Users can update their own profile
- No DELETE policy (admin-only or cascade deletion)

### 3. `003_function_create_user_profile.sql`
**Purpose**: Creates the function that handles user profile creation via Edge Function calls.

**What it does**:
- Defines `public.create_user_profile()` callable function
- Extracts username from user metadata or email
- Handles username conflicts automatically
- Creates profile record with available metadata

**Features**:
- Smart username generation with fallbacks
- Conflict resolution for duplicate usernames
- Comprehensive error handling and logging
- Security definer for trusted Edge Function calls
- Robust input validation and sanitization

**Note**: This replaces the previous trigger-based approach with a more reliable Auth Hook + Edge Function pattern.

## Database Schema Overview

```
auth.users (Supabase managed)
├── id (UUID, PK)
├── email
├── raw_user_meta_data
└── ... (other Supabase fields)

public.profiles
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users.id)
├── username (TEXT, UNIQUE)
├── full_name (TEXT, nullable)
├── avatar_url (TEXT, nullable)
├── website (TEXT, nullable)
├── role (TEXT, DEFAULT 'user')
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## Security Model

- **Row Level Security**: Enabled on profiles table
- **User Isolation**: Users can only access their own profile data
- **Role-Based Access**: Simple user/admin role system
- **Automatic Profile Creation**: Every auth user gets a profile
- **Data Consistency**: Foreign key constraints and triggers maintain integrity

## Usage Notes

1. Execute these files in order in your Supabase SQL editor
2. All commands are idempotent and safe to re-run
3. The trigger will automatically create profiles for new users
4. Existing users (if any) will need profiles created manually
5. Admin roles must be assigned manually through SQL or admin functions

## Next Steps

After executing these SQL commands:
1. Deploy the Supabase Edge Function (`supabase/functions/on-new-user/`)
2. Configure the Auth Hook in Supabase Dashboard to trigger the Edge Function
3. Set up required environment variables (`SUPABASE_SERVICE_ROLE_KEY`)
4. Test user registration to verify profile creation via Edge Function
5. Implement profile management UI components
6. Add profile update functionality
7. Consider additional profile fields as needed
8. Implement admin functions for user management

## Edge Function Integration

This database schema works in conjunction with:
- **Edge Function**: `supabase/functions/on-new-user/index.ts`
- **Auth Hook**: Database webhook on `auth.users` INSERT events
- **Environment Variables**: `SUPABASE_SERVICE_ROLE_KEY` for admin operations

See the Edge Function README for detailed setup instructions. 