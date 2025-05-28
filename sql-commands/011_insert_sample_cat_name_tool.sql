-- Insert sample "Random Cat Name Generator" tool
INSERT INTO tools (
  name,
  slug,
  description,
  ai_prompt_category,
  ai_model_preference,
  default_parameters,
  configurable_fields,
  is_published
) VALUES (
  'Random Cat Name Generator',
  'random-cat-name-generator',
  'Generate unique and creative names for your feline friends. Choose from different tones and styles to find the perfect name that matches your cat''s personality.',
  'cat names',
  'anthropic/claude-3.5-sonnet',
  '{"tone": "playful", "count": 10}',
  '[
    {
      "name": "tone",
      "label": "Cat''s Tone",
      "type": "select",
      "options": ["playful", "mysterious", "regal", "silly"],
      "default": "playful"
    },
    {
      "name": "count",
      "label": "Number of Names",
      "type": "number",
      "default": 10,
      "min": 1,
      "max": 50
    }
  ]',
  true
);

-- Insert some sample content blocks for the cat name generator
INSERT INTO content_blocks (
  tool_slug,
  block_type,
  content_data,
  sort_order
) VALUES 
(
  'random-cat-name-generator',
  'heading_h2',
  '{"text": "Why Choose Our Cat Name Generator?"}',
  1
),
(
  'random-cat-name-generator',
  'paragraph',
  '{"html_content": "Our AI-powered cat name generator creates unique, personality-driven names for your feline companion. Whether you have a playful kitten or a regal adult cat, our tool considers their personality traits to suggest the perfect name."}',
  2
),
(
  'random-cat-name-generator',
  'heading_h3',
  '{"text": "Features"}',
  3
),
(
  'random-cat-name-generator',
  'paragraph',
  '{"html_content": "<ul><li><strong>Personality-based:</strong> Choose from playful, mysterious, regal, or silly tones</li><li><strong>Customizable quantity:</strong> Generate 1-50 names at once</li><li><strong>AI-powered:</strong> Uses advanced AI to create unique, creative names</li><li><strong>Easy to use:</strong> Simple interface with instant results</li></ul>"}',
  4
),
(
  'random-cat-name-generator',
  'heading_h3',
  '{"text": "Tips for Choosing the Perfect Cat Name"}',
  5
),
(
  'random-cat-name-generator',
  'paragraph',
  '{"html_content": "When selecting a name for your cat, consider their personality, appearance, and behavior. Short names (1-2 syllables) are often easier for cats to recognize and respond to. Try saying the name out loud to see how it feels, and make sure it''s something you''ll be comfortable calling out at the vet or in public!"}',
  6
); 