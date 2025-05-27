import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  );
} 