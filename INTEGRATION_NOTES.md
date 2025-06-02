# User Tool Interactions Integration Notes

## Overview
This document outlines the implementation of user tool interactions tracking for the "Recently Used Tools" dashboard feature.

## Database Setup

### Tables Created
- `user_tool_interactions`: Tracks user interactions with tools
  - Primary key: `id` (UUID)
  - User reference: `user_id` (FK to auth.users)
  - Tool reference: `tool_slug` (TEXT, references tools.slug)
  - Timestamp: `last_used_at` (TIMESTAMPTZ)
  - Usage count: `interaction_count` (INTEGER)
  - Unique constraint on `(user_id, tool_slug)`

### SQL Files
1. `sql-commands/018_create_user_tool_interactions_table.sql` - Table creation
2. `sql-commands/019_rls_user_tool_interactions_table.sql` - RLS policies
3. `sql-commands/020_user_tool_interactions_functions.sql` - Helper functions

### RLS Policies
- Users can only access their own interaction records
- Full CRUD permissions for own records

## TypeScript Types

Added to `lib/types/tools.ts`:
- `UserToolInteraction`: Main database record type
- `RecentToolInteraction`: Enriched data for dashboard display
- `RecentToolInteractionsResponse`: API response type
- `LogToolUsageResponse`: Log usage response type

## Server Actions

Created `app/actions/toolInteractionsActions.ts`:

### `logToolUsage(toolSlug: string)`
- **Purpose**: Log when a user successfully uses a tool
- **Usage**: Call this after successful name generation
- **Authentication**: Requires authenticated user
- **Performance**: Uses atomic SQL function for optimal upsert
- **Returns**: `{ success: boolean, error?: string }`

### `fetchRecentToolInteractions(limit: number = 3)`
- **Purpose**: Get recently used tools for dashboard
- **Usage**: Call in dashboard component
- **Authentication**: Returns empty array for unauthenticated users
- **Filtering**: Only returns published tools
- **Enrichment**: Includes tool name, icon, description, category
- **Returns**: `{ success: boolean, interactions?: RecentToolInteraction[], error?: string }`

### `clearToolInteractionHistory()`
- **Purpose**: Clear all user's interaction history
- **Usage**: For privacy/testing purposes
- **Authentication**: Requires authenticated user

## Integration Points

### 1. Tool Usage Logging
**File to modify**: `app/tools/[toolSlug]/actions.ts`
**Function**: `generateNamesAction`

Add this call after successful name generation:
```typescript
import { logToolUsage } from '@/app/actions/toolInteractionsActions';

// After successful name generation
if (generatedNames && generatedNames.length > 0) {
  // Log tool usage for authenticated users (don't await to avoid slowing down response)
  logToolUsage(toolSlug).catch(error => {
    console.warn('Failed to log tool usage:', error);
  });
}
```

### 2. Dashboard Display
**Component**: Dashboard recently used tools section

```typescript
import { fetchRecentToolInteractions } from '@/app/actions/toolInteractionsActions';

// In dashboard component
const { interactions } = await fetchRecentToolInteractions(3);

// Render interactions with tool_name, tool_icon, last_used_at
```

## Database Optimization

### Indexes Created
- `idx_user_tool_interactions_user_recent`: Optimized for fetching user's recent tools
- `idx_user_tool_interactions_user_id`: General user queries
- `idx_user_tool_interactions_tool_slug`: Tool-based analytics
- `idx_user_tool_interactions_last_used`: Temporal queries

### SQL Functions
- `upsert_tool_interaction(user_id, tool_slug)`: Atomic upsert with count increment
- `increment_tool_interaction_count(user_id, tool_slug)`: Legacy support function

## Performance Considerations

1. **Async Logging**: Don't await `logToolUsage` to avoid slowing tool responses
2. **Batching**: Consider batching multiple rapid tool uses
3. **Caching**: Dashboard can cache results for short periods
4. **Graceful Degradation**: Dashboard works even if interaction data fails to load

## Privacy & Data Management

1. **User Control**: Users can clear their interaction history
2. **Automatic Cleanup**: Records are deleted when users are deleted (CASCADE)
3. **Published Tools Only**: Only show interactions with published tools
4. **No PII**: Only stores tool slugs and timestamps

## Testing

### Test the logging function:
```typescript
const result = await logToolUsage('business-name-generator');
console.log(result); // { success: true }
```

### Test fetching recent interactions:
```typescript
const result = await fetchRecentToolInteractions(5);
console.log(result.interactions); // Array of recent tool interactions
```

## Error Handling

All functions include comprehensive error handling:
- Input validation
- Authentication checks
- Database error handling
- Graceful degradation for missing tools

## Future Enhancements

1. **Analytics**: Use interaction_count for usage analytics
2. **Recommendations**: Use interaction patterns for tool recommendations
3. **Trends**: Track popular tools over time
4. **Personalization**: Customize dashboard based on usage patterns 