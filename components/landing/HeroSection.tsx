'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HeroSection() {
  // Animation variants
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

  const itemVariants = {
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

  const floatingElementVariants = {
    float: {
      y: [-10, 10, -10],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Vibrant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/25 dark:from-primary/15 dark:via-secondary/10 dark:to-primary/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/40" />
      
      {/* Subtle Particle Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating elements for subtle animation */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
            }}
            variants={floatingElementVariants}
            animate="float"
            transition={{
              delay: i * 0.5,
              duration: 4 + (i * 0.5),
              repeat: Infinity,
            }}
          />
        ))}
        
        {/* Larger floating sparkles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${20 + (i * 20)}%`,
              top: `${30 + (i * 15)}%`,
            }}
            variants={floatingElementVariants}
            animate="float"
            transition={{
              delay: i * 1.2,
              duration: 8,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary/40" />
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <motion.h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground dark:text-white">Find the Perfect Name,</span>{' '}
            <span className="block text-primary font-extrabold">Instantly.</span>
          </motion.h1>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-xl sm:text-2xl text-foreground/80 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unleash your creativity with AI-powered name generation tools. 
            Whether you&apos;re building a brand, writing a story, or starting a project, 
            find the perfect name in seconds.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="mt-12 text-sm text-foreground/60 dark:text-muted-foreground/80"
        >
          <p>Join thousands of creators who trust our AI-powered tools</p>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
} 