#!/bin/bash

# ============================================================================
# QUICK START: MODULES PERMISSIONS TO DATABASE MIGRATION
# ============================================================================
# One-click setup for migrating permissions to database like a senior

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Art header
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}                                                                    ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}    ${BOLD}🚀 TazaCore Permissions Migration to Database${NC}             ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}    ${CYAN}Senior-level implementation with auto-sync${NC}                   ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}                                                                    ${PURPLE}║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log() { echo -e "${BLUE}[SETUP]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "Please run this script from the project root directory"
    exit 1
fi

log "🔍 Checking project structure..."

# Required files check
REQUIRED_FILES=(
    "site/prisma/seed/modules-permissions-migration.ts"
    "site/lib/permission-sync.service.ts"
    "site/src/app/api/admin/migrate-permissions/route.ts"
    "site/src/app/api/admin/sync-permissions/route.ts"
    "site/src/app/admin/permissions/components/PermissionSyncManager.tsx"
    "site/src/lib/auth/modules-permissions.ts"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    error "Missing required files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  ❌ $file"
    done
    echo ""
    error "Please ensure all migration files are in place"
    exit 1
fi

success "All required files found"

# Step 1: Environment setup
log "🔧 Setting up environment..."

if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    warning "No .env file found. Creating sample..."
    cat > .env.local << EOF
DATABASE_URL="postgresql://username:password@localhost:5432/tazacore?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
AUTO_SYNC_PERMISSIONS=true
EOF
    warning "Please update .env.local with your actual database credentials"
fi

# Step 2: Install dependencies
log "📦 Installing dependencies..."

# Install root dependencies
if [ ! -d "node_modules" ]; then
    log "Installing root dependencies..."
    bun install
fi

# Install site dependencies
if [ ! -d "site/node_modules" ]; then
    log "Installing site dependencies..."
    cd site
    bun install
    cd ..
fi

# Install site dependencies
if [ ! -d "site/node_modules" ]; then
    log "Installing site dependencies..."
    cd site
    bun install
    cd ..
fi

success "Dependencies installed"

# Step 3: Database setup
log "🗄️ Setting up database..."

cd site

# Check if database is accessible
if ! bun prisma db pull --force 2>/dev/null; then
    error "Database connection failed"
    echo ""
    warning "Please check your DATABASE_URL in .env.local"
    echo "Example: postgresql://username:password@localhost:5432/tazacore"
    echo ""
    exit 1
fi

# Generate Prisma client
log "Generating Prisma client..."
bun prisma generate

cd ..

success "Database setup complete"

# Step 4: Run migration
log "🚀 Running permissions migration..."

cd site

if bun run prisma/seed/modules-permissions-migration.ts; then
    success "✅ Migration completed successfully!"
else
    error "❌ Migration failed"
    cd ..
    exit 1
fi

cd ..

# Step 5: Verify migration
log "🔍 Verifying migration..."

cd site

# Get counts
ROLES=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.role.count({ where: { isSystemRole: true } });
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

USERS=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.user.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

cd ..

echo ""
echo -e "${BOLD}📊 Migration Results:${NC}"
echo "  • System Roles: $ROLES"
echo "  • System Users: $USERS"
echo "  • Permission Modules: 11 (Sales, CRM, Inventory, Finance, HRM, Projects, Manufacturing, Marketing, Support, Analytics, E-commerce)"

if [[ $ROLES -ge 8 ]] && [[ $USERS -ge 4 ]]; then
    success "✅ Migration verification passed"
else
    warning "⚠️ Migration verification incomplete"
fi

# Step 6: Create startup scripts
log "📝 Creating helper scripts..."

# Create start script
cat > start-with-sync.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting TazaCore with permission sync..."

# Start the development server
cd site
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 5

# Test permission sync
echo "🔄 Testing permission sync..."
curl -s http://localhost:3000/api/health?sync=true | grep -q "healthy" && echo "✅ Health check passed"

echo "🌐 Server running on http://localhost:3000"
echo "📊 Admin panel: http://localhost:3000/admin"
echo "🔐 Permissions: http://localhost:3000/admin/permissions"

# Keep script running
wait $SERVER_PID
EOF

chmod +x start-with-sync.sh

# Create test script
cat > test-permissions.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing permission system..."

echo "1. Testing health check..."
curl -s http://localhost:3000/api/health?sync=true

echo -e "\n2. Testing sync status..."
curl -s http://localhost:3000/api/admin/sync-permissions?action=status

echo -e "\n3. Testing migration endpoint..."
curl -s http://localhost:3000/api/admin/migrate-permissions

echo -e "\n✅ Test complete"
EOF

chmod +x test-permissions.sh

success "Helper scripts created"

# Step 7: Final summary
echo ""
echo -e "${BOLD}🎉 SETUP COMPLETE!${NC}"
echo ""
echo -e "${BOLD}🔑 Login Credentials:${NC}"
echo "  • Super Admin: admin@taza.com / TazaAdmin@2024!"
echo "  • Sales Manager: sales@taza.com / Sales@2024!"
echo "  • Finance Manager: finance@taza.com / Finance@2024!"
echo "  • Employee: employee@taza.com / Employee@2024!"

echo ""
echo -e "${BOLD}🌐 Access URLs:${NC}"
echo "  • Application: http://localhost:3000"
echo "  • Admin Panel: http://localhost:3000/admin"
echo "  • Permissions: http://localhost:3000/admin/permissions"
echo "  • Health Check: http://localhost:3000/api/health?sync=true"

echo ""
echo -e "${BOLD}🚀 Quick Start Commands:${NC}"
echo "  • Start with sync: ./start-with-sync.sh"
echo "  • Test permissions: ./test-permissions.sh"
echo "  • Manual sync: curl -X POST http://localhost:3000/api/admin/sync-permissions -H 'Content-Type: application/json' -d '{\"action\":\"sync-all\",\"force\":true}'"
echo "  • Development: cd site && npm run dev"

echo ""
echo -e "${BOLD}📖 Features Available:${NC}"
echo "  ✅ 11 Business modules with permissions"
echo "  ✅ Auto-sync permissions on startup"
echo "  ✅ Admin UI for permission management"
echo "  ✅ API endpoints for sync operations"
echo "  ✅ Health checks with sync status"
echo "  ✅ Senior-level error handling"

echo ""
echo -e "${BOLD}🔧 Next Steps:${NC}"
echo "  1. Run: ./start-with-sync.sh"
echo "  2. Open: http://localhost:3000/admin"
echo "  3. Login with admin credentials"
echo "  4. Navigate to 'Permissions' tab"
echo "  5. Click 'Sync' tab to manage synchronization"

echo ""
echo -e "${GREEN}${BOLD}🎊 Ready to use! Happy coding!${NC}"
echo ""
