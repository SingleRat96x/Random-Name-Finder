'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function UpdatePasswordForm() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Next.js router for redirection
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  // Listen for PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in UpdatePasswordForm:', event);
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery session detected');
          setCanUpdatePassword(true);
        } else if (event === 'SIGNED_IN' && session) {
          // User might already be in a recovery session
          console.log('User signed in, checking if recovery session');
          setCanUpdatePassword(true);
        }
      }
    );

    // Check if user is already in a recovery session
    const checkRecoverySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Existing session found, enabling password update');
          setCanUpdatePassword(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkRecoverySession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

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

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
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

    // Clear previous errors and success message
    setErrors({});
    setSuccessMessage('');

    // Check if user can update password
    if (!canUpdatePassword) {
      setErrors({ 
        general: 'Invalid or expired password reset link. Please request a new password reset.' 
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase updateUser to change password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        // Handle Supabase auth errors
        console.error('Password update error:', error);
        
        // Map common Supabase errors to user-friendly messages
        let errorMessage = error.message;
        
        if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('session_not_found')) {
          errorMessage = 'Your password reset session has expired. Please request a new password reset.';
        } else if (error.message.includes('same_password')) {
          errorMessage = 'New password must be different from your current password.';
        }
        
        setErrors({ general: errorMessage });
        return;
      }

      // Success
      setSuccessMessage('Password updated successfully! You can now log in with your new password.');
      
      // Clear form data
      setFormData({
        password: '',
        confirmPassword: '',
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('Unexpected error during password update:', err);
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user cannot update password, show error message
  if (!canUpdatePassword) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid or expired password reset link. Please{' '}
            <a 
              href="/forgot-password" 
              className="font-medium underline hover:no-underline"
            >
              request a new password reset
            </a>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your new password"
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your new password"
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Message */}
        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </Button>

        {/* Password Requirements */}
        <div className="text-xs text-muted-foreground">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>At least 8 characters long</li>
            <li>Must be different from your current password</li>
          </ul>
        </div>
      </form>
    </div>
  );
} 