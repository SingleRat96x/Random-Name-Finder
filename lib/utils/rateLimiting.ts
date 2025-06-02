// Rate limiting utility for authentication forms
// Implements exponential backoff for failed login/signup attempts

export interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  lockoutUntil: number | null;
}

export interface RateLimitResult {
  isAllowed: boolean;
  remainingTime: number; // in seconds
  maxAttempts: number;
  currentAttempts: number;
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  baseDelay: 60000, // 1 minute in milliseconds
  maxDelay: 900000, // 15 minutes in milliseconds
  storageKey: (type: string) => `auth_rate_limit_${type}`,
  cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Calculate lockout duration using exponential backoff
 */
function calculateLockoutDuration(attempts: number): number {
  const exponentialDelay = RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, attempts - RATE_LIMIT_CONFIG.maxAttempts);
  return Math.min(exponentialDelay, RATE_LIMIT_CONFIG.maxDelay);
}

/**
 * Get rate limit state from localStorage
 */
function getRateLimitState(type: 'login' | 'signup' | 'forgot-password'): RateLimitState {
  if (typeof window === 'undefined') {
    return { attempts: 0, lastAttempt: 0, lockoutUntil: null };
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_CONFIG.storageKey(type));
    if (!stored) {
      return { attempts: 0, lastAttempt: 0, lockoutUntil: null };
    }

    const state: RateLimitState = JSON.parse(stored);
    
    // Clean up old data
    const now = Date.now();
    if (state.lastAttempt && now - state.lastAttempt > RATE_LIMIT_CONFIG.cleanupInterval) {
      localStorage.removeItem(RATE_LIMIT_CONFIG.storageKey(type));
      return { attempts: 0, lastAttempt: 0, lockoutUntil: null };
    }

    return state;
  } catch (error) {
    console.error('Error reading rate limit state:', error);
    return { attempts: 0, lastAttempt: 0, lockoutUntil: null };
  }
}

/**
 * Save rate limit state to localStorage
 */
function saveRateLimitState(type: 'login' | 'signup' | 'forgot-password', state: RateLimitState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(RATE_LIMIT_CONFIG.storageKey(type), JSON.stringify(state));
  } catch (error) {
    console.error('Error saving rate limit state:', error);
  }
}

/**
 * Check if an action is allowed based on rate limiting
 */
export function checkRateLimit(type: 'login' | 'signup' | 'forgot-password'): RateLimitResult {
  const state = getRateLimitState(type);
  const now = Date.now();

  // Check if currently locked out
  if (state.lockoutUntil && now < state.lockoutUntil) {
    const remainingTime = Math.ceil((state.lockoutUntil - now) / 1000);
    return {
      isAllowed: false,
      remainingTime,
      maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      currentAttempts: state.attempts,
    };
  }

  // Clear lockout if expired
  if (state.lockoutUntil && now >= state.lockoutUntil) {
    const clearedState: RateLimitState = {
      attempts: 0,
      lastAttempt: now,
      lockoutUntil: null,
    };
    saveRateLimitState(type, clearedState);
    return {
      isAllowed: true,
      remainingTime: 0,
      maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      currentAttempts: 0,
    };
  }

  return {
    isAllowed: true,
    remainingTime: 0,
    maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
    currentAttempts: state.attempts,
  };
}

/**
 * Record a failed attempt and update rate limiting state
 */
export function recordFailedAttempt(type: 'login' | 'signup' | 'forgot-password'): RateLimitResult {
  const state = getRateLimitState(type);
  const now = Date.now();

  const newAttempts = state.attempts + 1;
  let newLockoutUntil: number | null = null;

  // Apply lockout if max attempts exceeded
  if (newAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    const lockoutDuration = calculateLockoutDuration(newAttempts);
    newLockoutUntil = now + lockoutDuration;
  }

  const newState: RateLimitState = {
    attempts: newAttempts,
    lastAttempt: now,
    lockoutUntil: newLockoutUntil,
  };

  saveRateLimitState(type, newState);

  return {
    isAllowed: newLockoutUntil === null,
    remainingTime: newLockoutUntil ? Math.ceil((newLockoutUntil - now) / 1000) : 0,
    maxAttempts: RATE_LIMIT_CONFIG.maxAttempts,
    currentAttempts: newAttempts,
  };
}

/**
 * Record a successful attempt and clear the rate limiting state
 */
export function recordSuccessfulAttempt(type: 'login' | 'signup' | 'forgot-password'): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RATE_LIMIT_CONFIG.storageKey(type));
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
 * Clear all rate limiting data (useful for testing or admin reset)
 */
export function clearAllRateLimits(): void {
  if (typeof window === 'undefined') return;

  try {
    ['login', 'signup', 'forgot-password'].forEach(type => {
      localStorage.removeItem(RATE_LIMIT_CONFIG.storageKey(type));
    });
  } catch (error) {
    console.error('Error clearing rate limits:', error);
  }
} 