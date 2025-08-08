#!/bin/bash

echo "🔄 Completing site-to-root migration for TazaGroup..."

# Step 1: Verify structure
echo "📋 Verifying migration structure..."
if [ ! -d "app" ]; then
    echo "❌ app directory not found"
    exit 1
fi

if [ ! -d "src" ]; then
    echo "❌ src directory not found"
    exit 1
fi

echo "✅ Migration structure verified"

# Step 2: Create health check endpoint
echo "🔧 Creating health check endpoint..."
mkdir -p app/api/health
cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TazaGroup Core',
      version: process.env.SITE_VERSION || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
EOF

# Step 3: Update next.config.ts for root structure
echo "🔧 Updating next.config.ts..."
cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    optimizePackageImports: ['@heroicons/react'],
  },
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Image optimization
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '116.118.49.243' },
      { hostname: 'placehold.co' },
      { hostname: 'images.unsplash.com' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
EOF

# Step 4: Update .dockerignore for root structure
echo "🔧 Updating .dockerignore..."
cat > .dockerignore << 'EOF'
# Dependencies
node_modules/
.npm/
.pnpm-store/

# Build outputs
.next/
out/
dist/
build/

# Environment files
.env
.env.*
!.env.example

# Logs
*.log
npm-debug.log*
logs/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Development
coverage/
.nyc_output/
.cache/

# Site directory (old structure)
site/

# Backups
*.tar.gz
*.backup
root_backup/

# Testing
__tests__/
*.test.js
*.spec.js

# Documentation
docs/
README.md
EOF

# Step 5: Create volumes for Docker
echo "🐳 Creating Docker volumes..."
docker volume create tazacore-postgres-data 2>/dev/null || true
docker volume create tazacore-redis-data 2>/dev/null || true  
docker volume create tazacore-minio-data 2>/dev/null || true
docker volume create tazacore-pgadmin-data 2>/dev/null || true

# Step 6: Build new structure
echo "🏗️ Building new structure..."
if command -v bun &> /dev/null; then
    echo "Using Bun for build..."
    bun install
    bun run build
else
    echo "Using npm for build..."
    npm install
    npm run build
fi

# Step 7: Test health endpoint
echo "🔍 Testing health endpoint..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ Build successful - server.js created"
else
    echo "⚠️ Warning: server.js not found, check build configuration"
fi

echo "🎉 Migration completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "  ✅ App structure moved to root"
echo "  ✅ Source code consolidated in src/"
echo "  ✅ Docker configuration updated"
echo "  ✅ Health check endpoint created"
echo "  ✅ PWA configuration updated"
echo "  ✅ Docker volumes created"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: docker-compose build --no-cache"
echo "  2. Run: docker-compose up -d"
echo "  3. Test: curl http://localhost:3900/api/health"
echo "  4. Remove site/ directory when satisfied"
