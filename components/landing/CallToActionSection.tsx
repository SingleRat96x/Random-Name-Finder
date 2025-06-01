'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export function CallToActionSection() {
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

  const floatingVariants = {
    float: {
      y: [-15, 15, -15],
      rotate: [0, 10, 0, -10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-primary/8 via-secondary/5 to-primary/12 dark:from-primary/5 dark:via-secondary/3 dark:to-primary/8">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-border"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + (i * 15)}%`,
              top: `${20 + (i * 12)}%`,
            }}
            variants={floatingVariants}
            animate="float"
            transition={{
              delay: i * 1.5,
              duration: 6 + (i * 0.8),
              repeat: Infinity,
            }}
          >
            {i % 2 === 0 ? (
              <Star className="w-3 h-3 text-primary/30" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary/20" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Ready to Name Your{' '}
              <span className="text-primary">Next Big Thing?</span>
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators who&apos;ve found their perfect names. 
              Start generating unique, AI-powered names in seconds – completely free.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="group shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90">
                <Link href="/signup" className="flex items-center gap-2">
                  Start Creating for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/tools" className="flex items-center gap-2">
                  Explore Tools First
                  <Sparkles className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Unlimited generations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Save your favorites</span>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground/80">
                Trusted by 10,000+ creators worldwide
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
} 