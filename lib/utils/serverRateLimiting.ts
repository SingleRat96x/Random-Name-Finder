// Server-side rate limiting utility for forms
// Implements exponential backoff using database storage

import { createClient } from '@supabase/supabase-js';

export interface ServerRateLimitState {
  attempts: number;
  lastAttempt: Date;
  lockoutUntil: Date | null;
}

export interface ServerRateLimitResult {
  isAllowed: boolean;
  remainingTime: number; // in seconds
  maxAttempts: number;
  currentAttempts: number;
  message?: string;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  contact: {
    maxAttempts: 3, // More restrictive for contact forms
    baseDelay: 300000, // 5 minutes in milliseconds
    maxDelay: 3600000, // 1 hour in milliseconds
  },
  login: {
    maxAttempts: 5,
    baseDelay: 60000, // 1 minute
    maxDelay: 900000, // 15 minutes
  },
  signup: {
    maxAttempts: 3,
    baseDelay: 180000, // 3 minutes
    maxDelay: 1800000, // 30 minutes
  },
};

/**
 * Get Supabase client with service role for rate limiting operations
 */
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Calculate lockout duration using exponential backoff
 */
function calculateLockoutDuration(
  attempts: number, 
  formType: keyof typeof RATE_LIMIT_CONFIG
): number {
  const config = RATE_LIMIT_CONFIG[formType];
  const exponentialDelay = config.baseDelay * Math.pow(2, attempts - config.maxAttempts);
  return Math.min(exponentialDelay, config.maxDelay);
}

/**
 * Get rate limit state from database
 */
async function getRateLimitState(
  identifier: string, 
  formType: keyof typeof RATE_LIMIT_CONFIG
): Promise<ServerRateLimitState> {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('attempts, last_attempt, lockout_until')
      .eq('identifier', identifier)
      .eq('form_type', formType)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching rate limit state:', error);
      return { attempts: 0, lastAttempt: new Date(), lockoutUntil: null };
    }

    if (!data) {
      return { attempts: 0, lastAttempt: new Date(), lockoutUntil: null };
    }

    return {
      attempts: data.attempts,
      lastAttempt: new Date(data.last_attempt),
      lockoutUntil: data.lockout_until ? new Date(data.lockout_until) : null,
    };
  } catch (error) {
    console.error('Error reading rate limit state:', error);
    return { attempts: 0, lastAttempt: new Date(), lockoutUntil: null };
  }
}

/**
 * Save rate limit state to database
 */
async function saveRateLimitState(
  identifier: string,
  formType: keyof typeof RATE_LIMIT_CONFIG,
  state: ServerRateLimitState
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from('rate_limits')
      .upsert({
        identifier,
        form_type: formType,
        attempts: state.attempts,
        last_attempt: state.lastAttempt.toISOString(),
        lockout_until: state.lockoutUntil?.toISOString() || null,
      }, {
        onConflict: 'identifier,form_type'
      });

    if (error) {
      console.error('Error saving rate limit state:', error);
    }
  } catch (error) {
    console.error('Error saving rate limit state:', error);
  }
}

/**
 * Check if an action is allowed based on rate limiting
 */
export async function checkServerRateLimit(
  identifier: string,
  formType: keyof typeof RATE_LIMIT_CONFIG
): Promise<ServerRateLimitResult> {
  const config = RATE_LIMIT_CONFIG[formType];
  const state = await getRateLimitState(identifier, formType);
  const now = new Date();

  // Check if currently locked out
  if (state.lockoutUntil && now < state.lockoutUntil) {
    const remainingTime = Math.ceil((state.lockoutUntil.getTime() - now.getTime()) / 1000);
    return {
      isAllowed: false,
      remainingTime,
      maxAttempts: config.maxAttempts,
      currentAttempts: state.attempts,
      message: `Too many attempts. Please try again in ${formatRemainingTime(remainingTime)}.`,
    };
  }

  // Clear lockout if expired
  if (state.lockoutUntil && now >= state.lockoutUntil) {
    const clearedState: ServerRateLimitState = {
      attempts: 0,
      lastAttempt: now,
      lockoutUntil: null,
    };
    await saveRateLimitState(identifier, formType, clearedState);
    return {
      isAllowed: true,
      remainingTime: 0,
      maxAttempts: config.maxAttempts,
      currentAttempts: 0,
    };
  }

  return {
    isAllowed: true,
    remainingTime: 0,
    maxAttempts: config.maxAttempts,
    currentAttempts: state.attempts,
  };
}

/**
 * Record a failed/spam attempt and update rate limiting state
 */
export async function recordServerFailedAttempt(
  identifier: string,
  formType: keyof typeof RATE_LIMIT_CONFIG
): Promise<ServerRateLimitResult> {
  const config = RATE_LIMIT_CONFIG[formType];
  const state = await getRateLimitState(identifier, formType);
  const now = new Date();

  const newAttempts = state.attempts + 1;
  let newLockoutUntil: Date | null = null;

  // Apply lockout if max attempts exceeded
  if (newAttempts >= config.maxAttempts) {
    const lockoutDuration = calculateLockoutDuration(newAttempts, formType);
    newLockoutUntil = new Date(now.getTime() + lockoutDuration);
  }

  const newState: ServerRateLimitState = {
    attempts: newAttempts,
    lastAttempt: now,
    lockoutUntil: newLockoutUntil,
  };

  await saveRateLimitState(identifier, formType, newState);

  const remainingTime = newLockoutUntil ? Math.ceil((newLockoutUntil.getTime() - now.getTime()) / 1000) : 0;

  return {
    isAllowed: newLockoutUntil === null,
    remainingTime,
    maxAttempts: config.maxAttempts,
    currentAttempts: newAttempts,
    message: newLockoutUntil 
      ? `Too many attempts. Please try again in ${formatRemainingTime(remainingTime)}.`
      : undefined,
  };
}

/**
 * Record a successful attempt and clear the rate limiting state
 */
export async function recordServerSuccessfulAttempt(
  identifier: string,
  formType: keyof typeof RATE_LIMIT_CONFIG
): Promise<void> {
  const supabase = getSupabaseServiceClient();

  try {
    await supabase
      .from('rate_limits')
      .delete()
      .eq('identifier', identifier)
      .eq('form_type', formType);
  } catch (error) {
    console.error('Error clearing rate limit state:', error);
  }
}

/**
 * Format remaining time for user display
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

/**
 * Clean up old rate limiting data (useful for maintenance)
 */
export async function cleanupOldRateLimits(): Promise<number> {
  const supabase = getSupabaseServiceClient();

  try {
    const { data, error } = await supabase.rpc('cleanup_old_rate_limits');
    
    if (error) {
      console.error('Error cleaning up old rate limits:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error cleaning up old rate limits:', error);
    return 0;
  }
}

/**
 * Check for suspicious patterns in form submissions
 */
export function detectSpamPatterns(formData: {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}): { isSpam: boolean; reason?: string } {
  const { name, email, subject, message } = formData;

  // Check for common spam patterns
  const spamKeywords = [
    'bitcoin', 'cryptocurrency', 'investment', 'loan', 'viagra', 'casino',
    'gambling', 'make money', 'work from home', 'click here', 'buy now',
    'limited time', 'urgent', 'congratulations', 'winner', 'prize',
  ];

  const textToCheck = `${name} ${email} ${subject} ${message}`.toLowerCase();

  // Check for spam keywords
  for (const keyword of spamKeywords) {
    if (textToCheck.includes(keyword)) {
      return { isSpam: true, reason: 'Contains spam keywords' };
    }
  }

  // Check for excessive links
  const linkCount = (textToCheck.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    return { isSpam: true, reason: 'Contains too many links' };
  }

  // Check for repetitive characters
  if (/(.)\1{4,}/.test(textToCheck)) {
    return { isSpam: true, reason: 'Contains repetitive characters' };
  }

  // Check for all caps (likely spam if more than 50% of message is caps)
  if (message && message.length > 10) {
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / message.length;
    if (capsRatio > 0.5) {
      return { isSpam: true, reason: 'Message is mostly in caps' };
    }
  }

  return { isSpam: false };
} 