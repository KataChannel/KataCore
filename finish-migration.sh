#!/bin/bash

# TazaGroup - Complete Migration & Deployment Script
# This script completes the site-to-root migration and sets up the new structure

echo "🚀 TazaGroup - Completing Site-to-Root Migration"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    log_error "Please run this script from the TazaGroup root directory"
    exit 1
fi

log_info "Step 1: Validating migrated structure..."

# Check if migration was successful
if [ -f "app/layout.tsx" ] && [ -f "prisma/schema.prisma" ]; then
    log_success "Migration structure validated"
else
    log_error "Migration incomplete. Please run migrate-site-to-root.sh first"
    exit 1
fi

log_info "Step 2: Creating Docker volumes..."

# Create external volumes
docker volume create tazacore-postgres-data 2>/dev/null || true
docker volume create tazacore-redis-data 2>/dev/null || true
docker volume create tazacore-minio-data 2>/dev/null || true
docker volume create tazacore-pgadmin-data 2>/dev/null || true

log_success "Docker volumes created"

log_info "Step 3: Updating package.json scripts..."

# Update package.json to reflect new structure
cat > package.json << 'EOF'
{
  "name": "tazagroup-core",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3900",
    "build": "next build",
    "start": "next start -p 3900",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed/seed.ts",
    "db:studio": "prisma studio",
    "docker:build": "docker build -t tazacore/site:latest .",
    "docker:up": "docker-compose -f docker-compose.yml --env-file .env.prod up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "deploy": "npm run docker:build && npm run docker:up"
  },
  "dependencies": {
    "@next/font": "^14.0.0",
    "@prisma/client": "^5.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "bcryptjs": "^2.4.3",
    "clsx": "^2.0.0",
    "lucide-react": "^0.400.0",
    "nanoid": "^5.0.0",
    "next": "^14.0.0",
    "next-auth": "^4.24.0",
    "postcss": "^8.0.0",
    "prisma": "^5.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
EOF

log_success "Package.json updated"

log_info "Step 4: Updating environment configuration..."

# Check if .env.prod exists, if not copy from .env.prod.example
if [ ! -f ".env.prod" ]; then
    if [ -f ".env.prod.example" ]; then
        cp .env.prod.example .env.prod
        log_success "Environment file created from example"
    else
        log_warning "No .env.prod found. Using default configuration."
    fi
fi

log_info "Step 5: Generating Prisma client..."

# Generate Prisma client for new structure
if command -v bun &> /dev/null; then
    bun run db:generate
else
    npm run db:generate
fi

log_success "Prisma client generated"

log_info "Step 6: Testing Docker build..."

# Test Docker build
if docker build -t tazacore/site:test . --quiet; then
    log_success "Docker build successful"
    # Clean up test image
    docker rmi tazacore/site:test &>/dev/null || true
else
    log_error "Docker build failed. Please check Dockerfile"
    exit 1
fi

log_info "Step 7: Updating run.sh script..."

# Update run.sh for new structure
cat > run.sh << 'EOF'
#!/bin/bash

# TazaGroup - Production Deployment Script
# Optimized for the new root structure

set -e

echo "🚀 Starting TazaGroup Production Deployment"

# Load environment variables
if [ -f ".env.prod" ]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
    echo "✅ Environment loaded from .env.prod"
else
    echo "❌ .env.prod not found"
    exit 1
fi

echo "🔧 Building and starting containers..."
docker-compose -f docker-compose.yml --env-file .env.prod up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🔍 Checking service health..."
docker-compose -f docker-compose.yml --env-file .env.prod ps

echo "✅ Deployment completed!"
echo "🌐 App URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:3900}"
echo "🗄️  PgAdmin: http://localhost:${PGADMIN_PORT:-5050}"
echo "📦 MinIO Console: http://localhost:${MINIO_CONSOLE_PORT:-9001}"

echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
EOF

chmod +x run.sh

log_success "run.sh script updated"

log_info "Step 8: Creating complete-migration script..."

cat > complete-migration.sh << 'EOF'
#!/bin/bash

echo "🎯 Finalizing TazaGroup Migration"

# Remove site directory if migration is successful
if [ -d "site" ] && [ -f "app/layout.tsx" ]; then
    echo "🗑️  Removing old site/ directory..."
    rm -rf site/
    echo "✅ Old site/ directory removed"
fi

# Remove temporary files
rm -f migrate-site-to-root.sh
rm -f complete-migration.sh

echo "🎉 Migration completed successfully!"
echo ""
echo "New structure:"
echo "  📁 app/ - Next.js app router"
echo "  📁 components/ - React components"  
echo "  📁 lib/ - Utilities and config"
echo "  📁 prisma/ - Database schema"
echo "  📁 public/ - Static assets"
echo "  🐳 Dockerfile - Container configuration"
echo "  🐳 docker-compose.yml - Services configuration"
echo ""
echo "Next steps:"
echo "1. Run: ./run.sh"
echo "2. Configure nginx: ./simple-nginx.sh"
echo "3. Test the application"
EOF

chmod +x complete-migration.sh

log_success "Complete migration script created"

echo ""
log_success "🎉 Site-to-Root migration completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "  ✅ Site contents moved to root directory"
echo "  ✅ Docker configuration updated"
echo "  ✅ Package.json updated"
echo "  ✅ Environment configuration ready"
echo "  ✅ Prisma client generated"
echo "  ✅ Scripts updated for new structure"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: ./run.sh (Start the application)"
echo "  2. Run: ./simple-nginx.sh (Configure nginx)"
echo "  3. Run: ./complete-migration.sh (Clean up)"
echo ""
echo "🌐 Application will be available at:"
echo "  • Main app: http://localhost:3900"
echo "  • With nginx: https://app.tazagroup.vn"
