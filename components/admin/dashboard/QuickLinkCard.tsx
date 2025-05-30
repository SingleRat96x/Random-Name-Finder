import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, FileText, Bot } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'outline';
}

export function QuickLinkCard() {
  const quickActions: QuickAction[] = [
    {
      href: '/admin/tools/new',
      icon: <Plus className="h-6 w-6" />,
      label: 'Add New Tool',
      variant: 'default'
    },
    {
      href: '/admin/tools',
      icon: <Settings className="h-6 w-6" />,
      label: 'Manage Tools',
      variant: 'outline'
    },
    {
      href: '/admin/content',
      icon: <FileText className="h-6 w-6" />,
      label: 'Manage Pages',
      variant: 'outline'
    },
    {
      href: '/admin/ai-models',
      icon: <Bot className="h-6 w-6" />,
      label: 'Manage AI Models',
      variant: 'outline'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button 
              key={action.href}
              asChild 
              variant={action.variant}
              className="h-auto py-4 flex-col items-center space-y-2"
            >
              <Link href={action.href}>
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 