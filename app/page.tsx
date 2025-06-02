import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { fetchFeaturedTools } from '@/app/tools/actions';
import { HeroSection } from '@/components/landing/HeroSection';

// Dynamically import non-critical components for better performance
const FeaturedToolsSection = dynamic(
  () => import('@/components/landing/FeaturedToolsSection').then(mod => ({ default: mod.FeaturedToolsSection })),
  {
    loading: () => (
      <div className="py-20 animate-pulse">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-muted rounded mb-4 max-w-md mx-auto"></div>
          <div className="h-4 bg-muted rounded mb-8 max-w-lg mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const PlatformFeaturesSection = dynamic(
  () => import('@/components/landing/PlatformFeaturesSection').then(mod => ({ default: mod.PlatformFeaturesSection })),
  {
    loading: () => (
      <div className="py-20 animate-pulse">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

const CallToActionSection = dynamic(
  () => import('@/components/landing/CallToActionSection').then(mod => ({ default: mod.CallToActionSection })),
  {
    loading: () => (
      <div className="py-20 animate-pulse">
        <div className="container mx-auto px-4">
          <div className="h-12 bg-muted rounded mb-4 max-w-2xl mx-auto"></div>
          <div className="h-4 bg-muted rounded mb-8 max-w-lg mx-auto"></div>
          <div className="flex justify-center">
            <div className="h-12 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Random Name Finder | AI-Powered Name Generation Tools',
  description: 'Find the perfect name instantly with our AI-powered name generation tools. Create unique names for businesses, characters, brands, and more. Start free today!',
  keywords: 'name generator, AI names, business names, character names, brand names, creative tools, random names, name finder',
  alternates: {
    canonical: 'https://randomnamefinder.com'
  },
  openGraph: {
    title: 'Random Name Finder | AI-Powered Name Generation Tools',
    description: 'Find the perfect name instantly with our AI-powered name generation tools. Create unique names for businesses, characters, brands, and more.',
    type: 'website',
    url: 'https://randomnamefinder.com',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Random Name Finder - AI-powered name generation platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Random Name Finder | AI-Powered Name Generation',
    description: 'Find the perfect name instantly with AI. Free tools for businesses, characters, brands & more.',
    images: ['/og-default.png'],
  },
};

export default async function HomePage() {
  // Fetch featured tools server-side
  const featuredTools = await fetchFeaturedTools(3);

  return (
    <main className="min-h-screen">
      {/* Hero Section - Critical for LCP, render immediately */}
      <HeroSection />
      
      {/* Below-the-fold sections - Load dynamically */}
      <FeaturedToolsSection tools={featuredTools} />
      <PlatformFeaturesSection />
      <CallToActionSection />
    </main>
  );
}
