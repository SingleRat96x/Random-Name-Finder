'use server';

import { createServerComponentClient } from '@/lib/supabase/server';

export interface PublishedToolMetadata {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  accent_color_class: string | null;
  icon_name: string | null;
}

/**
 * Fetch all published tools metadata for the public tools listing page
 * Returns lightweight tool data for search, filtering, and display
 */
export async function fetchAllPublishedToolsMetadata(): Promise<PublishedToolMetadata[]> {
  try {
    const supabase = await createServerComponentClient();
    
    const { data: tools, error } = await supabase
      .from('tools')
      .select('id, name, slug, description, category, accent_color_class, icon_name')
      .eq('is_published', true)
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching published tools:', error);
      throw new Error('Failed to fetch published tools');
    }
    
    return tools || [];
  } catch (error) {
    console.error('Unexpected error in fetchAllPublishedToolsMetadata:', error);
    throw new Error('Failed to fetch published tools');
  }
} 