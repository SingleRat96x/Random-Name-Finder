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

### 8. `009_create_tools_table.sql`
**Purpose**: Creates the `public.tools` table for storing name generation tool configurations.

### 9. `010_rls_tools_table.sql`
**Purpose**: Enables RLS and defines security policies for the tools table.

### 10. `011_insert_sample_cat_name_tool.sql`
**Purpose**: Inserts a sample cat name generator tool for testing.

### 11. `012_create_ai_models_table.sql`
**Purpose**: Creates the `public.ai_models` table for managing AI model configurations.

### 12. `013_rls_ai_models_table.sql`
**Purpose**: Enables RLS and defines security policies for the AI models table.

### 13. `014_alter_tools_table_for_ai_models.sql`
**Purpose**: Updates the tools table to support AI model associations.

### 14. `014_create_user_saved_names_table.sql`
**Purpose**: Creates the `public.user_saved_names` table for storing user's favorited names.

**What it does**:
- Creates the user_saved_names table for persistent favorites
- Links saved names to users and tools via foreign keys
- Prevents duplicate saves with unique constraints
- Includes performance indexes for fast retrieval
- Adds comprehensive documentation

**Key Features**:
- UUID primary key for unique identification
- Foreign key to auth.users with cascade deletion
- Tool slug context for organization
- Timestamp tracking for favorites
- Unique constraint prevents duplicate saves
- Optimized indexes for user queries

### 15. `015_rls_user_saved_names_table.sql`
**Purpose**: Enables Row Level Security (RLS) and defines security policies for the user_saved_names table.

**What it does**:
- Enables RLS on the user_saved_names table
- Creates policies for SELECT, INSERT, DELETE, and UPDATE operations
- Ensures users can only access their own saved names

**Security Policies**:
- Users can view only their own saved names
- Users can save names only for themselves
- Users can delete only their own saved names
- Users can update only their own saved names (if needed)

### 16. `016_alter_tools_table_add_category.sql`
**Purpose**: Adds a category field to the tools table for tool categorization and filtering.

**What it does**:
- Adds a new `category` column to the tools table (TEXT, NULLABLE)
- Creates performance indexes for category-based filtering
- Adds a composite index for published tools by category
- Includes comprehensive documentation for the new column

**Key Features**:
- Optional category field for organizing tools
- Optimized indexes for public tools listing page
- Supports efficient filtering by category
- Database comments for clear documentation

### 17. `017_alter_tools_table_add_accent_color.sql`
**Purpose**: Adds an accent color class field to the tools table for visual customization of tool cards.

**What it does**:
- Adds a new `accent_color_class` column to the tools table (TEXT, NULLABLE)
- Adds column documentation explaining usage for Tailwind CSS classes
- Enables visual customization of tool cards on the public listing page

**Usage**:
- Stores Tailwind CSS class strings (e.g., "border-t-4 border-blue-500", "text-green-600")
- Used by the frontend to apply custom styling to tool cards
- Completely optional field for enhanced visual presentation

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

public.tools
├── id (UUID, PK)
├── name (TEXT)
├── slug (TEXT, UNIQUE)
├── description (TEXT, nullable)
├── category (TEXT, nullable)
├── accent_color_class (TEXT, nullable)
├── ai_prompt_category (TEXT)
├── default_ai_model_identifier (TEXT, nullable)
├── available_ai_model_identifiers (TEXT[])
├── default_parameters (JSONB)
├── configurable_fields (JSONB)
├── is_published (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

public.ai_models
├── id (UUID, PK)
├── model_identifier (TEXT, UNIQUE)
├── display_name (TEXT)
├── provider_name (TEXT)
├── capabilities_tags (TEXT[])
├── is_active (BOOLEAN)
├── notes_for_admin (TEXT, nullable)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

public.user_saved_names
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users.id)
├── name_text (TEXT)
├── tool_slug (TEXT)
├── favorited_at (TIMESTAMPTZ)
└── UNIQUE(user_id, name_text, tool_slug)

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

- **Row Level Security**: Enabled on profiles, content, tools, ai_models, and user_saved_names tables
- **User Isolation**: Users can only access their own profile data and saved names
- **Role-Based Access**: Simple user/admin role system
- **Automatic Profile Creation**: Every auth user gets a profile
- **Data Consistency**: Foreign key constraints and triggers maintain integrity
- **Favorites Security**: Users can only manage their own saved names

## Usage Notes

1. Execute these files in order in your Supabase SQL editor
2. All commands are idempotent and safe to re-run
3. The trigger will automatically create profiles for new users
4. Existing users (if any) will need profiles created manually
5. Admin roles must be assigned manually through SQL or admin functions
6. User saved names are automatically cleaned up when users are deleted

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
9. Execute content management SQL files (005-008) for CMS functionality
10. Implement admin content management interface
11. Create dynamic page rendering for static pages
12. Build content block components for rich content display
13. **NEW**: Execute tools and AI models SQL files (009-014) for name generation functionality
14. **NEW**: Execute user saved names SQL files (014-015) for favorites functionality
15. **NEW**: Implement favorites UI components and server actions
16. **NEW**: Test favorites functionality for both logged-in and guest users

## Edge Function Integration

This database schema works in conjunction with:
- **Edge Function**: `supabase/functions/on-new-user/index.ts`
- **Auth Hook**: Database webhook on `auth.users` INSERT events
- **Environment Variables**: `SUPABASE_SERVICE_ROLE_KEY` for admin operations

See the Edge Function README for detailed setup instructions. 