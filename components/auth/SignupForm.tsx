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
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupForm() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
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
      const result = checkRateLimit('signup');
      setRateLimitState(result);
    };

    checkInitialRateLimit();

    // Set up countdown timer if locked out
    let interval: NodeJS.Timeout;
    if (!rateLimitState.isAllowed && rateLimitState.remainingTime > 0) {
      interval = setInterval(() => {
        const result = checkRateLimit('signup');
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

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setErrors({});
    setSuccessMessage('');

    // Check rate limiting first
    const rateLimitCheck = checkRateLimit('signup');
    setRateLimitState(rateLimitCheck);
    
    if (!rateLimitCheck.isAllowed) {
      setErrors({ 
        general: `Too many failed signup attempts. Please wait ${formatRemainingTime(rateLimitCheck.remainingTime)} before trying again.` 
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase signUp
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          // We can add metadata here if needed in the future
          // For now, let the backend function derive username from email
          data: {}
        }
      });

      if (error) {
        // Record failed attempt for rate limiting
        const newRateLimitState = recordFailedAttempt('signup');
        setRateLimitState(newRateLimitState);

        // Handle Supabase auth errors
        console.error('Signup error:', error);
        
        // Map common Supabase errors to user-friendly messages
        let errorMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try logging in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.';
        } else if (error.message.includes('signup is disabled')) {
          errorMessage = 'Account creation is currently disabled. Please try again later.';
        }

        // Add rate limiting info if approaching limit
        if (newRateLimitState.currentAttempts >= newRateLimitState.maxAttempts - 2) {
          const remaining = newRateLimitState.maxAttempts - newRateLimitState.currentAttempts;
          errorMessage += ` (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before temporary lockout)`;
        }
        
        setErrors({ general: errorMessage });
        return;
      }

      // Check if user was created successfully
      if (data.user) {
        // Record successful attempt (clears rate limiting)
        recordSuccessfulAttempt('signup');

        // Check if user needs email confirmation
        if (data.user.identities && data.user.identities.length === 0) {
          // This might indicate the user already exists but is unconfirmed
          setErrors({ 
            general: 'User may already exist or an issue occurred. Try logging in or resetting your password if you already have an account.' 
          });
          return;
        }

        // Check if email confirmation is required (session will be null)
        if (!data.session) {
          // Email confirmation is enabled - show success message
          setSuccessMessage(
            'Account created successfully! Please check your email to verify your account before signing in.'
          );
          
          // Clear form on successful signup
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
          });
        } else {
          // Auto-confirmed or email confirmation disabled
          setSuccessMessage(
            'Account created successfully! You are now logged in.'
          );
          
          // Clear form
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
          });
          
          // Note: In a real app, you might want to redirect here
          // For now, we'll just show the success message
        }
      } else {
        // Unexpected case - no user and no error
        setErrors({ 
          general: 'An unexpected error occurred. Please try again.' 
        });
      }

    } catch (err) {
      console.error('Unexpected error during signup:', err);
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
            <span className="font-medium">Account temporarily locked.</span><br />
            Too many failed signup attempts. Please wait {formatRemainingTime(rateLimitState.remainingTime)} before trying again.
          </AlertDescription>
        </Alert>
      )}

      {/* Rate Limiting Info */}
      {rateLimitState.isAllowed && rateLimitState.currentAttempts > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {rateLimitState.maxAttempts - rateLimitState.currentAttempts} failed signup attempt{rateLimitState.maxAttempts - rateLimitState.currentAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
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
        <Label htmlFor="signup-email">Email Address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
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

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password (min. 6 characters)"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
          disabled={!rateLimitState.isAllowed}
          required
        />
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <Input
          id="signup-confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
          disabled={!rateLimitState.isAllowed}
          required
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword}
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
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
} 