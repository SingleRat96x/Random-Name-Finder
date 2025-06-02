'use server';

import { createServerActionClient } from '@/lib/supabase/server';
import { 
  LogToolUsageResponse, 
  RecentToolInteractionsResponse,
  RecentToolInteraction 
} from '@/lib/types/tools';

/**
 * Logs a user's interaction with a tool by either inserting a new record
 * or updating the last_used_at timestamp of an existing record.
 * This function uses an atomic SQL function for optimal performance.
 * 
 * @param toolSlug - The slug identifier of the tool being used
 * @returns Promise with success status and optional error message
 */
export async function logToolUsage(toolSlug: string): Promise<LogToolUsageResponse> {
  try {
    // Validate input
    if (!toolSlug || typeof toolSlug !== 'string' || toolSlug.trim().length === 0) {
      return { 
        success: false, 
        error: 'Tool slug is required and must be a non-empty string' 
      };
    }

    // Get authenticated user
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    // Use the atomic SQL function for optimal upsert performance
    const { error: upsertError } = await supabase.rpc(
      'upsert_tool_interaction',
      {
        p_user_id: user.id,
        p_tool_slug: toolSlug.trim()
      }
    );

    if (upsertError) {
      console.error('Error logging tool usage:', upsertError);
      return { 
        success: false, 
        error: 'Failed to log tool usage' 
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected error in logToolUsage:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while logging tool usage' 
    };
  }
}

/**
 * Fetches the most recently used tools for the current authenticated user.
 * Joins with the tools table to get additional metadata like name and icon.
 * Only returns tools that are still published.
 * 
 * @param limit - Maximum number of recent interactions to return (default: 3)
 * @returns Promise with recent tool interactions and optional error message
 */
export async function fetchRecentToolInteractions(
  limit: number = 3
): Promise<RecentToolInteractionsResponse> {
  try {
    // Validate input
    if (typeof limit !== 'number' || limit < 1 || limit > 50) {
      return { 
        success: false, 
        error: 'Limit must be a number between 1 and 50' 
      };
    }

    // Get authenticated user
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return empty results instead of error for unauthenticated users
      // This allows the dashboard to render gracefully
      return { 
        success: true, 
        interactions: [] 
      };
    }

    // Query recent tool interactions with tool metadata
    // Using a manual join approach to get tool details
    const { data: interactions, error: queryError } = await supabase
      .from('user_tool_interactions')
      .select(`
        tool_slug,
        last_used_at,
        interaction_count
      `)
      .eq('user_id', user.id)
      .order('last_used_at', { ascending: false })
      .limit(limit);

    if (queryError) {
      console.error('Error fetching recent tool interactions:', queryError);
      return { 
        success: false, 
        error: 'Failed to fetch recent tool interactions' 
      };
    }

    if (!interactions || interactions.length === 0) {
      return { 
        success: true, 
        interactions: [] 
      };
    }

    // Get unique tool slugs to fetch tool metadata
    const toolSlugs = [...new Set(interactions.map(i => i.tool_slug))];
    
    // Fetch tool metadata for the interactions
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('slug, name, icon_name, description, category, is_published')
      .in('slug', toolSlugs);

    if (toolsError) {
      console.warn('Error fetching tool metadata:', toolsError);
      // Continue without tool metadata
    }

    // Create a map for quick tool lookup
    const toolsMap = new Map(
      (tools || []).map(tool => [tool.slug, tool])
    );

    // Transform the data
    const recentInteractions: RecentToolInteraction[] = interactions
      .filter(interaction => {
        // Only include tools that are still published or don't exist (legacy data)
        const tool = toolsMap.get(interaction.tool_slug);
        return !tool || tool.is_published === true;
      })
      .map(interaction => {
        const tool = toolsMap.get(interaction.tool_slug);
        return {
          tool_slug: interaction.tool_slug,
          last_used_at: interaction.last_used_at,
          tool_name: tool?.name || interaction.tool_slug,
          tool_icon: tool?.icon_name || null,
          tool_description: tool?.description || null,
          tool_category: tool?.category || null
        };
      });

    return { 
      success: true, 
      interactions: recentInteractions 
    };

  } catch (error) {
    console.error('Unexpected error in fetchRecentToolInteractions:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while fetching recent tool interactions' 
    };
  }
}

/**
 * Clears all tool interaction history for the current authenticated user.
 * This can be useful for privacy or testing purposes.
 * 
 * @returns Promise with success status and optional error message
 */
export async function clearToolInteractionHistory(): Promise<LogToolUsageResponse> {
  try {
    // Get authenticated user
    const supabase = await createServerActionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    // Delete all interaction records for this user
    const { error: deleteError } = await supabase
      .from('user_tool_interactions')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error clearing tool interaction history:', deleteError);
      return { 
        success: false, 
        error: 'Failed to clear tool interaction history' 
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected error in clearToolInteractionHistory:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred while clearing interaction history' 
    };
  }
} 