import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerComponentClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL or Anon Key is missing. Check your environment variables.'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL or Anon Key is missing. Check your environment variables.'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

export async function createServerActionClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL or Anon Key is missing. Check your environment variables.'
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
}

/**
 * Fetch a single tool by its slug
 */
export async function fetchToolBySlug(slug: string) {
  const supabase = await createServerComponentClient();
  
  const { data: tool, error } = await supabase
    .from('tools')
    .select('id, name, slug, description, category, ai_prompt_category, default_ai_model_identifier, available_ai_model_identifiers, default_parameters, configurable_fields, is_published')
    .eq('slug', slug)
    .eq('is_published', true) // Only fetch published tools for public pages
    .single();
    
  if (error) {
    console.error('Error fetching tool by slug:', error);
    return null;
  }
  
  return tool;
}

/**
 * Fetch content blocks for a tool by slug
 */
export async function fetchToolContentBlocks(toolSlug: string) {
  const supabase = await createServerComponentClient();
  
  const { data: blocks, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('tool_slug', toolSlug)
    .is('page_id', null)
    .order('sort_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching tool content blocks:', error);
    return [];
  }
  
  return blocks || [];
}

/**
 * Fetch available AI models by their identifiers
 */
export async function fetchAvailableAIModels(modelIdentifiers: string[]) {
  if (!modelIdentifiers || modelIdentifiers.length === 0) {
    return [];
  }

  const supabase = await createServerComponentClient();
  
  const { data: models, error } = await supabase
    .from('ai_models')
    .select('model_identifier, display_name, provider_name, capabilities_tags')
    .in('model_identifier', modelIdentifiers)
    .eq('is_active', true)
    .order('display_name', { ascending: true });
    
  if (error) {
    console.error('Error fetching available AI models:', error);
    return [];
  }
  
  return models || [];
} 