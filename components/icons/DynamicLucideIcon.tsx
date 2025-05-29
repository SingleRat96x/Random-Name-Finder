'use client';

import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicLucideIconProps extends LucideProps {
  iconName: string | null;
}

export function DynamicLucideIcon({ iconName, className, ...props }: DynamicLucideIconProps) {
  // Function to get the Lucide icon dynamically
  const getIcon = (name: string | null) => {
    if (!name) return LucideIcons.Wand2;
    
    // Convert icon name to PascalCase for Lucide icon lookup
    const pascalCaseIconName = name
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    
    // Try to get the icon from Lucide, fallback to Wand2 if not found
    const IconComponent = ((LucideIcons as unknown) as Record<string, React.ComponentType<LucideProps>>)[pascalCaseIconName] || LucideIcons.Wand2;
    return IconComponent;
  };

  const IconComponent = getIcon(iconName);
  
  return <IconComponent className={className} {...props} />;
} 