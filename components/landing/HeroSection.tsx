'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Vibrant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/25 dark:from-primary/15 dark:via-secondary/10 dark:to-primary/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
      
      {/* Subtle Particle Effects with CSS animations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating elements for subtle animation */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i * 0.5)}s`,
            }}
          />
        ))}
        
        {/* Larger floating sparkles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-float-slow"
            style={{
              left: `${20 + (i * 20)}%`,
              top: `${30 + (i * 15)}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/40" />
          </div>
        ))}
      </div>

      {/* Hero Content with CSS animations */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fade-in-up">
        <div className="mb-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground dark:text-white">Find the Perfect Name,</span>{' '}
            <span className="block text-primary font-extrabold">Instantly.</span>
          </h1>
        </div>

        <div className="mb-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl sm:text-2xl text-foreground/80 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unleash your creativity with AI-powered name generation tools. 
            Whether you&apos;re building a brand, writing a story, or starting a project, 
            find the perfect name in seconds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
          <Button asChild size="lg" className="group shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/tools" className="flex items-center gap-2">
              Explore All Tools
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/signup" className="flex items-center gap-2">
              Start for Free
              <Sparkles className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div 
          className="mt-12 text-sm text-foreground/60 dark:text-muted-foreground/80 animate-slide-in-up"
          style={{ animationDelay: '0.7s' }}
        >
          <p>Join thousands of creators who trust our AI-powered tools</p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
} 