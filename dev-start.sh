#!/bin/bash

# Script đơn giản để test ứng dụng mà không cần Docker
echo "🚀 Starting TazaGroup in Development Mode"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "app/layout.tsx" ]; then
    echo "❌ Please run this script from the TazaGroup root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🚀 Starting development server on port 3900..."
npm run dev

echo "🌐 Application should be available at http://localhost:3900"
