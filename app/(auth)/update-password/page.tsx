import { Metadata } from 'next';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';

export const metadata: Metadata = {
  title: 'Update Password - Random Name Finder',
  description: 'Set a new password for your Random Name Finder account.',
};

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Update Your Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {/* Update Password Form */}
        <UpdatePasswordForm />
      </div>
    </div>
  );
} 