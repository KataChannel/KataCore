#!/bin/bash

# Pre-deployment Shared Prisma Setup Script
# This script ensures shared Prisma is properly configured before deployment

set -e

echo "🔄 Pre-deployment Shared Prisma Setup..."

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "shared" ]]; then
    error "Please run this script from the TazaCore root directory"
    exit 1
fi

# Ensure shared directory exists and is properly set up
log "Checking shared Prisma setup..."

if [[ ! -f "shared/package.json" ]]; then
    error "shared/package.json not found. Please run setup-shared-prisma.sh first"
    exit 1
fi

if [[ ! -f "shared/lib/prisma.ts" ]]; then
    error "shared/lib/prisma.ts not found. Please run setup-shared-prisma.sh first"
    exit 1
fi

if [[ ! -f "shared/prisma/schema.prisma" ]]; then
    error "shared/prisma/schema.prisma not found. Please run setup-shared-prisma.sh first"
    exit 1
fi

success "Shared directory structure verified"

# Install shared dependencies
log "Installing shared dependencies..."
cd shared
npm install --production
success "Shared dependencies installed"

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate
success "Prisma client generated"

# Verify Prisma client generation
if [[ ! -d "node_modules/.prisma" ]]; then
    error "Prisma client generation failed"
    exit 1
fi

success "Prisma client verified"

cd ..

# Check symlinks in api and site directories
log "Checking Prisma symlinks..."

# Check API symlink
if [[ ! -L "api/prisma" ]]; then
    warning "API Prisma symlink not found, creating..."
    cd api
    rm -rf prisma
    ln -sf ../shared/prisma ./prisma
    cd ..
    success "API Prisma symlink created"
fi

# Check Site symlink
if [[ ! -L "site/prisma" ]]; then
    warning "Site Prisma symlink not found, creating..."
    cd site
    rm -rf prisma
    ln -sf ../shared/prisma ./prisma
    cd ..
    success "Site Prisma symlink created"
fi

# Verify environment variables
log "Checking environment configuration..."

if [[ ! -f ".env.prod" ]]; then
    warning ".env.prod not found. Make sure to configure environment variables before deployment"
else
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env.prod; then
        success "DATABASE_URL found in .env.prod"
    else
        warning "DATABASE_URL not found in .env.prod"
    fi
fi

# Test Prisma client import
log "Testing Prisma client import..."
cd shared
if node -e "const { PrismaClient } = require('@prisma/client'); console.log('Prisma client import successful');" 2>/dev/null; then
    success "Prisma client import test passed"
else
    error "Prisma client import test failed"
    exit 1
fi
cd ..

# Create a deployment verification script
log "Creating deployment verification script..."
cat > verify-deployment.sh << 'EOF'
#!/bin/bash

# Deployment Verification Script
echo "🔍 Verifying deployment..."

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Some containers are not running"
    docker-compose ps
fi

# Check API health
echo "🔍 Checking API health..."
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "⚠️ API health check failed, trying basic connection..."
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        echo "✅ API is responding (no health endpoint)"
    else
        echo "❌ API is not responding"
    fi
fi

# Check Site health
echo "🔍 Checking Site health..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Site is responding"
else
    echo "❌ Site is not responding"
fi

# Check database connection
echo "🔍 Checking database connection..."
if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-tazacore} >/dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
fi

echo "🎉 Deployment verification completed"
EOF

chmod +x verify-deployment.sh
success "Deployment verification script created"

# Final summary
echo ""
echo "📋 Pre-deployment Shared Prisma Setup Summary:"
echo "   ✅ Shared directory structure verified"
echo "   ✅ Shared dependencies installed"
echo "   ✅ Prisma client generated"
echo "   ✅ Symlinks verified"
echo "   ✅ Prisma client import tested"
echo "   ✅ Deployment verification script created"
echo ""
echo "🚀 Your project is ready for deployment!"
echo ""
echo "💡 Next steps:"
echo "   1. Configure your .env.prod file with proper database credentials"
echo "   2. Run your deployment script"
echo "   3. After deployment, run ./verify-deployment.sh to verify everything is working"
echo ""
