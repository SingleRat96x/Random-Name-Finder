'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

  // Initialize Supabase client
  const supabase = createClient();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        
        setErrors({ general: errorMessage });
        return;
      }

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
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
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
              Sending Reset Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </div>
  );
} 