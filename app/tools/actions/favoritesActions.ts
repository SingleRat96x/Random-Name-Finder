'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerActionClient } from '@/lib/supabase/server';
import { SavedNamesResponse, SaveNameResponse, RemoveNameResponse } from '@/lib/types/tools';

/**
 * Save a name to the user's favorites
 * @param name The name text to save
 * @param toolSlug The slug of the tool that generated the name
 */
export async function saveFavoriteName(name: string, toolSlug: string): Promise<SaveNameResponse> {
  try {
    // Validate inputs
    if (!name || !name.trim()) {
      return { success: false, error: 'Name text is required' };
    }
    
    if (!toolSlug || !toolSlug.trim()) {
      return { success: false, error: 'Tool slug is required' };
    }

    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to save favorites' };
    }

    // Insert the saved name into the database
    const { data: savedName, error: insertError } = await supabase
      .from('user_saved_names')
      .insert({
        user_id: user.id,
        name_text: name.trim(),
        tool_slug: toolSlug.trim()
      })
      .select()
      .single();

    if (insertError) {
      // Handle unique constraint violation (name already saved)
      if (insertError.code === '23505') {
        return { success: false, error: 'This name is already in your favorites' };
      }
      console.error('Error saving favorite name:', insertError);
      return { success: false, error: 'Failed to save favorite name' };
    }

    // Revalidate pages that display saved names
    revalidateTag('user-saved-names');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/saved-names');

    return { success: true, savedName };
    
  } catch (error) {
    console.error('Unexpected error in saveFavoriteName:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Remove a name from the user's favorites by ID
 * @param nameId The ID of the saved name to remove
 */
export async function removeFavoriteNameById(nameId: string): Promise<RemoveNameResponse> {
  try {
    if (!nameId || !nameId.trim()) {
      return { success: false, error: 'Name ID is required' };
    }

    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to manage favorites' };
    }

    // Delete the saved name (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('user_saved_names')
      .delete()
      .eq('id', nameId.trim())
      .eq('user_id', user.id); // Extra safety check

    if (deleteError) {
      console.error('Error removing favorite name:', deleteError);
      return { success: false, error: 'Failed to remove favorite name' };
    }

    // Revalidate pages that display saved names
    revalidateTag('user-saved-names');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/saved-names');

    return { success: true };
    
  } catch (error) {
    console.error('Unexpected error in removeFavoriteNameById:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Remove a name from the user's favorites by name and tool slug
 * @param name The name text to remove
 * @param toolSlug The slug of the tool
 */
export async function removeFavoriteName(name: string, toolSlug: string): Promise<RemoveNameResponse> {
  try {
    if (!name || !name.trim()) {
      return { success: false, error: 'Name text is required' };
    }
    
    if (!toolSlug || !toolSlug.trim()) {
      return { success: false, error: 'Tool slug is required' };
    }

    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to manage favorites' };
    }

    // Delete the saved name (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('user_saved_names')
      .delete()
      .eq('name_text', name.trim())
      .eq('tool_slug', toolSlug.trim())
      .eq('user_id', user.id); // Extra safety check

    if (deleteError) {
      console.error('Error removing favorite name:', deleteError);
      return { success: false, error: 'Failed to remove favorite name' };
    }

    // Revalidate pages that display saved names
    revalidateTag('user-saved-names');
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/saved-names');

    return { success: true };
    
  } catch (error) {
    console.error('Unexpected error in removeFavoriteName:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetch all saved names for the current user
 */
export async function fetchUserSavedNames(): Promise<SavedNamesResponse> {
  try {
    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'You must be logged in to view saved names' };
    }

    // Fetch all saved names for the user (RLS automatically filters by user_id)
    const { data: savedNames, error: fetchError } = await supabase
      .from('user_saved_names')
      .select('*')
      .order('favorited_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching saved names:', fetchError);
      return { success: false, error: 'Failed to fetch saved names' };
    }

    return { success: true, savedNames: savedNames || [] };
    
  } catch (error) {
    console.error('Unexpected error in fetchUserSavedNames:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if a specific name is already saved by the user
 * @param name The name text to check
 * @param toolSlug The slug of the tool
 * @returns Object with isSaved boolean and savedNameId if found
 */
export async function isNameSaved(name: string, toolSlug: string): Promise<{ isSaved: boolean; savedNameId?: string }> {
  try {
    if (!name || !name.trim() || !toolSlug || !toolSlug.trim()) {
      return { isSaved: false };
    }

    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { isSaved: false };
    }

    // Check if name is already saved
    const { data: savedName, error: fetchError } = await supabase
      .from('user_saved_names')
      .select('id')
      .eq('name_text', name.trim())
      .eq('tool_slug', toolSlug.trim())
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      // If no match found, that's expected - return false
      if (fetchError.code === 'PGRST116') {
        return { isSaved: false };
      }
      console.error('Error checking if name is saved:', fetchError);
      return { isSaved: false };
    }

    return { 
      isSaved: true, 
      savedNameId: savedName?.id 
    };
    
  } catch (error) {
    console.error('Unexpected error in isNameSaved:', error);
    return { isSaved: false };
  }
}

/**
 * Fetch recent saved names for the current user with a limit
 * Optimized for dashboard display
 * @param limit Maximum number of recent saved names to return (default: 5)
 */
export async function fetchRecentSavedNames(limit: number = 5): Promise<SavedNamesResponse> {
  try {
    // Validate limit
    if (typeof limit !== 'number' || limit < 1 || limit > 50) {
      return { success: false, error: 'Limit must be a number between 1 and 50' };
    }

    // Create Supabase client
    const supabase = await createServerActionClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // Return empty results instead of error for unauthenticated users
      // This allows the dashboard to render gracefully
      return { success: true, savedNames: [] };
    }

    // Fetch recent saved names for the user (RLS automatically filters by user_id)
    const { data: savedNames, error: fetchError } = await supabase
      .from('user_saved_names')
      .select('*')
      .order('favorited_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error('Error fetching recent saved names:', fetchError);
      return { success: false, error: 'Failed to fetch recent saved names' };
    }

    return { success: true, savedNames: savedNames || [] };
    
  } catch (error) {
    console.error('Unexpected error in fetchRecentSavedNames:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
} 