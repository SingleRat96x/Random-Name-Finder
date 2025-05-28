'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText,
  Shield,
  Wrench
} from 'lucide-react';

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
  },
  {
    name: 'Tools',
    href: '/admin/tools',
    icon: Wrench,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background border-r border-border flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
        
        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 