import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 