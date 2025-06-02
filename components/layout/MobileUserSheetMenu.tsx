'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Heart, 
  UserCircle, 
  ShieldCheck, 
  Wrench,
  Info,
  Mail,
  Home,
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface MobileUserSheetMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileUserSheetMenu({ open, onOpenChange }: MobileUserSheetMenuProps) {
  const { user, profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onOpenChange(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  // Generate user initials
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (user?.email) {
      const emailParts = user.email.split('@')[0];
      return emailParts.charAt(0).toUpperCase() + (emailParts.charAt(1) || '').toUpperCase();
    }
    return 'U';
  };

  const userInitials = getUserInitials();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-medium text-lg">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="User avatar" 
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left text-base">
                {profile?.full_name || 'User'}
              </SheetTitle>
              <SheetDescription className="text-left text-sm">
                {user?.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Navigation Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1 p-6 space-y-1">
            {/* User-specific Links */}
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                href="/saved-names"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Heart className="h-4 w-4" />
                <span className="font-medium">My Saved Names</span>
              </Link>
              
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <UserCircle className="h-4 w-4" />
                <span className="font-medium">Profile</span>
              </Link>
              
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}
            </div>

            <Separator className="my-4" />

            {/* Main Site Links */}
            <div className="space-y-1">
              <Link
                href="/tools"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Wrench className="h-4 w-4" />
                <span className="font-medium">Tools</span>
              </Link>
              
              <Link
                href="/about"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Info className="h-4 w-4" />
                <span className="font-medium">About Us</span>
              </Link>
              
              <Link
                href="/contact"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Mail className="h-4 w-4" />
                <span className="font-medium">Contact Us</span>
              </Link>
              
              <Link
                href="/"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </Link>
            </div>

            <Separator className="my-4" />

            {/* Theme Selection */}
            {mounted && (
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-foreground">
                  Theme
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    onClick={() => handleThemeChange('light')}
                    className={`w-full justify-start space-x-3 font-normal ${theme === 'light' ? 'bg-muted' : ''}`}
                  >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => handleThemeChange('dark')}
                    className={`w-full justify-start space-x-3 font-normal ${theme === 'dark' ? 'bg-muted' : ''}`}
                  >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => handleThemeChange('system')}
                    className={`w-full justify-start space-x-3 font-normal ${theme === 'system' ? 'bg-muted' : ''}`}
                  >
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Logout */}
          <div className="p-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start space-x-3 text-red-600 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-400 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 