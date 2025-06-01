'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PublishedToolMetadata } from '@/app/tools/actions';
import { ToolCard } from '@/components/tools/ToolCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeaturedToolsSectionProps {
  tools: PublishedToolMetadata[];
}

export function FeaturedToolsSection({ tools }: FeaturedToolsSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/10 dark:from-background/80 dark:to-background">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Featured Tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular AI-powered name generation tools, 
            trusted by creators worldwide.
          </p>
        </motion.div>

        {tools.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {tools.map((tool) => (
                <motion.div
                  key={tool.id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  className="h-full"
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={titleVariants}
              className="text-center"
            >
              <Button asChild size="lg" variant="outline" className="group shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/tools" className="flex items-center gap-2">
                  View All Tools
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={titleVariants}
            className="text-center py-12"
          >
            <p className="text-muted-foreground mb-6">
              Our featured tools are being prepared. Check back soon!
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                Explore Available Tools
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
} 