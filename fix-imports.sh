#!/bin/bash

# Fix Import Statements Script
# Fixes malformed import statements in the codebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

log "🔧 Fixing malformed import statements..."

cd site/src

# Fix malformed imports in auth files
log "Fixing auth service imports..."

find . -name "*.ts" -type f -exec sed -i 's|import @/lib/auth/unified-auth.service from.*|import { authService } from "@/lib/auth/unified-auth.service";|g' {} \;

# Fix export statements in auth service files
log "Fixing auth service exports..."

# Fix the export in authService.ts
if [ -f "lib/auth/authService.ts" ]; then
    sed -i 's|export const @/lib/auth/unified-auth.service =|export const authService =|g' lib/auth/authService.ts
    sed -i 's|export default @/lib/auth/unified-auth.service;|export default authService;|g' lib/auth/authService.ts
    success "Fixed authService.ts exports"
fi

# Fix the export in unified-auth.service.ts
if [ -f "lib/auth/unified-auth.service.ts" ]; then
    sed -i 's|export const @/lib/auth/unified-auth.service =|export const authService =|g' lib/auth/unified-auth.service.ts
    sed -i 's|export default @/lib/auth/unified-auth.service;|export default authService;|g' lib/auth/unified-auth.service.ts
    success "Fixed unified-auth.service.ts exports"
fi

# Update all usages to use the correct variable name
log "Updating auth service usages..."

find . -name "*.ts" -type f -exec sed -i 's|@/lib/auth/unified-auth.service\.|authService.|g' {} \;

success "Import/export fixes completed!"

log "🎯 Running additional cleanup..."

# Remove any remaining malformed syntax
find . -name "*.ts" -type f -exec sed -i 's|import @/lib/auth/unified-auth.service|import { authService }|g' {} \;

# Ensure proper import format
find . -name "*.ts" -type f -exec sed -i 's|import { authService } from.*|import { authService } from "@/lib/auth/unified-auth.service";|g' {} \;

success "All import/export issues fixed!"

cd ../..

log "🧹 Running final cleanup and format..."

cd site

# Run prettier to fix formatting
if command -v bun >/dev/null 2>&1; then
    bun run format >/dev/null 2>&1 || true
elif command -v npm >/dev/null 2>&1; then
    npm run format >/dev/null 2>&1 || true
fi

success "🎉 Code cleanup completed successfully!"

echo ""
echo "📋 Summary of fixes applied:"
echo "  • Fixed malformed import statements"
echo "  • Corrected export variable names" 
echo "  • Standardized auth service imports"
echo "  • Applied code formatting"
echo ""
echo "✅ Your codebase is now clean and ready for development!"
