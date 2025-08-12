#!/bin/bash

# Build Dependencies Checker for Optimized Deploy
# This script checks if all required dependencies are available for local building

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "🔍 Checking Build Dependencies for Optimized Deploy..."
echo "=================================================="

# Check if Bun is installed
if command -v bun >/dev/null 2>&1; then
    BUN_VERSION=$(bun --version)
    success "Bun is installed (version: $BUN_VERSION)"
else
    error "Bun is not installed"
    log "Please install Bun: curl -fsSL https://bun.sh/install | bash"
    MISSING_DEPS=true
fi

# Check if Node.js is available (fallback)
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    success "Node.js is available (version: $NODE_VERSION)"
else
    warning "Node.js is not installed (optional, but recommended as fallback)"
fi

# Check if SSH is available
if command -v ssh >/dev/null 2>&1; then
    success "SSH is available"
else
    error "SSH is not installed"
    MISSING_DEPS=true
fi

# Check if SCP is available
if command -v scp >/dev/null 2>&1; then
    success "SCP is available"
else
    error "SCP is not installed"
    MISSING_DEPS=true
fi

# Check if tar is available
if command -v tar >/dev/null 2>&1; then
    success "TAR is available"
else
    error "TAR is not installed"
    MISSING_DEPS=true
fi

# Check if current directory has package.json
if [ -f "package.json" ]; then
    success "package.json found"
else
    error "package.json not found in current directory"
    log "Please run this script from your project root directory"
    MISSING_DEPS=true
fi

# Check if docker-compose.yml exists (will be replaced with optimized version)
if [ -f "docker-compose.yml" ]; then
    success "docker-compose.yml found (will use as reference)"
else
    warning "docker-compose.yml not found (optimized version will be created)"
fi

echo ""
echo "=================================================="

if [ "$MISSING_DEPS" = true ]; then
    error "Some dependencies are missing. Please install them before running the deploy script."
    exit 1
else
    success "🎉 All dependencies are available!"
    log "You can now run: ./3pushauto.sh"
fi

echo "=================================================="
echo "📋 Quick Setup Guide:"
echo ""
echo "1. Install Bun (if not installed):"
echo "   curl -fsSL https://bun.sh/install | bash"
echo ""
echo "2. Install project dependencies:"
echo "   bun install"
echo ""
echo "3. Test local build:"
echo "   bun run build"
echo ""
echo "4. Run optimized deploy:"
echo "   ./3pushauto.sh"
echo ""
echo "=================================================="
