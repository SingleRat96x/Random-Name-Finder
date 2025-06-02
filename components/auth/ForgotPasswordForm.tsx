'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  recordSuccessfulAttempt,
  formatRemainingTime,
  type RateLimitResult 
} from '@/lib/utils/rateLimiting';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordForm() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rate limiting state
  const [rateLimitState, setRateLimitState] = useState<RateLimitResult>({
    isAllowed: true,
    remainingTime: 0,
    maxAttempts: 5,
    currentAttempts: 0,
  });

  // Initialize Supabase client
  const supabase = createClient();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check rate limit on component mount and set up timer for lockout countdown
  useEffect(() => {
    const checkInitialRateLimit = () => {
      const result = checkRateLimit('forgot-password');
      setRateLimitState(result);
    };

    checkInitialRateLimit();

    // Set up countdown timer if locked out
    let interval: NodeJS.Timeout;
    if (!rateLimitState.isAllowed && rateLimitState.remainingTime > 0) {
      interval = setInterval(() => {
        const result = checkRateLimit('forgot-password');
        setRateLimitState(result);
        
        if (result.isAllowed) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitState.isAllowed, rateLimitState.remainingTime]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error and success message when user makes changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and success message
    setErrors({});
    setSuccessMessage('');

    // Check rate limiting first
    const rateLimitCheck = checkRateLimit('forgot-password');
    setRateLimitState(rateLimitCheck);
    
    if (!rateLimitCheck.isAllowed) {
      setErrors({ 
        general: `Too many password reset requests. Please wait ${formatRemainingTime(rateLimitCheck.remainingTime)} before trying again.` 
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get the current origin for the redirect URL
      const redirectTo = `${window.location.origin}/update-password`;

      // Call Supabase resetPasswordForEmail
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email.trim(),
        {
          redirectTo: redirectTo,
        }
      );

      if (error) {
        // Record failed attempt for rate limiting
        const newRateLimitState = recordFailedAttempt('forgot-password');
        setRateLimitState(newRateLimitState);

        // Handle Supabase auth errors
        console.error('Password reset error:', error);
        
        // Map common Supabase errors to user-friendly messages
        let errorMessage = error.message;
        
        if (error.message.includes('rate limit')) {
          errorMessage = 'Too many password reset requests. Please wait a moment before trying again.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('signup is disabled')) {
          errorMessage = 'Password reset is currently disabled. Please try again later.';
        }

        // Add rate limiting info if approaching limit
        if (newRateLimitState.currentAttempts >= newRateLimitState.maxAttempts - 2) {
          const remaining = newRateLimitState.maxAttempts - newRateLimitState.currentAttempts;
          errorMessage += ` (${remaining} request${remaining !== 1 ? 's' : ''} remaining before temporary lockout)`;
        }
        
        setErrors({ general: errorMessage });
        return;
      }

      // Record successful attempt (clears rate limiting)
      recordSuccessfulAttempt('forgot-password');

      // Success - always show the same message for security
      setSuccessMessage(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox and follow the instructions to reset your password.'
      );
      
      // Clear form data
      setFormData({ email: '' });

    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rate Limiting Warning */}
      {!rateLimitState.isAllowed && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span className="font-medium">Too many requests.</span><br />
            Please wait {formatRemainingTime(rateLimitState.remainingTime)} before requesting another password reset.
          </AlertDescription>
        </Alert>
      )}

      {/* Rate Limiting Info */}
      {rateLimitState.isAllowed && rateLimitState.currentAttempts > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {rateLimitState.maxAttempts - rateLimitState.currentAttempts} password reset request{rateLimitState.maxAttempts - rateLimitState.currentAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* General Error */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email Address</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          disabled={!rateLimitState.isAllowed}
          required
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !rateLimitState.isAllowed}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Back to Login
        </a>
      </div>
    </form>
  );
} 