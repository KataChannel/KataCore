#!/bin/bash

# ============================================================================
# TAZAGROUP UNIFIED SEED RUNNER
# ============================================================================
# Script để chạy unified comprehensive seed data
# Version: 1.0

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Change to site directory
cd "$(dirname "$0")"
if [ -d "site" ]; then
    cd site
fi

log "🌱 Starting TazaGroup Unified Comprehensive Seed"

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    error "DATABASE_URL environment variable is not set"
    info "Please set DATABASE_URL in your .env file"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    warning "node_modules not found, installing dependencies..."
    if command -v bun >/dev/null 2>&1; then
        bun install
    elif command -v npm >/dev/null 2>&1; then
        npm install
    else
        error "Neither bun nor npm found. Please install dependencies manually."
        exit 1
    fi
fi

# Generate Prisma Client
log "🔧 Generating Prisma Client..."
if command -v bun >/dev/null 2>&1; then
    bun prisma generate
else
    npx prisma generate
fi

# Run database migration
log "🗄️ Running database migrations..."
if command -v bun >/dev/null 2>&1; then
    bun prisma migrate deploy
else
    npx prisma migrate deploy
fi

# Run the unified seed
log "🌱 Running unified comprehensive seed..."
if command -v bun >/dev/null 2>&1; then
    bun tsx prisma/seed/unified-comprehensive-seed.ts
else
    npx tsx prisma/seed/unified-comprehensive-seed.ts
fi

success "🎉 TazaGroup Unified Seed completed successfully!"

echo ""
echo "🔑 Default login credentials:"
echo "   Super Admin: it@tazagroup.vn / TazaGroup@2024!"
echo "   System Admin: admin@tazagroup.vn / TazaAdmin@2024!"
echo "   CTO: cto@tazagroup.vn / CTO@2024!"
echo "   HR Director: hr.director@tazagroup.vn / HRDirector@2024!"
echo "   Sales Director: sales.director@tazagroup.vn / SalesDirector@2024!"
echo ""
echo "🏢 Access your application and test the login functionality!"
