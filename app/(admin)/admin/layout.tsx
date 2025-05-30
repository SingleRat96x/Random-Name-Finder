'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { MobileAdminHeader } from '@/components/admin/MobileAdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 