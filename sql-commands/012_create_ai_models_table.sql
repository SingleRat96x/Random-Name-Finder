-- Create ai_models table for managing AI model definitions
-- This table stores information about available AI models for name generation

CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_identifier TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  capabilities_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes_for_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on model_identifier for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_models_model_identifier ON ai_models(model_identifier);

-- Create index on is_active for filtering active models
CREATE INDEX IF NOT EXISTS idx_ai_models_is_active ON ai_models(is_active);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_models_updated_at();

-- Insert some default AI models
INSERT INTO ai_models (model_identifier, display_name, provider_name, capabilities_tags, is_active, notes_for_admin) VALUES
('anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'Anthropic', ARRAY['High Quality', 'Creative', 'General Purpose'], true, 'Best overall model for creative name generation'),
('openai/gpt-4o', 'GPT-4o', 'OpenAI', ARRAY['High Quality', 'Fast', 'General Purpose'], true, 'OpenAI''s latest and most capable model'),
('openai/gpt-3.5-turbo', 'GPT-3.5 Turbo', 'OpenAI', ARRAY['Fast', 'Cost Effective', 'General Purpose'], true, 'Good balance of speed and quality'),
('google/gemini-flash-1.5', 'Gemini Flash 1.5', 'Google', ARRAY['Fast', 'Free Tier', 'General Purpose'], true, 'Google''s fast and efficient model'),
('meta-llama/llama-3.1-8b-instruct', 'Llama 3.1 8B', 'Meta', ARRAY['Open Source', 'Cost Effective', 'General Purpose'], true, 'Meta''s open source model'),
('mistralai/mistral-7b-instruct', 'Mistral 7B Instruct', 'Mistral AI', ARRAY['Open Source', 'Fast', 'European'], true, 'European open source alternative')
ON CONFLICT (model_identifier) DO NOTHING; 