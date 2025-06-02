'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
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
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limiting state
  const [rateLimitState, setRateLimitState] = useState<RateLimitResult>({
    isAllowed: true,
    remainingTime: 0,
    maxAttempts: 5,
    currentAttempts: 0,
  });

  // Next.js router for redirection
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check rate limit on component mount and set up timer for lockout countdown
  useEffect(() => {
    const checkInitialRateLimit = () => {
      const result = checkRateLimit('login');
      setRateLimitState(result);
    };

    checkInitialRateLimit();

    // Set up countdown timer if locked out
    let interval: NodeJS.Timeout;
    if (!rateLimitState.isAllowed && rateLimitState.remainingTime > 0) {
      interval = setInterval(() => {
        const result = checkRateLimit('login');
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
    
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Check rate limiting first
    const rateLimitCheck = checkRateLimit('login');
    setRateLimitState(rateLimitCheck);
    
    if (!rateLimitCheck.isAllowed) {
      setErrors({ 
        general: `Too many failed login attempts. Please wait ${formatRemainingTime(rateLimitCheck.remainingTime)} before trying again.` 
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        // Record failed attempt for rate limiting
        const newRateLimitState = recordFailedAttempt('login');
        setRateLimitState(newRateLimitState);

        // Handle Supabase auth errors
        console.error('Login error:', error);
        
        // Map common Supabase errors to user-friendly messages
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in. Check your inbox for a confirmation email.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message.includes('signup is disabled')) {
          errorMessage = 'Login is currently disabled. Please try again later.';
        }

        // Add rate limiting info if approaching limit
        if (newRateLimitState.currentAttempts >= newRateLimitState.maxAttempts - 2) {
          const remaining = newRateLimitState.maxAttempts - newRateLimitState.currentAttempts;
          errorMessage += ` (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before temporary lockout)`;
        }
        
        setErrors({ general: errorMessage });
        return;
      }

      // Check if login was successful
      if (data.session && data.user) {
        console.log('Login successful:', data.user.id);
        
        // Record successful attempt (clears rate limiting)
        recordSuccessfulAttempt('login');
        
        // Clear form data
        setFormData({
          email: '',
          password: '',
        });

        // Redirect to dashboard
        router.push('/dashboard');
        
        // Optionally refresh to ensure server components re-render with new auth state
        router.refresh();
      } else {
        // Unexpected case - no session/user but no error
        setErrors({ 
          general: 'Login failed. Please try again.' 
        });
      }

    } catch (err) {
      console.error('Unexpected error during login:', err);
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
            Too many failed login attempts. Please wait {formatRemainingTime(rateLimitState.remainingTime)} before trying again.
          </AlertDescription>
        </Alert>
      )}

      {/* Rate Limiting Info */}
      {rateLimitState.isAllowed && rateLimitState.currentAttempts > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {rateLimitState.maxAttempts - rateLimitState.currentAttempts} failed login attempt{rateLimitState.maxAttempts - rateLimitState.currentAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
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
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
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

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !rateLimitState.isAllowed}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Forgot Password Link */}
      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
} 