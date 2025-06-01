import { Metadata } from 'next';
import { fetchFeaturedTools } from '@/app/tools/actions';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedToolsSection } from '@/components/landing/FeaturedToolsSection';
import { PlatformFeaturesSection } from '@/components/landing/PlatformFeaturesSection';
import { CallToActionSection } from '@/components/landing/CallToActionSection';

export const metadata: Metadata = {
  title: 'Random Name Finder | AI-Powered Name Generation Tools',
  description: 'Find the perfect name instantly with our AI-powered name generation tools. Create unique names for businesses, characters, brands, and more. Start free today!',
  keywords: 'name generator, AI names, business names, character names, brand names, creative tools',
  openGraph: {
    title: 'Random Name Finder | AI-Powered Name Generation Tools',
    description: 'Find the perfect name instantly with our AI-powered name generation tools. Create unique names for businesses, characters, brands, and more.',
    type: 'website',
  },
};

export default async function HomePage() {
  // Fetch featured tools server-side
  const featuredTools = await fetchFeaturedTools(3);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Tools Section */}
      <FeaturedToolsSection tools={featuredTools} />
      
      {/* Platform Features Section */}
      <PlatformFeaturesSection />
      
      {/* Call to Action Section */}
      <CallToActionSection />
    </main>
  );
}
