import type { Metadata } from 'next';
import { ContactSubmissionsManager } from '@/components/admin/contact/ContactSubmissionsManager';

export const metadata: Metadata = {
  title: 'Contact Form Submissions | Admin Dashboard',
  description: 'View and manage contact form submissions from website visitors.',
};

export default function ContactSubmissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contact Form Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage contact form submissions from website visitors.
        </p>
      </div>

      <ContactSubmissionsManager />
    </div>
  );
} 