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

export interface SitemapToolData {
  slug: string;
  updated_at: string;
}

export interface SitemapPageData {
  slug: string;
  updated_at: string;
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

/**
 * Fetch published tools data for sitemap generation
 * Returns slug and updated_at for all published tools
 */
export async function fetchAllPublishedToolSlugsAndTimestamps(): Promise<SitemapToolData[]> {
  try {
    const supabase = await createServerComponentClient();
    
    const { data: tools, error } = await supabase
      .from('tools')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching published tools for sitemap:', error);
      throw new Error('Failed to fetch published tools for sitemap');
    }
    
    return tools || [];
  } catch (error) {
    console.error('Unexpected error in fetchAllPublishedToolSlugsAndTimestamps:', error);
    throw new Error('Failed to fetch published tools for sitemap');
  }
}

/**
 * Fetch published content pages data for sitemap generation
 * Returns slug and updated_at for all content pages
 */
export async function fetchAllPublishedContentPageSlugsAndTimestamps(): Promise<SitemapPageData[]> {
  try {
    const supabase = await createServerComponentClient();
    
    const { data: pages, error } = await supabase
      .from('content_pages')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching content pages for sitemap:', error);
      throw new Error('Failed to fetch content pages for sitemap');
    }
    
    return pages || [];
  } catch (error) {
    console.error('Unexpected error in fetchAllPublishedContentPageSlugsAndTimestamps:', error);
    throw new Error('Failed to fetch content pages for sitemap');
  }
}

/**
 * Fetch other published tools for "You Might Like" section
 * Prioritizes tools from the same category, falls back to random selection
 */
export async function fetchOtherPublishedTools(params: {
  currentToolSlug: string;
  count: number;
  category?: string | null;
}): Promise<PublishedToolMetadata[]> {
  try {
    const supabase = await createServerComponentClient();
    const { currentToolSlug, count, category } = params;
    
    let selectedTools: PublishedToolMetadata[] = [];
    
    // Strategy 1: Try to get tools from the same category first
    if (category) {
      const { data: categoryTools, error: categoryError } = await supabase
        .from('tools')
        .select('id, name, slug, description, category, accent_color_class, icon_name')
        .eq('is_published', true)
        .eq('category', category)
        .neq('slug', currentToolSlug)
        .limit(count);
        
      if (!categoryError && categoryTools) {
        selectedTools = categoryTools;
      }
    }
    
    // Strategy 2: If we don't have enough tools from the category, get more tools
    if (selectedTools.length < count) {
      const remainingCount = count - selectedTools.length;
      
      // Get tools not in the same category (or if no category was specified)
      let query = supabase
        .from('tools')
        .select('id, name, slug, description, category, accent_color_class, icon_name')
        .eq('is_published', true)
        .neq('slug', currentToolSlug);
        
      // Exclude tools we already selected from the same category
      if (selectedTools.length > 0) {
        const selectedSlugs = selectedTools.map(tool => tool.slug);
        query = query.not('slug', 'in', `(${selectedSlugs.join(',')})`);
      }
      
      // For "randomness", we'll order by created_at desc and limit
      // This gives us recently added tools which provides some variety
      const { data: additionalTools, error: additionalError } = await query
        .order('created_at', { ascending: false })
        .limit(remainingCount);
        
      if (!additionalError && additionalTools) {
        selectedTools = [...selectedTools, ...additionalTools];
      }
    }
    
    // Shuffle the results for more variety (simple array shuffle)
    for (let i = selectedTools.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedTools[i], selectedTools[j]] = [selectedTools[j], selectedTools[i]];
    }
    
    // Return exactly the requested count
    return selectedTools.slice(0, count);
    
  } catch (error) {
    console.error('Unexpected error in fetchOtherPublishedTools:', error);
    return []; // Return empty array on error to not break the page
  }
} 