#!/bin/bash

# Kill any running Next.js processes
echo "🔄 Stopping existing Next.js processes..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Wait a moment
sleep 2

# Start dev server with polling
echo "🚀 Starting development server with file polling..."
WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true npm run dev
