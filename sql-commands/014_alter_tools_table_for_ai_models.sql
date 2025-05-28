-- Alter tools table to use AI models structure
-- This script modifies the existing tools table to reference ai_models

-- Rename ai_model_preference to default_ai_model_identifier
ALTER TABLE tools 
RENAME COLUMN ai_model_preference TO default_ai_model_identifier;

-- Add available_ai_model_identifiers column to store array of model identifiers
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS available_ai_model_identifiers JSONB DEFAULT '[]'::JSONB;

-- Update existing tools to have default available models if they don't have any
UPDATE tools 
SET available_ai_model_identifiers = '["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "openai/gpt-3.5-turbo"]'::JSONB
WHERE available_ai_model_identifiers = '[]'::JSONB OR available_ai_model_identifiers IS NULL;

-- Update existing tools to use a valid default model identifier if they have an old value
UPDATE tools 
SET default_ai_model_identifier = 'anthropic/claude-3.5-sonnet'
WHERE default_ai_model_identifier IS NULL 
   OR default_ai_model_identifier = '' 
   OR default_ai_model_identifier NOT IN (
     SELECT model_identifier FROM ai_models WHERE is_active = true
   ); 