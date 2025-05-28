import { createServerComponentClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageWithBlocks {
  page: ContentPage;
  blocks: ContentBlock[];
}

/**
 * Fetch a content page by its slug
 */
export async function getContentPageBySlug(slug: string): Promise<ContentPage> {
  const supabase = await createServerComponentClient();
  
  const { data: page, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error || !page) {
    console.error(`Error fetching page with slug "${slug}":`, error);
    notFound();
  }
  
  return page;
}

/**
 * Fetch content blocks for a page using the SQL function
 */
export async function getPageBlocks(pageSlug: string): Promise<ContentBlock[]> {
  const supabase = await createServerComponentClient();
  
  const { data: blocks, error } = await supabase
    .rpc('get_page_blocks', { page_slug: pageSlug });
    
  if (error) {
    console.error(`Error fetching blocks for page "${pageSlug}":`, error);
    return [];
  }
  
  return blocks || [];
}

/**
 * Fetch a complete page with its content blocks
 */
export async function getPageWithBlocks(pageSlug: string): Promise<PageWithBlocks> {
  // Fetch page and blocks in parallel for better performance
  const [page, blocks] = await Promise.all([
    getContentPageBySlug(pageSlug),
    getPageBlocks(pageSlug)
  ]);
  
  return {
    page,
    blocks
  };
}

/**
 * Generate metadata for a page
 */
export async function generatePageMetadata(pageSlug: string) {
  try {
    const page = await getContentPageBySlug(pageSlug);
    
    return {
      title: page.title,
      description: page.meta_description || `Learn more about ${page.title}`,
    };
  } catch {
    // If page not found, return default metadata
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }
} 