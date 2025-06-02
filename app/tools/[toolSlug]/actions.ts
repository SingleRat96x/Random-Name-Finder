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
    // Extract system fields that are always required
    const aiPromptCategory = formData.get('ai_prompt_category') as string;
    const selectedAIModelIdentifier = formData.get('selected_ai_model_identifier') as string;
    const toolSlug = formData.get('tool_slug') as string;
    
    // Extract count field with validation (always required)
    const count = parseInt(formData.get('count') as string, 10);
    
    // Validate required inputs
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
    
    // Dynamically extract ALL form fields (excluding system fields)
    const systemFields = new Set([
      'ai_prompt_category', 
      'selected_ai_model_identifier', 
      'tool_slug'
    ]);
    
    const dynamicParameters: Record<string, unknown> = {};
    
    // Add count as a dynamic parameter
    dynamicParameters.count = count;
    
    // Extract all other form fields dynamically
    for (const [key, value] of formData.entries()) {
      if (!systemFields.has(key)) {
        // Handle different field types
        if (key === 'count') {
          // Count already handled above
          continue;
        } else if (value === 'true' || value === 'false') {
          // Boolean/switch fields
          dynamicParameters[key] = value === 'true';
        } else if (value && !isNaN(Number(value)) && key !== 'count') {
          // Numeric fields (excluding count which is handled specially)
          dynamicParameters[key] = Number(value);
        } else if (value && typeof value === 'string' && value.trim() !== '') {
          // String fields
          dynamicParameters[key] = value.trim();
        }
        // Skip empty/null values
      }
    }
    
    // Construct the prompt based on the category and ALL dynamic parameters
    const prompt = constructPrompt(aiPromptCategory, dynamicParameters);
    
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
 * Construct AI prompt based on category and ALL dynamic parameters
 * This function now handles ANY field dynamically without hardcoding
 */
function constructPrompt(category: string, parameters: Record<string, unknown>): string {
  let basePrompt = `You are an expert name creator. Follow the rules exactly.`;

  // Extract count (required field)
  const count = parameters.count;
  basePrompt += `\n\nTask: Generate exactly ${count} creative and unique names for the category: "${category}".`;

  // Process ALL other parameters dynamically
  const processedFields = new Set(['count']); // Track which fields we've processed
  
  // Dynamic field processing based on common field patterns
  for (const [fieldName, fieldValue] of Object.entries(parameters)) {
    if (processedFields.has(fieldName) || !fieldValue) continue;
    
    const fieldNameLower = fieldName.toLowerCase();
    const fieldLabel = formatFieldNameForPrompt(fieldName);
    
    // Handle different types of fields dynamically
    if (typeof fieldValue === 'boolean') {
      // Boolean/switch fields
      if (fieldValue === true) {
        basePrompt += ` Enable ${fieldLabel}.`;
      }
    } else if (typeof fieldValue === 'string') {
      const trimmedValue = fieldValue.trim();
      if (trimmedValue) {
        // Handle specific field patterns intelligently
        if (fieldNameLower.includes('keyword') || fieldNameLower.includes('include')) {
          basePrompt += ` Each name must include the keyword "${trimmedValue}" exactly as it is.`;
        } else if (fieldNameLower.includes('tone') || fieldNameLower.includes('style')) {
          basePrompt += ` The tone/style of the names must be "${trimmedValue}".`;
        } else if (fieldNameLower.includes('length') || fieldNameLower.includes('size')) {
          // Handle length preferences
          if (trimmedValue !== 'any') {
            switch (trimmedValue.toLowerCase()) {
              case 'short':
                basePrompt += ` Each name must be short, typically 5 to 8 characters.`;
                break;
              case 'medium':
                basePrompt += ` Each name must be medium in length, typically 8 to 12 characters.`;
                break;
              case 'long':
                basePrompt += ` Each name must be long, typically 12 or more characters.`;
                break;
              default:
                basePrompt += ` Consider the ${fieldLabel}: "${trimmedValue}".`;
                break;
            }
          }
        } else if (fieldNameLower.includes('theme') || fieldNameLower.includes('category')) {
          basePrompt += ` The names should follow the theme: "${trimmedValue}".`;
        } else if (fieldNameLower.includes('prefix')) {
          basePrompt += ` Each name must start with the prefix "${trimmedValue}".`;
        } else if (fieldNameLower.includes('suffix')) {
          basePrompt += ` Each name must end with the suffix "${trimmedValue}".`;
        } else if (fieldNameLower.includes('avoid') || fieldNameLower.includes('exclude')) {
          basePrompt += ` Avoid including anything related to: "${trimmedValue}".`;
        } else if (fieldNameLower.includes('language') || fieldNameLower.includes('origin')) {
          basePrompt += ` Use names with ${fieldLabel} origin: "${trimmedValue}".`;
        } else if (fieldNameLower.includes('gender')) {
          basePrompt += ` Generate names suitable for ${trimmedValue} gender.`;
        } else if (fieldNameLower.includes('era') || fieldNameLower.includes('period') || fieldNameLower.includes('time')) {
          basePrompt += ` The names should be appropriate for the ${fieldLabel}: "${trimmedValue}".`;
        } else if (fieldNameLower.includes('mood') || fieldNameLower.includes('feeling')) {
          basePrompt += ` The names should convey a ${trimmedValue} mood/feeling.`;
        } else if (fieldNameLower.includes('industry') || fieldNameLower.includes('business') || fieldNameLower.includes('niche')) {
          basePrompt += ` The names should be suitable for the ${fieldLabel}: "${trimmedValue}".`;
        } else {
          // Generic field handling - use the field name as context
          basePrompt += ` Consider the ${fieldLabel}: "${trimmedValue}".`;
        }
      }
    } else if (typeof fieldValue === 'number') {
      // Numeric fields
      if (fieldNameLower.includes('min') || fieldNameLower.includes('minimum')) {
        basePrompt += ` Each name should have a minimum ${fieldLabel.replace(/min(imum)?/i, '').trim()} of ${fieldValue}.`;
      } else if (fieldNameLower.includes('max') || fieldNameLower.includes('maximum')) {
        basePrompt += ` Each name should have a maximum ${fieldLabel.replace(/max(imum)?/i, '').trim()} of ${fieldValue}.`;
      } else {
        basePrompt += ` Consider the ${fieldLabel}: ${fieldValue}.`;
      }
    }
    
    processedFields.add(fieldName);
  }

  basePrompt += `\n\nStrict Output Rules:\n`;
  basePrompt += `- Return ONLY the list of names.\n`;
  basePrompt += `- Do NOT include any explanation, greeting, or formatting like bullets, numbers, or quotes.\n`;
  basePrompt += `- Put each name on its own line.\n`;
  basePrompt += `- Do not include any blank lines.\n`;

  return basePrompt;
}

/**
 * Format field name for use in prompts (convert snake_case to readable text)
 */
function formatFieldNameForPrompt(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
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
