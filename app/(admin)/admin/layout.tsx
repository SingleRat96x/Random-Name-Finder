'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { MobileAdminHeader } from '@/components/admin/MobileAdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [];

    // Add home/admin as root
    breadcrumbs.push({
      label: 'Admin',
      href: '/admin',
      current: pathSegments.length === 1
    });

    // Build breadcrumbs from path segments
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const href = '/' + pathSegments.slice(0, i + 1).join('/');
      const isLast = i === pathSegments.length - 1;
      
      // Format segment for display
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href,
        current: isLast
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Mobile Header */}
      <MobileAdminHeader onMenuToggle={toggleMobileSidebar} />
      
      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar - Always visible on lg+ screens */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        
        {/* Mobile Sidebar - Slide-out overlay on mobile */}
        <div className="lg:hidden">
          <AdminSidebar 
            isOpen={isMobileSidebarOpen} 
            onClose={closeMobileSidebar} 
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li>
                  <Link 
                    href="/"
                    className="flex items-center hover:text-foreground transition-colors"
                    aria-label="Go to homepage"
                  >
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Home</span>
                  </Link>
                </li>
                {breadcrumbs.map((breadcrumb) => (
                  <li key={breadcrumb.href} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
                    {breadcrumb.current ? (
                      <span 
                        aria-current="page"
                        className="font-medium text-foreground"
                      >
                        {breadcrumb.label}
                      </span>
                    ) : (
                      <Link 
                        href={breadcrumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {breadcrumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 