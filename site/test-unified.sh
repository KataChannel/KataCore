#!/bin/bash
# Quick test script for unified system

echo "🧪 TazaCore Unified System Tests"
echo "================================="

echo "📝 TypeScript Check:"
npm run type-check

echo ""
echo "🧹 Linting Check:"
npm run lint

echo ""
echo "🏗️  Build Check:"
npm run build

echo ""
echo "✅ All tests completed!"
