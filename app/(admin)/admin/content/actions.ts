'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@/lib/supabase/server';

// Types for our content management
interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

interface ContentBlock {
  id: string;
  page_id: string | null;
  tool_slug: string | null;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Helper function to verify admin access
async function verifyAdminAccess() {
  const supabase = await createServerActionClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required');
  }

  const { data: isAdmin, error: adminError } = await supabase
    .rpc('is_admin');
    
  if (adminError || !isAdmin) {
    throw new Error('Admin access required');
  }
  
  return { supabase, user };
}

// Fetch all static pages
export async function fetchStaticPages(): Promise<ContentPage[]> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .order('title');
    
  if (error) {
    throw new Error(`Failed to fetch pages: ${error.message}`);
  }
  
  return data || [];
}

// Fetch content blocks for a specific page
export async function fetchPageContentBlocks(pageId: string): Promise<ContentBlock[]> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order');
    
  if (error) {
    throw new Error(`Failed to fetch content blocks: ${error.message}`);
  }
  
  return data || [];
}

// Fetch available content block types
export async function fetchContentBlockTypes(): Promise<string[]> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .rpc('get_content_block_types');
    
  if (error) {
    throw new Error(`Failed to fetch block types: ${error.message}`);
  }
  
  return data || [];
}

// Add a new content block
export async function addContentBlock(
  pageId: string,
  blockType: string,
  contentData: Record<string, unknown>,
  sortOrder: number
): Promise<ContentBlock> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .from('content_blocks')
    .insert({
      page_id: pageId,
      block_type: blockType,
      content_data: contentData,
      sort_order: sortOrder
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to add content block: ${error.message}`);
  }
  
  revalidatePath('/admin/content');
  return data;
}

// Update an existing content block
export async function updateContentBlock(
  blockId: string,
  blockType: string,
  contentData: Record<string, unknown>,
  sortOrder: number
): Promise<ContentBlock> {
  const { supabase } = await verifyAdminAccess();
  
  const { data, error } = await supabase
    .from('content_blocks')
    .update({
      block_type: blockType,
      content_data: contentData,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to update content block: ${error.message}`);
  }
  
  revalidatePath('/admin/content');
  return data;
}

// Delete a content block
export async function deleteContentBlock(blockId: string): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  const { error } = await supabase
    .from('content_blocks')
    .delete()
    .eq('id', blockId);
    
  if (error) {
    throw new Error(`Failed to delete content block: ${error.message}`);
  }
  
  revalidatePath('/admin/content');
}

// Update sort orders for multiple blocks (for reordering)
export async function updateBlockSortOrders(
  blocks: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  // Update each block's sort order
  for (const block of blocks) {
    const { error } = await supabase
      .from('content_blocks')
      .update({ 
        sort_order: block.sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', block.id);
      
    if (error) {
      throw new Error(`Failed to update sort order for block ${block.id}: ${error.message}`);
    }
  }
  
  revalidatePath('/admin/content');
}

// Move a block up or down in the sort order
export async function moveContentBlock(
  blockId: string,
  direction: 'up' | 'down',
  pageId: string
): Promise<void> {
  const { supabase } = await verifyAdminAccess();
  
  // Get all blocks for this page
  const { data: blocks, error: fetchError } = await supabase
    .from('content_blocks')
    .select('id, sort_order')
    .eq('page_id', pageId)
    .order('sort_order');
    
  if (fetchError || !blocks) {
    throw new Error(`Failed to fetch blocks for reordering: ${fetchError?.message}`);
  }
  
  // Find the current block and its position
  const currentIndex = blocks.findIndex(block => block.id === blockId);
  if (currentIndex === -1) {
    throw new Error('Block not found');
  }
  
  // Calculate new position
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
  // Check bounds
  if (newIndex < 0 || newIndex >= blocks.length) {
    return; // Already at the edge, no movement needed
  }
  
  // Swap the sort orders
  const currentBlock = blocks[currentIndex];
  const targetBlock = blocks[newIndex];
  
  const updates = [
    { id: currentBlock.id, sort_order: targetBlock.sort_order },
    { id: targetBlock.id, sort_order: currentBlock.sort_order }
  ];
  
  await updateBlockSortOrders(updates);
} 