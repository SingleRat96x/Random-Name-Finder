import type { NextConfig } from "next";

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  
  // Modern JavaScript output
  transpilePackages: [], // Only transpile packages that need it
  
  // Experimental features for better performance
  experimental: {
    // Reduce JavaScript bundle size
    esmExternals: true,
  },

  // Bundle splitting and optimization
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Split vendor libraries into smaller chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Supabase chunk
          supabase: {
            name: 'supabase',
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // UI libraries chunk (Radix, Lucide)
          ui: {
            name: 'ui-libs',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Form libraries chunk
          forms: {
            name: 'form-libs',
            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Utilities chunk
          utils: {
            name: 'utils',
            test: /[\\/]node_modules[\\/](clsx|tailwind-merge|class-variance-authority)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
          },
          // Common chunk for everything else
          lib: {
            name: 'lib',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
    // Optimize images
    minimumCacheTTL: 31536000, // 1 year
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
