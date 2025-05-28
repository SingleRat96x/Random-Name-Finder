'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@/lib/supabase/server';

export interface ContentBlock {
  id: string;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  page_id: string | null;
  tool_slug: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Verify that the current user is an admin
 */
async function verifyAdminAccess() {
  const supabase = await createServerActionClient();
  
  const { data: isAdmin, error } = await supabase
    .rpc('is_current_user_admin');
    
  if (error || !isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Fetch a tool by slug to verify it exists and get its details
 */
export async function fetchToolBySlug(toolSlug: string) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: tool, error } = await supabase
    .from('tools')
    .select('id, name, slug, description')
    .eq('slug', toolSlug)
    .single();
    
  if (error) {
    console.error('Error fetching tool:', error);
    return null;
  }
  
  return tool;
}

/**
 * Fetch content blocks for a specific tool
 */
export async function fetchContentBlocksByToolSlug(toolSlug: string): Promise<ContentBlock[]> {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: blocks, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('tool_slug', toolSlug)
    .is('page_id', null) // Ensure we only get tool blocks
    .order('sort_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching content blocks for tool:', error);
    throw new Error('Failed to fetch content blocks');
  }
  
  return blocks || [];
}

/**
 * Add a new content block for a tool
 */
export async function addContentBlockForTool(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const toolSlug = formData.get('tool_slug') as string;
  const blockType = formData.get('block_type') as string;
  const contentDataStr = formData.get('content_data') as string;
  
  if (!toolSlug || !blockType || !contentDataStr) {
    throw new Error('Tool slug, block type, and content data are required');
  }
  
  // Verify tool exists
  const tool = await fetchToolBySlug(toolSlug);
  if (!tool) {
    throw new Error('Tool not found');
  }
  
  // Parse content data
  let contentData;
  try {
    contentData = JSON.parse(contentDataStr);
  } catch {
    throw new Error('Invalid JSON format for content data');
  }
  
  // Get the next sort order
  const { data: maxSortData } = await supabase
    .from('content_blocks')
    .select('sort_order')
    .eq('tool_slug', toolSlug)
    .is('page_id', null)
    .order('sort_order', { ascending: false })
    .limit(1);
    
  const nextSortOrder = maxSortData && maxSortData.length > 0 
    ? maxSortData[0].sort_order + 1 
    : 1;
  
  // Insert the new block
  const { error } = await supabase
    .from('content_blocks')
    .insert({
      block_type: blockType,
      content_data: contentData,
      sort_order: nextSortOrder,
      tool_slug: toolSlug,
      page_id: null, // Explicitly set to null for tool blocks
    });
    
  if (error) {
    console.error('Error adding content block:', error);
    throw new Error('Failed to add content block');
  }
  
  // Revalidate the tool content management page
  revalidatePath(`/admin/tools/${toolSlug}/content`);
  
  return { success: true };
}

/**
 * Update an existing content block
 */
export async function updateContentBlock(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const blockId = formData.get('block_id') as string;
  const blockType = formData.get('block_type') as string;
  const contentDataStr = formData.get('content_data') as string;
  const toolSlug = formData.get('tool_slug') as string;
  const pageId = formData.get('page_id') as string;
  
  if (!blockId || !blockType || !contentDataStr) {
    throw new Error('Block ID, block type, and content data are required');
  }
  
  // Parse content data
  let contentData;
  try {
    contentData = JSON.parse(contentDataStr);
  } catch {
    throw new Error('Invalid JSON format for content data');
  }
  
  // Update the block
  const { error } = await supabase
    .from('content_blocks')
    .update({
      block_type: blockType,
      content_data: contentData,
    })
    .eq('id', blockId);
    
  if (error) {
    console.error('Error updating content block:', error);
    throw new Error('Failed to update content block');
  }
  
  // Revalidate appropriate pages
  if (toolSlug) {
    revalidatePath(`/admin/tools/${toolSlug}/content`);
    revalidatePath(`/tools/${toolSlug}`); // For future public tool pages
  } else if (pageId) {
    revalidatePath('/admin/content');
    // Revalidate static pages based on page_id if needed
  }
  
  return { success: true };
}

/**
 * Delete a content block
 */
export async function deleteContentBlock(blockId: string, toolSlug?: string, pageSlug?: string) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  if (!blockId) {
    throw new Error('Block ID is required');
  }
  
  // Delete the block
  const { error } = await supabase
    .from('content_blocks')
    .delete()
    .eq('id', blockId);
    
  if (error) {
    console.error('Error deleting content block:', error);
    throw new Error('Failed to delete content block');
  }
  
  // Revalidate appropriate pages
  if (toolSlug) {
    revalidatePath(`/admin/tools/${toolSlug}/content`);
    revalidatePath(`/tools/${toolSlug}`); // For future public tool pages
  } else if (pageSlug) {
    revalidatePath('/admin/content');
    revalidatePath(`/${pageSlug}`); // For static pages
  }
  
  return { success: true };
}

/**
 * Update sort orders for content blocks (for drag and drop reordering)
 */
export async function updateBlockSortOrdersForTool(toolSlug: string, blockUpdates: Array<{ id: string; sort_order: number }>) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  if (!toolSlug || !blockUpdates || blockUpdates.length === 0) {
    throw new Error('Tool slug and block updates are required');
  }
  
  // Update each block's sort order
  for (const update of blockUpdates) {
    const { error } = await supabase
      .from('content_blocks')
      .update({ sort_order: update.sort_order })
      .eq('id', update.id)
      .eq('tool_slug', toolSlug) // Ensure we only update blocks for this tool
      .is('page_id', null);
      
    if (error) {
      console.error('Error updating block sort order:', error);
      throw new Error('Failed to update block sort order');
    }
  }
  
  // Revalidate the tool content management page
  revalidatePath(`/admin/tools/${toolSlug}/content`);
  
  return { success: true };
} 