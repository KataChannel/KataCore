#!/bin/bash

# ============================================================================
# QUICK SEED SCRIPT - TAZAGROUP
# ============================================================================

echo "🌱 TazaGroup Quick Seed Starting..."

# Generate Prisma client first
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run the comprehensive seed
echo "🌱 Running comprehensive seed..."
npx ts-node --transpile-only prisma/seed/master-seed-comprehensive.ts

echo ""
echo "✅ Seed completed!"
echo "🔑 Super Admin: it@tazagroup.vn / TazaGroup@2024!"
