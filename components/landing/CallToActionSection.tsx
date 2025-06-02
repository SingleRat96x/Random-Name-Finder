'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CallToActionSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="animate-slide-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Name?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who have discovered their perfect names with our AI-powered tools. 
            Start your creative journey today!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <Button asChild size="lg" className="group shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/tools" className="flex items-center gap-2">
              Start Creating Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/signup" className="flex items-center gap-2">
              Sign Up Free
              <Sparkles className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <p>No credit card required • Free forever plan available • Join 10,000+ creators</p>
        </div>
      </div>
    </section>
  );
} 