'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Library, 
  Settings, 
  Heart, 
  Zap, 
  Shield 
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI-Powered Creativity",
    description: "Harness the power of advanced AI models to generate unique, creative names tailored to your specific needs and preferences."
  },
  {
    icon: Library,
    title: "Vast Tool Library",
    description: "Access dozens of specialized name generation tools for businesses, characters, brands, products, and more creative projects."
  },
  {
    icon: Settings,
    title: "Customizable Results",
    description: "Fine-tune generation parameters, themes, and styles to get exactly the kind of names that match your vision."
  },
  {
    icon: Heart,
    title: "Save Your Favorites",
    description: "Keep track of names you love with our favorites system. Organize, search, and export your saved names anytime."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate hundreds of name ideas in seconds. No waiting, no delays - just instant creative inspiration when you need it."
  },
  {
    icon: Shield,
    title: "Privacy Focused",
    description: "Your creative projects stay private. We don't store your generation history or share your ideas with anyone."
  }
];

export function PlatformFeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const featureVariants = {
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
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-muted/30 dark:from-background/50 dark:to-muted/20">
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
            Powerful Features for{' '}
            <span className="text-primary">Every Creator</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you&apos;re a entrepreneur, writer, developer, or creative professional, 
            our platform provides everything you need to find the perfect name.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                variants={featureVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="h-full"
              >
                <Card className="h-full border-border/50 hover:border-border hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors mr-4">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed flex-1">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
} 