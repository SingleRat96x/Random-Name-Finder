'use client';

import Link from 'next/link';
import { PublishedToolMetadata } from '@/app/tools/actions';
import { ToolCard } from '@/components/tools/ToolCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedToolsSectionProps {
  tools: PublishedToolMetadata[];
}

export function FeaturedToolsSection({ tools }: FeaturedToolsSectionProps) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/10 dark:from-background/80 dark:to-background">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Featured Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular AI-powered name generation tools, 
            trusted by creators worldwide.
          </p>
        </div>

        {tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {tools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="h-full animate-slide-in-up hover:-translate-y-2 transition-transform duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>

            <div className="text-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" variant="outline" className="group shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/tools" className="flex items-center gap-2">
                  View All Tools
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 animate-slide-in-up">
            <p className="text-muted-foreground mb-6">
              Our featured tools are being prepared. Check back soon!
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                Explore Available Tools
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
} 