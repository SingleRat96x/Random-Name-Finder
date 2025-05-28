'use server';

import { AIGenerationResponse } from '@/lib/types/tools';

/**
 * Generate names using AI API
 * Requires OPENROUTER_API_KEY environment variable to be set
 */
export async function generateNamesAction(formData: FormData): Promise<AIGenerationResponse> {
  try {
    // Extract form data
    const aiPromptCategory = formData.get('ai_prompt_category') as string;
    const aiModelPreference = formData.get('ai_model_preference') as string;
    const tone = formData.get('tone') as string;
    const count = parseInt(formData.get('count') as string, 10);
    
    // Validate inputs
    if (!aiPromptCategory) {
      return { success: false, error: 'AI prompt category is required' };
    }
    
    if (!count || count < 1 || count > 50) {
      return { success: false, error: 'Count must be between 1 and 50' };
    }
    
    // Check for API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY environment variable is not set');
      return { 
        success: false, 
        error: 'AI service is not configured. Please contact the administrator.' 
      };
    }
    
    // Construct the prompt based on the category and parameters
    const prompt = constructPrompt(aiPromptCategory, { tone, count });
    
    // Make API call to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Random Name Finder'
      },
      body: JSON.stringify({
        model: aiModelPreference || 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return { 
        success: false, 
        error: 'Failed to generate names. Please try again.' 
      };
    }
    
    const data = await response.json();
    
    // Extract names from the response
    const generatedText = data.choices?.[0]?.message?.content;
    if (!generatedText) {
      return { 
        success: false, 
        error: 'No names were generated. Please try again.' 
      };
    }
    
    // Parse names from the response (assuming they're in a list format)
    const names = parseNamesFromResponse(generatedText);
    
    if (names.length === 0) {
      return { 
        success: false, 
        error: 'Could not parse names from the response. Please try again.' 
      };
    }
    
    return { success: true, names };
    
  } catch (error) {
    console.error('Error in generateNamesAction:', error);
    return { 
      success: false, 
      error: 'An unexpected error occurred. Please try again.' 
    };
  }
}

/**
 * Construct AI prompt based on category and parameters
 */
function constructPrompt(category: string, parameters: Record<string, unknown>): string {
  const { tone, count } = parameters;
  
  let basePrompt = '';
  
  switch (category.toLowerCase()) {
    case 'cat names':
      basePrompt = `Generate ${count} creative and unique cat names`;
      if (tone) {
        basePrompt += ` with a ${tone} tone`;
      }
      break;
    case 'dog names':
      basePrompt = `Generate ${count} creative and unique dog names`;
      if (tone) {
        basePrompt += ` with a ${tone} tone`;
      }
      break;
    case 'business names':
      basePrompt = `Generate ${count} creative and unique business names`;
      if (tone) {
        basePrompt += ` with a ${tone} tone`;
      }
      break;
    default:
      basePrompt = `Generate ${count} creative and unique names for ${category}`;
      if (tone) {
        basePrompt += ` with a ${tone} tone`;
      }
  }
  
  basePrompt += `. Please provide only the names, one per line, without numbers, bullets, or additional text. Each name should be on its own line.`;
  
  return basePrompt;
}

/**
 * Parse names from AI response text
 */
function parseNamesFromResponse(responseText: string): string[] {
  // Split by lines and clean up
  const lines = responseText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove common prefixes like numbers, bullets, dashes
      return line.replace(/^[\d\-\*\•\.\)\]\}\s]+/, '').trim();
    })
    .filter(line => line.length > 0 && line.length < 100); // Filter out very long lines
  
  return lines;
} 