import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false
  },
  
  eslint: {
    ignoreDuringBuilds: false,
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
