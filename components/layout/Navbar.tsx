'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserNavDropdown } from './UserNavDropdown';
import { MobileUserSheetMenu } from './MobileUserSheetMenu';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, profile, loading } = useAuth();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Generate user initials for mobile avatar
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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm border-b border-border transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>Random Name Finder</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tools
              </Link>
              <Link
                href="/about"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
            
            {/* Authentication Section */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              {loading ? (
                // Loading state
                <div className="flex items-center px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : user ? (
                // Authenticated state - User Avatar Dropdown
                <UserNavDropdown />
              ) : (
                // Unauthenticated state
                <>
                  <Link
                    href="/login"
                    className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            {!user && <ThemeToggle />}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {!user && <ThemeToggle />}
            
            {loading ? (
              // Loading state
              <div className="flex items-center justify-center p-2 w-10 h-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : user ? (
              // Authenticated state - User Avatar Trigger for Mobile Sheet
              <button
                onClick={() => setIsMobileUserMenuOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                aria-label="Open user menu"
              >
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="User avatar" 
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </button>
            ) : (
              // Unauthenticated state - Hamburger Menu
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu - Only for Unauthenticated Users */}
        {!user && (
          <div 
            id="mobile-menu"
            className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border bg-background">
              <Link
                href="/"
                className="text-foreground hover:text-primary hover:bg-muted block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground hover:text-primary hover:bg-muted block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenu}
              >
                Tools
              </Link>
              <Link
                href="/about"
                className="text-foreground hover:text-primary hover:bg-muted block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-primary hover:bg-muted block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenu}
              >
                Contact
              </Link>
              
              {/* Mobile Authentication Section for Unauthenticated */}
              <div className="border-t border-border pt-2 mt-2">
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary hover:bg-muted block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 block px-3 py-2 rounded-md text-base font-medium transition-colors mt-1"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile User Sheet Menu for Authenticated Users */}
      {user && (
        <MobileUserSheetMenu 
          open={isMobileUserMenuOpen} 
          onOpenChange={setIsMobileUserMenuOpen} 
        />
      )}
    </header>
  );
} 