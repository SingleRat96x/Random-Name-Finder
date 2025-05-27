# On New User Edge Function

This Supabase Edge Function is triggered by Auth Hooks when a new user signs up. It automatically creates a profile record in the `public.profiles` table by calling the `public.create_user_profile` Postgres function.

## Purpose

Replaces the previous database trigger approach with a more reliable and controllable Auth Hook + Edge Function pattern for automatic profile creation.

## Setup Requirements

### 1. Environment Variables

The following environment variables must be set in your Supabase project settings:

- `SUPABASE_URL`: Your Supabase project URL (usually auto-provided)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required for admin operations)

### 2. Database Function

Ensure the `public.create_user_profile` function is deployed to your database using:
```sql
-- Execute sql-commands/003_function_create_user_profile.sql
```

### 3. Deploy the Edge Function

Deploy this function using the Supabase CLI:
```bash
supabase functions deploy on-new-user
```

### 4. Configure Auth Hook

In your Supabase Dashboard:
1. Go to Database → Webhooks
2. Create a new webhook with:
   - **Name**: `on-new-user-hook`
   - **Table**: `auth.users`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **HTTP Method**: `POST`
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/on-new-user`
   - **HTTP Headers**: 
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_ANON_KEY
     ```

## Function Behavior

### Input
Receives Auth Hook payload containing user data:
```json
{
  "type": "INSERT",
  "table": "users",
  "record": {
    "id": "uuid",
    "email": "user@example.com",
    "raw_user_meta_data": {
      "username": "optional",
      "full_name": "optional",
      "avatar_url": "optional",
      "website": "optional"
    }
  },
  "schema": "auth"
}
```

### Processing
1. Validates the user payload
2. Extracts user ID, email, and metadata
3. Calls `public.create_user_profile` Postgres function
4. Handles errors gracefully

### Output
Returns JSON response:
- **Success (200)**: `{ "message": "Profile created successfully", "user_id": "uuid" }`
- **Already Exists (200)**: `{ "message": "Profile already exists", "user_id": "uuid" }`
- **Error (400/500)**: `{ "error": "Error description", "details": "..." }`

## Error Handling

- **Invalid Payload**: Returns 400 with error details
- **Profile Already Exists**: Returns 200 (not an error)
- **Database Errors**: Returns 500 with error details
- **Network Errors**: Logged and returns 500

## Logging

The function logs:
- Received payloads (for debugging)
- Successful profile creations
- All errors with context

## Security

- Uses Supabase Admin Client with service role key
- Validates user ID format (UUID)
- Handles CORS for cross-origin requests
- No authentication required (called by Supabase internally)

## Testing

You can test the function locally using:
```bash
supabase functions serve on-new-user
```

Then send a test POST request:
```bash
curl -X POST http://localhost:54321/functions/v1/on-new-user \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "users",
    "record": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "test@example.com",
      "raw_user_meta_data": {
        "full_name": "Test User"
      }
    }
  }'
``` 