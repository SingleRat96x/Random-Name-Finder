import { Metadata } from 'next';
import { ToolBrowser } from '@/components/tools/ToolBrowser';

export const metadata: Metadata = {
  title: 'Name Generator Tools - Find Your Perfect Name | Random Name Finder',
  description: 'Discover AI-powered name generators for every need. From fantasy characters and sci-fi worlds to business names and pet names, find the perfect tool to spark your creativity.',
  keywords: 'name generator, AI names, fantasy names, character names, business names, pet names, random names, generator tools',
  alternates: {
    canonical: 'https://randomnamefinder.com/tools'
  },
  openGraph: {
    title: 'Name Generator Tools - Find Your Perfect Name',
    description: 'Discover AI-powered name generators for every need. From fantasy to business names, find your perfect tool.',
    type: 'website',
    url: 'https://randomnamefinder.com/tools',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Random Name Finder Tools - AI-powered name generators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Name Generator Tools - Find Your Perfect Name',
    description: 'Discover AI-powered name generators for every need. From fantasy to business names.',
    images: ['/og-default.png'],
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ToolBrowser />
    </div>
  );
} 