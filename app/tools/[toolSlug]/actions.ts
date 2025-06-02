'use server';

import { AIGenerationResponse } from '@/lib/types/tools';
import { logToolUsage } from '@/app/actions/toolInteractionsActions';
import { createServerActionClient } from '@/lib/supabase/server';

/**
 * Generate names using AI API
 * Requires OPENROUTER_API_KEY environment variable to be set
 */
export async function generateNamesAction(formData: FormData): Promise<AIGenerationResponse> {
  try {
    // Extract form data
    const aiPromptCategory = formData.get('ai_prompt_category') as string;
    const selectedAIModelIdentifier = formData.get('selected_ai_model_identifier') as string;
    const tone = formData.get('tone') as string;
    const count = parseInt(formData.get('count') as string, 10);
    const keyword = formData.get('keyword') as string;
    const nameLengthPreference = formData.get('name_length_preference') as string;
    const toolSlug = formData.get('tool_slug') as string; // Extract tool slug from form data
    
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
    const prompt = constructPrompt(aiPromptCategory, { 
      tone, 
      count, 
      keyword, 
      nameLengthPreference 
    });
    
    // Determine which AI model to use
    const modelToUse = selectedAIModelIdentifier || 'anthropic/claude-3.5-sonnet';
    
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
        model: modelToUse,
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
    
    // Handle specific error cases
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429) {
        let modelName = modelToUse;
        try {
          modelName = modelToUse.split('/').pop() || modelToUse;
        } catch {}

        return { 
          success: false, 
          error: `The selected AI model (${modelName}) is currently experiencing high traffic or is rate-limited. Please try again in a few moments, or select a different AI model if available.` 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to generate names. Please try again.' 
      };
    }
    
    const data = await response.json();
    
    const generatedText = data.choices?.[0]?.message?.content;
    if (!generatedText) {
      return { 
        success: false, 
        error: 'No names were generated. Please try again.' 
      };
    }
    
    const names = parseNamesFromResponse(generatedText);
    
    if (names.length === 0) {
      return { 
        success: false, 
        error: 'Could not parse names from the response. Please try again.' 
      };
    }

    // Log tool usage for authenticated users after successful generation
    if (toolSlug) {
      try {
        // Get current user to check if they're authenticated
        const supabase = await createServerActionClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!authError && user) {
          // Log the tool usage (await to handle any errors properly)
          const logResult = await logToolUsage(toolSlug);
          if (!logResult.success) {
            // Log the error but don't fail the name generation
            console.warn('Failed to log tool usage:', logResult.error);
          }
        }
      } catch (error) {
        // Log the error but don't fail the name generation
        console.warn('Error logging tool usage:', error);
      }
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
  const { tone, count, keyword, nameLengthPreference } = parameters;

  let basePrompt = `You are an expert name creator. Follow the rules exactly.`;

  basePrompt += `\n\nTask: Generate exactly ${count} creative and unique names for the category: "${category}".`;

  if (tone) {
    basePrompt += ` The tone of the names must be "${tone}".`;
  }

  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    basePrompt += ` Each name must include the keyword "${keyword.trim()}" exactly as it is.`;
  }

  if (nameLengthPreference && typeof nameLengthPreference === 'string' && nameLengthPreference !== 'any') {
    switch (nameLengthPreference.toLowerCase()) {
      case 'short':
        basePrompt += ` Each name must be short, typically 5 to 8 characters.`;
        break;
      case 'medium':
        basePrompt += ` Each name must be medium in length, typically 8 to 12 characters.`;
        break;
      case 'long':
        basePrompt += ` Each name must be long, typically 12 or more characters.`;
        break;
    }
  }

  basePrompt += `\n\nStrict Output Rules:\n`;
  basePrompt += `- Return ONLY the list of names.\n`;
  basePrompt += `- Do NOT include any explanation, greeting, or formatting like bullets, numbers, or quotes.\n`;
  basePrompt += `- Put each name on its own line.\n`;
  basePrompt += `- Do not include any blank lines.\n`;

  return basePrompt;
}

/**
 * Parse names from AI response text
 */
function parseNamesFromResponse(responseText: string): string[] {
  return responseText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[\d\-\*\•\.\)\]\}\s]+/, '').trim())
    .filter(line => line.length > 0 && line.length < 100);
}
