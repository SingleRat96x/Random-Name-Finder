'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@/lib/supabase/server';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category?: string;
  accent_color_class?: string;
  icon_name: string | null;
  ai_prompt_category: string;
  default_ai_model_identifier: string | null;
  available_ai_model_identifiers: string[];
  default_parameters: Record<string, unknown>;
  configurable_fields: Array<Record<string, unknown>>;
  is_published: boolean;
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
 * Fetch all tools for admin listing
 */
export async function fetchTools(): Promise<Tool[]> {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching tools:', error);
    throw new Error('Failed to fetch tools');
  }
  
  return tools || [];
}

/**
 * Fetch a single tool by ID for editing
 */
export async function fetchToolById(toolId: string): Promise<Tool | null> {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  const { data: tool, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', toolId)
    .single();
    
  if (error) {
    console.error('Error fetching tool:', error);
    return null;
  }
  
  return tool;
}

/**
 * Parse JSON string safely
 */
function parseJsonSafely(jsonString: string, fieldName: string): unknown {
  if (!jsonString.trim()) return fieldName === 'default_parameters' ? {} : [];
  
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new Error(`Invalid JSON format for ${fieldName}`);
  }
}

/**
 * Add a new tool
 */
export async function addTool(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const accentColorClass = formData.get('accent_color_class') as string;
  const iconName = formData.get('icon_name') as string;
  const aiPromptCategory = formData.get('ai_prompt_category') as string;
  const defaultAiModelIdentifier = formData.get('default_ai_model_identifier') as string;
  const availableAiModelIdentifiersStr = formData.get('available_ai_model_identifiers') as string;
  const defaultParametersStr = formData.get('default_parameters') as string;
  const configurableFieldsStr = formData.get('configurable_fields') as string;
  const isPublished = formData.get('is_published') === 'true';
  
  // Validate required fields
  if (!name || !slug || !aiPromptCategory) {
    throw new Error('Name, slug, and AI prompt category are required');
  }
  
  // Parse JSON fields
  const defaultParameters = parseJsonSafely(defaultParametersStr, 'default_parameters');
  const configurableFields = parseJsonSafely(configurableFieldsStr, 'configurable_fields');
  const availableAiModelIdentifiers = parseJsonSafely(availableAiModelIdentifiersStr, 'available_ai_model_identifiers') as string[];
  
  // Insert the new tool
  const { error } = await supabase
    .from('tools')
    .insert({
      name,
      slug,
      description: description || null,
      category: category || null,
      accent_color_class: accentColorClass || null,
      icon_name: iconName || null,
      ai_prompt_category: aiPromptCategory,
      default_ai_model_identifier: defaultAiModelIdentifier || null,
      available_ai_model_identifiers: availableAiModelIdentifiers,
      default_parameters: defaultParameters,
      configurable_fields: configurableFields,
      is_published: isPublished,
    });
    
  if (error) {
    console.error('Error adding tool:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('A tool with this slug already exists');
    }
    throw new Error('Failed to add tool');
  }
  
  // Revalidate the tools list page
  revalidatePath('/admin/tools');
  
  // Redirect to tools list
  redirect('/admin/tools');
}

/**
 * Update an existing tool
 */
export async function updateTool(formData: FormData) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  // Extract form data
  const toolId = formData.get('tool_id') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const accentColorClass = formData.get('accent_color_class') as string;
  const iconName = formData.get('icon_name') as string;
  const aiPromptCategory = formData.get('ai_prompt_category') as string;
  const defaultAiModelIdentifier = formData.get('default_ai_model_identifier') as string;
  const availableAiModelIdentifiersStr = formData.get('available_ai_model_identifiers') as string;
  const defaultParametersStr = formData.get('default_parameters') as string;
  const configurableFieldsStr = formData.get('configurable_fields') as string;
  const isPublished = formData.get('is_published') === 'true';
  
  // Validate required fields
  if (!toolId || !name || !slug || !aiPromptCategory) {
    throw new Error('Tool ID, name, slug, and AI prompt category are required');
  }
  
  // Parse JSON fields
  const defaultParameters = parseJsonSafely(defaultParametersStr, 'default_parameters');
  const configurableFields = parseJsonSafely(configurableFieldsStr, 'configurable_fields');
  const availableAiModelIdentifiers = parseJsonSafely(availableAiModelIdentifiersStr, 'available_ai_model_identifiers') as string[];
  
  // Update the tool
  const { error } = await supabase
    .from('tools')
    .update({
      name,
      slug,
      description: description || null,
      category: category || null,
      accent_color_class: accentColorClass || null,
      icon_name: iconName || null,
      ai_prompt_category: aiPromptCategory,
      default_ai_model_identifier: defaultAiModelIdentifier || null,
      available_ai_model_identifiers: availableAiModelIdentifiers,
      default_parameters: defaultParameters,
      configurable_fields: configurableFields,
      is_published: isPublished,
    })
    .eq('id', toolId);
    
  if (error) {
    console.error('Error updating tool:', error);
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('A tool with this slug already exists');
    }
    throw new Error('Failed to update tool');
  }
  
  // Revalidate the tools list page and potentially public tool pages
  revalidatePath('/admin/tools');
  revalidatePath(`/tools/${slug}`); // For future public tool pages
  
  // Redirect to tools list
  redirect('/admin/tools');
}

/**
 * Delete a tool
 */
export async function deleteTool(toolId: string) {
  await verifyAdminAccess();
  
  const supabase = await createServerActionClient();
  
  if (!toolId) {
    throw new Error('Tool ID is required');
  }
  
  // Delete the tool
  const { error } = await supabase
    .from('tools')
    .delete()
    .eq('id', toolId);
    
  if (error) {
    console.error('Error deleting tool:', error);
    throw new Error('Failed to delete tool');
  }
  
  // Revalidate the tools list page
  revalidatePath('/admin/tools');
  
  return { success: true };
}

/**
 * Generate a URL-friendly slug from a name
 */
export async function generateSlug(name: string): Promise<string> {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
} 