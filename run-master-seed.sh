#!/bin/bash

# ============================================================================
# TAZAGROUP MASTER SEED SCRIPT
# ============================================================================
# Script chạy seed data tổng hợp cho TazaGroup
# Tự động tạo Super Admin: it@tazagroup.vn

set -e

echo "🌱 TazaGroup Master Seed Starting..."
echo "============================================"

# Change to site directory
cd "$(dirname "$0")/site"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with DATABASE_URL"
    exit 1
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env file!"
    exit 1
fi

echo "📊 Database URL: ${DATABASE_URL:0:20}..."

# Run Prisma migration to ensure database schema is up to date
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run the comprehensive seed
echo "🌱 Running comprehensive seed data..."
npx ts-node --transpile-only prisma/seed/master-seed-comprehensive.ts

echo ""
echo "✅ TazaGroup Master Seed Completed Successfully!"
echo "============================================"
echo "🔑 Super Admin Login:"
echo "   Email: it@tazagroup.vn"
echo "   Password: TazaGroup@2024!"
echo ""
echo "🏢 System is ready for TazaGroup!"
echo "============================================"
