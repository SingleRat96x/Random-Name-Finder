export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ai_prompt_category: string;
  ai_model_preference: string | null;
  default_parameters: Record<string, unknown>;
  configurable_fields: ConfigurableField[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
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
  ai_model_preference?: string;
  parameters: Record<string, unknown>;
}

export interface AIGenerationResponse {
  success: boolean;
  names?: string[];
  error?: string;
} 