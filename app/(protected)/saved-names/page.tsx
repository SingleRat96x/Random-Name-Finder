import { Metadata } from 'next';
import { SavedNamesBrowser } from '@/components/user/SavedNamesBrowser';

export const metadata: Metadata = {
  title: 'My Saved Names | Random Name Finder',
  description: 'View and manage your saved names from various name generation tools.',
};

export default function SavedNamesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Saved Names</h1>
          <p className="text-muted-foreground">
            View, search, and manage all your favorited names from various name generation tools.
          </p>
        </div>
        
        <SavedNamesBrowser />
      </div>
    </div>
  );
} 