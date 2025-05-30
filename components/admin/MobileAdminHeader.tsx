'use client';

import { Button } from '@/components/ui/button';
import { Menu, Shield } from 'lucide-react';

interface MobileAdminHeaderProps {
  onMenuToggle: () => void;
}

export function MobileAdminHeader({ onMenuToggle }: MobileAdminHeaderProps) {
  return (
    <div className="lg:hidden bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuToggle}
        className="p-2"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
} 