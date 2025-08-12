import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output configuration for Docker
  output: 'standalone',
  
  // Next.js 15 optimizations
  serverExternalPackages: [
    'prisma',
    '@prisma/client',
    'bcryptjs',
    'sharp'
  ],
  
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      'lucide-react',
      'framer-motion'
    ],
    optimizeCss: true,
    scrollRestoration: true
  },

  // Build optimization
  compress: true,
  poweredByHeader: false,
  
  // File watcher configuration to fix EINVAL errors
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**'
        ]
      };
    }
    return config;
  },
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: true
  },
  
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'lib', 'hooks', 'components']
  },

  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '*.vercel.app' }
    ]
  }
};

export default nextConfig;
