import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password - Random Name Finder',
  description: 'Reset your Random Name Finder account password by entering your email address.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <ForgotPasswordForm />

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <a
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 