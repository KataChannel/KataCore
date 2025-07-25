#!/bin/bash

# Optimized build script for local testing
set -e

echo "🏗️ Building TazaCore optimized..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf site/.next
rm -rf site/node_modules/.cache

# Build with optimizations
cd site

echo "📦 Installing dependencies..."
bun install --frozen-lockfile

echo "🗃️ Generating Prisma client..."
bunx prisma generate

echo "🔨 Building Next.js application..."
NODE_OPTIONS="--max-old-space-size=4096" \
NEXT_TELEMETRY_DISABLED=1 \
DOCKER_BUILD=true \
bun run build:optimized

echo "✅ Build completed successfully!"

# Optional: Test the build
if [ "$1" = "--test" ]; then
    echo "🧪 Testing build..."
    NODE_OPTIONS="--max-old-space-size=2048" \
    NEXT_TELEMETRY_DISABLED=1 \
    timeout 30s bun run start || true
fi

echo "🎉 All done! Ready for deployment."
