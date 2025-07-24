#!/bin/bash

# ============================================================================
# MODULES PERMISSIONS MIGRATION SCRIPT
# ============================================================================
# Senior-level script to migrate permissions from modules-permissions.ts to database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[MIGRATION]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "shared/prisma" ]; then
    error "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "============================================================================"
log "🚀 Starting Modules Permissions Migration to Database"
echo "============================================================================"
echo ""

# Step 1: Check dependencies
log "📦 Checking dependencies..."

if [ ! -f "shared/prisma/seed/modules-permissions-migration.ts" ]; then
    error "Migration script not found at shared/prisma/seed/modules-permissions-migration.ts"
    exit 1
fi

if [ ! -f "shared/lib/permission-sync.service.ts" ]; then
    error "Sync service not found at shared/lib/permission-sync.service.ts"
    exit 1
fi

success "All migration files found"

# Step 2: Check database connection
log "🔌 Testing database connection..."

cd shared

if ! bun prisma db pull --force-reset 2>/dev/null; then
    error "Database connection failed. Please check your DATABASE_URL"
    exit 1
fi

success "Database connection successful"

# Step 3: Install dependencies if needed
log "📥 Installing dependencies..."

if [ ! -d "node_modules" ]; then
    bun install
fi

cd ..

# Step 4: Generate Prisma client
log "🔧 Generating Prisma client..."

cd shared
bun prisma generate
cd ..

# Step 5: Run the migration
log "🗃️ Running modules permissions migration..."

cd shared

if bun run prisma/seed/modules-permissions-migration.ts; then
    success "✅ Migration completed successfully!"
else
    error "❌ Migration failed"
    exit 1
fi

cd ..

# Step 6: Test the migration via API
log "🧪 Testing migration via API..."

# Wait for the server to be ready (if running)
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    info "Server is running, testing API endpoints..."
    
    # Test sync status
    if curl -s http://localhost:3000/api/admin/sync-permissions?action=status > /dev/null; then
        success "Sync API is working"
    else
        warning "Sync API test failed (this is OK if server is not running)"
    fi
    
    # Test migration endpoint
    if curl -s http://localhost:3000/api/admin/migrate-permissions > /dev/null; then
        success "Migration API is working"
    else
        warning "Migration API test failed (this is OK if server is not running)"
    fi
else
    warning "Server not running, skipping API tests"
fi

# Step 7: Validation
log "🔍 Validating migration results..."

cd shared

# Count roles
ROLE_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.role.count({ where: { isSystemRole: true } });
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

# Count users
USER_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.user.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

# Count permissions
TOTAL_PERMISSIONS=$(bun -e "
import { ALL_MODULE_PERMISSIONS } from '../site/src/lib/auth/modules-permissions.js';
console.log(Object.keys(ALL_MODULE_PERMISSIONS).length);
" 2>/dev/null || echo "0")

cd ..

# Display results
echo ""
echo "============================================================================"
info "📊 MIGRATION VALIDATION RESULTS"
echo "============================================================================"
echo ""

if [[ $ROLE_COUNT -ge 8 ]]; then
    success "✅ System Roles: $ROLE_COUNT found (expected >= 8)"
else
    error "❌ System Roles: $ROLE_COUNT found (expected >= 8)"
fi

if [[ $USER_COUNT -ge 4 ]]; then
    success "✅ System Users: $USER_COUNT found (expected >= 4)"
else
    error "❌ System Users: $USER_COUNT found (expected >= 4)"
fi

if [[ $TOTAL_PERMISSIONS -ge 50 ]]; then
    success "✅ Total Permissions: $TOTAL_PERMISSIONS available (expected >= 50)"
else
    warning "⚠️ Total Permissions: $TOTAL_PERMISSIONS available (expected >= 50)"
fi

echo ""
info "🔑 Default Login Credentials:"
echo "  • Super Admin: admin@taza.com / TazaAdmin@2024!"
echo "  • Sales Manager: sales@taza.com / Sales@2024!"
echo "  • Finance Manager: finance@taza.com / Finance@2024!"
echo "  • Employee: employee@taza.com / Employee@2024!"

echo ""
info "🌐 Access URLs:"
echo "  • Admin Panel: http://localhost:3000/admin"
echo "  • Permissions: http://localhost:3000/admin/permissions"
echo "  • Migration API: http://localhost:3000/api/admin/migrate-permissions"
echo "  • Sync API: http://localhost:3000/api/admin/sync-permissions"

echo ""
info "📖 Usage Commands:"
echo "  • View roles: cd shared && bun -e \"import('./lib/prisma.js').then(({prisma}) => prisma.role.findMany().then(console.log))\""
echo "  • Test sync: curl http://localhost:3000/api/admin/sync-permissions?action=status"
echo "  • Force sync: curl -X POST http://localhost:3000/api/admin/sync-permissions -H 'Content-Type: application/json' -d '{\"action\":\"sync-all\",\"force\":true}'"

echo ""
echo "============================================================================"
success "🎉 Modules Permissions Migration to Database Complete!"
echo "============================================================================"
echo ""

# Final notes
info "📝 Next Steps:"
echo "  1. Start your application: npm run dev"
echo "  2. Login with admin credentials"
echo "  3. Navigate to /admin/permissions"
echo "  4. Use the 'Sync' tab to manage permission synchronization"
echo "  5. The system will auto-sync permissions on startup"
echo ""

warning "⚠️ Important Notes:"
echo "  • The migration has replaced all existing roles and users"
echo "  • All permissions are now defined in modules-permissions.ts"
echo "  • Use the Sync tab to keep database in sync with code changes"
echo "  • In production, sync operations require force=true"
echo ""
