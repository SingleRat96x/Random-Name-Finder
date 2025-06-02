'use client';

import { Sparkles, Zap, Heart, Users, Lock, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Advanced AI algorithms create unique, contextually relevant names for any purpose.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate dozens of creative names in seconds, not hours of brainstorming.',
  },
  {
    icon: Heart,
    title: 'Save Favorites',
    description: 'Keep track of your favorite names and organize them for easy access.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join thousands of creators who trust our platform for their naming needs.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security and privacy measures.',
  },
  {
    icon: Rocket,
    title: 'Always Improving',
    description: 'Regular updates and new tools to keep you ahead of the creative curve.',
  },
];

export function PlatformFeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/10 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of creative naming with our comprehensive suite of 
            AI-powered tools designed for modern creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
} 