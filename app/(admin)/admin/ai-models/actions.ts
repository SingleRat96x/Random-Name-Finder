'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@/lib/supabase/server';
import { AIModel } from '@/lib/types/tools';

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
 * Fetch all AI models
 */
export async function fetchAIModels(): Promise<AIModel[]> {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: models, error } = await supabase
    .from('ai_models')
    .select('*')
    .order('display_name', { ascending: true });
    
  if (error) {
    console.error('Error fetching AI models:', error);
    throw new Error('Failed to fetch AI models');
  }
  
  return models || [];
}

/**
 * Fetch active AI models (for use in tool forms)
 */
export async function fetchActiveAIModels(): Promise<AIModel[]> {
  const supabase = await createServerActionClient();
  
  const { data: models, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_active', true)
    .order('display_name', { ascending: true });
    
  if (error) {
    console.error('Error fetching active AI models:', error);
    throw new Error('Failed to fetch active AI models');
  }
  
  return models || [];
}

/**
 * Fetch a single AI model by ID
 */
export async function fetchAIModelById(id: string): Promise<AIModel | null> {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: model, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching AI model:', error);
    return null;
  }
  
  return model;
}

/**
 * Add a new AI model
 */
export async function addAIModel(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const modelIdentifier = formData.get('model_identifier') as string;
  const displayName = formData.get('display_name') as string;
  const providerName = formData.get('provider_name') as string;
  const capabilitiesTagsStr = formData.get('capabilities_tags') as string;
  const isActive = formData.get('is_active') === 'true';
  const notesForAdmin = formData.get('notes_for_admin') as string;
  
  // Validate required fields
  if (!modelIdentifier || !displayName || !providerName) {
    throw new Error('Model identifier, display name, and provider name are required');
  }
  
  // Parse capabilities tags
  const capabilitiesTags = capabilitiesTagsStr
    ? capabilitiesTagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];
  
  // Insert the new AI model
  const { error } = await supabase
    .from('ai_models')
    .insert({
      model_identifier: modelIdentifier,
      display_name: displayName,
      provider_name: providerName,
      capabilities_tags: capabilitiesTags,
      is_active: isActive,
      notes_for_admin: notesForAdmin || null,
    });
    
  if (error) {
    console.error('Error adding AI model:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('An AI model with this identifier already exists');
    }
    throw new Error('Failed to add AI model');
  }
  
  revalidatePath('/admin/ai-models');
  
  return { success: true };
}

/**
 * Update an existing AI model
 */
export async function updateAIModel(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const id = formData.get('id') as string;
  const modelIdentifier = formData.get('model_identifier') as string;
  const displayName = formData.get('display_name') as string;
  const providerName = formData.get('provider_name') as string;
  const capabilitiesTagsStr = formData.get('capabilities_tags') as string;
  const isActive = formData.get('is_active') === 'true';
  const notesForAdmin = formData.get('notes_for_admin') as string;
  
  // Validate required fields
  if (!id || !modelIdentifier || !displayName || !providerName) {
    throw new Error('ID, model identifier, display name, and provider name are required');
  }
  
  // Parse capabilities tags
  const capabilitiesTags = capabilitiesTagsStr
    ? capabilitiesTagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];
  
  // Update the AI model
  const { error } = await supabase
    .from('ai_models')
    .update({
      model_identifier: modelIdentifier,
      display_name: displayName,
      provider_name: providerName,
      capabilities_tags: capabilitiesTags,
      is_active: isActive,
      notes_for_admin: notesForAdmin || null,
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating AI model:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('An AI model with this identifier already exists');
    }
    throw new Error('Failed to update AI model');
  }
  
  revalidatePath('/admin/ai-models');
  
  return { success: true };
}

/**
 * Delete an AI model
 */
export async function deleteAIModel(id: string) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  if (!id) {
    throw new Error('AI model ID is required');
  }
  
  // Check if any tools are using this AI model
  const { data: toolsUsingModel, error: checkError } = await supabase
    .from('tools')
    .select('id, name')
    .eq('default_ai_model_identifier', id);
    
  if (checkError) {
    console.error('Error checking tool dependencies:', checkError);
    throw new Error('Failed to check dependencies');
  }
  
  if (toolsUsingModel && toolsUsingModel.length > 0) {
    const toolNames = toolsUsingModel.map(tool => tool.name).join(', ');
    throw new Error(`Cannot delete AI model: it is being used by the following tools: ${toolNames}`);
  }
  
  // Delete the AI model
  const { error } = await supabase
    .from('ai_models')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting AI model:', error);
    throw new Error('Failed to delete AI model');
  }
  
  revalidatePath('/admin/ai-models');
  
  return { success: true };
} 