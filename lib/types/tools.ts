export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category?: string;
  accent_color_class?: string;
  ai_prompt_category: string;
  default_ai_model_identifier: string | null;
  available_ai_model_identifiers: string[];
  default_parameters: Record<string, unknown>;
  configurable_fields: ConfigurableField[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  model_identifier: string;
  display_name: string;
  provider_name: string;
  capabilities_tags: string[];
  is_active: boolean;
  notes_for_admin: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailableAIModel {
  model_identifier: string;
  display_name: string;
  provider_name: string;
  capabilities_tags: string[];
}

export interface ConfigurableField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'switch' | 'list';
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
  description?: string;
  layout_span_all_columns?: boolean;
}

export interface ContentBlock {
  id: string;
  page_id: string | null;
  tool_slug: string | null;
  block_type: string;
  content_data: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AIGenerationRequest {
  ai_prompt_category: string;
  default_ai_model_identifier?: string;
  parameters: Record<string, unknown>;
}

export interface AIGenerationResponse {
  success: boolean;
  names?: string[];
  error?: string;
}

// ============================================================================
// Types for user saved names functionality (Phase 2.4 & 2.5)
// ============================================================================

export interface SavedName {
  id: string;
  user_id: string;
  name_text: string;
  tool_slug: string;
  favorited_at: string;
}

export interface SavedNamesResponse {
  success: boolean;
  savedNames?: SavedName[];
  error?: string;
}

export interface SaveNameResponse {
  success: boolean;
  savedName?: SavedName;
  error?: string;
}

export interface RemoveNameResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// Types for user tool interactions functionality (Dashboard recent tools)
// ============================================================================

export interface UserToolInteraction {
  id: string;
  user_id: string;
  tool_slug: string;
  last_used_at: string;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecentToolInteraction {
  tool_slug: string;
  last_used_at: string;
  tool_name?: string;
  tool_icon?: string;
  tool_description?: string;
  tool_category?: string;
}

export interface RecentToolInteractionsResponse {
  success: boolean;
  interactions?: RecentToolInteraction[];
  error?: string;
}

export interface LogToolUsageResponse {
  success: boolean;
  error?: string;
} 