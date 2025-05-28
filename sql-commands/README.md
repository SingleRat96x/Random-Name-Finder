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

public.content_pages
├── id (UUID, PK)
├── slug (TEXT, UNIQUE)
├── title (TEXT)
├── meta_description (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

public.content_blocks
├── id (UUID, PK)
├── page_id (UUID, FK → content_pages.id, nullable)
├── tool_slug (TEXT, nullable)
├── block_type (content_block_type_enum)
├── content_data (JSONB)
├── sort_order (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

content_block_type_enum
├── heading_h1, heading_h2, heading_h3, etc.
├── paragraph, blockquote
├── unordered_list, ordered_list
├── image, video
├── faq_item, call_to_action_button
├── ad_slot_manual, ad_slot_auto
└── ... (25+ total types)
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

### 4. `005_create_content_pages_table.sql`
**Purpose**: Creates the `public.content_pages` table for storing metadata about static pages.

**What it does**:
- Creates the content_pages table for editable static pages
- Includes slug, title, and meta_description fields
- Sets up indexes and constraints for data integrity
- Adds automatic updated_at timestamp handling
- Inserts default pages (about-us, privacy-policy, terms-of-service, contact)

**Key Features**:
- URL-friendly slug validation
- SEO meta description support
- Automatic timestamp management
- Default page creation

### 5. `006_create_content_block_types_enum.sql`
**Purpose**: Creates an ENUM type for content block types to ensure type safety.

**What it does**:
- Defines `content_block_type_enum` with comprehensive block types
- Includes headings, paragraphs, lists, images, forms, ads, and more
- Provides helper functions for managing enum values
- Supports future extensibility

**Block Types Include**:
- Text content (headings, paragraphs, lists)
- Media (images, videos)
- Interactive (forms, buttons, FAQs)
- Layout (columns, dividers, spacers)
- Special (ads, embeds, tool widgets)

### 6. `007_create_content_blocks_table.sql`
**Purpose**: Creates the main `public.content_blocks` table for structured content.

**What it does**:
- Creates content_blocks table with JSONB for flexible content storage
- Supports association with both static pages and tool pages
- Implements sort ordering for block arrangement
- Includes comprehensive indexing for performance
- Provides helper functions for retrieving blocks

**Key Features**:
- JSONB content_data for flexible block-specific data
- Foreign key to content_pages OR tool_slug (mutually exclusive)
- Sort ordering for page layout control
- Helper functions for easy content retrieval
- Example content blocks for default pages

### 7. `008_rls_content_tables.sql`
**Purpose**: Enables RLS and defines security policies for content tables.

**What it does**:
- Enables Row Level Security on content tables
- Creates policies for public read access
- Restricts write operations to admin users only
- Provides helper functions for role checking
- Includes testing functions for policy validation

**Security Model**:
- Public users can read all content
- Only admin users can create, update, or delete content
- Role-based access control via profiles table
- Comprehensive policy coverage for all operations

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
9. **NEW**: Execute content management SQL files (005-008) for CMS functionality
10. **NEW**: Implement admin content management interface
11. **NEW**: Create dynamic page rendering for static pages
12. **NEW**: Build content block components for rich content display

## Edge Function Integration

This database schema works in conjunction with:
- **Edge Function**: `supabase/functions/on-new-user/index.ts`
- **Auth Hook**: Database webhook on `auth.users` INSERT events
- **Environment Variables**: `SUPABASE_SERVICE_ROLE_KEY` for admin operations

See the Edge Function README for detailed setup instructions. 