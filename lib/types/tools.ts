export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
  type: 'text' | 'number' | 'select' | 'textarea' | 'switch';
  default?: unknown;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  required?: boolean;
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