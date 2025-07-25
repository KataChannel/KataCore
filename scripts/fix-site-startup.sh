#!/bin/bash

# TazaCore Site Startup Fix Script
# Addresses routes manifest and deployment issues

set -euo pipefail

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${CYAN}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         🔧 TazaCore Site Fix Script       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo

# Navigate to site directory
cd "$(dirname "$0")/site" || error "Cannot navigate to site directory"

log "Starting TazaCore site fixes..."

# 1. Clear Next.js cache and build artifacts
log "Clearing Next.js cache and build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true
success "Cache cleared"

# 2. Regenerate package-lock if using npm
if [ -f "package-lock.json" ]; then
    log "Regenerating package-lock.json..."
    rm package-lock.json
    npm install
    success "Package-lock regenerated"
fi

# 3. Install/update dependencies
log "Installing/updating dependencies..."
if command -v bun &> /dev/null; then
    bun install
elif command -v npm &> /dev/null; then
    npm install
else
    error "No package manager found (bun or npm required)"
fi
success "Dependencies installed"

# 4. Generate Prisma client
log "Generating Prisma client..."
if command -v bun &> /dev/null; then
    bun prisma generate
else
    npx prisma generate
fi
success "Prisma client generated"

# 5. Run database migrations (development only)
if [ "${NODE_ENV:-development}" != "production" ]; then
    log "Running database migrations..."
    if command -v bun &> /dev/null; then
        bun prisma migrate deploy || warning "Database migrations failed - this is normal if DB is not configured"
    else
        npx prisma migrate deploy || warning "Database migrations failed - this is normal if DB is not configured"
    fi
fi

# 6. Build the application
log "Building the application..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi
success "Application built successfully"

# 7. Start the application
log "Starting the application..."
if [ "${NODE_ENV:-development}" = "production" ]; then
    if command -v bun &> /dev/null; then
        bun start
    else
        npm start
    fi
else
    if command -v bun &> /dev/null; then
        bun dev
    else
        npm run dev
    fi
fi
