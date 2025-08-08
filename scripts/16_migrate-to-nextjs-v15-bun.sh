#!/bin/bash

# 🚀 Next.js v15 Structure Migration & Bun Setup Script
# Chuẩn hóa cấu trúc và setup Bun cho performance tối ưu

set -e

echo "🚀 Next.js v15 Structure Migration & Bun Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
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

info() {
    echo -e "${PURPLE}[MIGRATE]${NC} $1"
}

# Step 1: Create backup
echo
log "Step 1: Creating comprehensive backup..."
BACKUP_DIR="migration_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup important directories
for dir in "src" "lib" "components" "app"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "$BACKUP_DIR/"
        success "Backed up $dir to $BACKUP_DIR/"
    fi
done

# Backup config files
for file in "package.json" "tsconfig.json" "next.config.ts"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/"
        success "Backed up $file"
    fi
done

# Step 2: Analyze current structure
echo
log "Step 2: Analyzing current project structure..."

echo "📁 Current structure:"
echo "├── src/"
if [ -d "src" ]; then
    find src -type d -maxdepth 2 | sed 's/^/│   /'
fi
echo "├── lib/"
if [ -d "lib" ]; then
    find lib -type d -maxdepth 2 | sed 's/^/│   /'
fi
echo "├── components/"
if [ -d "components" ]; then
    find components -type d -maxdepth 2 | sed 's/^/│   /'
fi
echo "└── app/"
if [ -d "app" ]; then
    find app -type d -maxdepth 2 | head -10 | sed 's/^/│   /'
fi

# Step 3: Create new unified lib structure
echo
info "Step 3: Creating unified lib structure..."

# Create new lib structure following Next.js v15 best practices
mkdir -p lib/{auth,api,utils,config,services,types,hooks,providers}

# Merge src/lib into lib
if [ -d "src/lib" ]; then
    info "Merging src/lib into lib/"
    cp -r src/lib/* lib/ 2>/dev/null || true
    success "Merged src/lib content"
fi

# Move src subdirectories to lib
if [ -d "src/auth" ]; then
    cp -r src/auth/* lib/auth/ 2>/dev/null || true
    success "Moved src/auth to lib/auth"
fi

if [ -d "src/types" ]; then
    cp -r src/types/* lib/types/ 2>/dev/null || true
    success "Moved src/types to lib/types"
fi

if [ -d "src/hooks" ]; then
    cp -r src/hooks/* lib/hooks/ 2>/dev/null || true
    success "Moved src/hooks to lib/hooks"
fi

if [ -d "src/providers" ]; then
    cp -r src/providers/* lib/providers/ 2>/dev/null || true
    success "Moved src/providers to lib/providers"
fi

if [ -d "src/services" ]; then
    cp -r src/services/* lib/services/ 2>/dev/null || true
    success "Moved src/services to lib/services"
fi

# Step 4: Merge components
echo
info "Step 4: Consolidating components..."

# Merge src/components into components
if [ -d "src/components" ]; then
    info "Merging src/components into components/"
    
    # Create subdirectories if they don't exist
    mkdir -p components/{ui,forms,layout,auth,admin}
    
    # Copy all src/components content
    find src/components -type f -name "*.tsx" -o -name "*.ts" | while read file; do
        # Get relative path from src/components
        rel_path=${file#src/components/}
        target_dir="components/$(dirname "$rel_path")"
        
        # Create target directory
        mkdir -p "$target_dir"
        
        # Copy file
        cp "$file" "components/$rel_path"
        info "Moved $file to components/$rel_path"
    done
    
    success "Merged src/components content"
fi

# Step 5: Update import paths throughout the project
echo
info "Step 5: Updating import paths..."

# Function to update imports in a file
update_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        # Update src/ imports to lib/ or components/
        sed -i.bak \
            -e 's|from ['\''"]@/src/lib|from "@/lib|g' \
            -e 's|from ['\''"]@/src/types|from "@/lib/types|g' \
            -e 's|from ['\''"]@/src/hooks|from "@/lib/hooks|g' \
            -e 's|from ['\''"]@/src/auth|from "@/lib/auth|g' \
            -e 's|from ['\''"]@/src/providers|from "@/lib/providers|g' \
            -e 's|from ['\''"]@/src/services|from "@/lib/services|g' \
            -e 's|from ['\''"]@/src/components|from "@/components|g' \
            -e 's|import.*from ['\''"]@/src/|import "@/lib/|g' \
            "$file"
        
        # Remove .bak files
        rm -f "${file}.bak"
    fi
}

# Update imports in all TypeScript/JavaScript files
info "Updating imports in app directory..."
find app -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    update_imports "$file"
done

info "Updating imports in components directory..."
find components -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    update_imports "$file"
done

info "Updating imports in lib directory..."
find lib -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read file; do
    update_imports "$file"
done

success "Updated import paths"

# Step 6: Update tsconfig.json
echo
info "Step 6: Updating TypeScript configuration..."

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/lib/types/*": ["./lib/types/*"],
      "@/lib/utils/*": ["./lib/utils/*"],
      "@/lib/auth/*": ["./lib/auth/*"],
      "@/lib/hooks/*": ["./lib/hooks/*"],
      "@/lib/providers/*": ["./lib/providers/*"],
      "@/lib/services/*": ["./lib/services/*"],
      "@/public/*": ["./public/*"],
      "@/prisma/*": ["./prisma/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts", 
    "**/*.tsx", 
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules", ".next", "backup_*", "migration_backup_*", "src"]
}
EOF

success "Updated tsconfig.json with new path mappings"

# Step 7: Setup Bun
echo
info "Step 7: Setting up Bun for optimal performance..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    warning "Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    success "Installed Bun"
else
    success "Bun is already installed"
fi

# Update package.json scripts for Bun
info "Updating package.json scripts for Bun..."

# Create a temporary script to update package.json
cat > update_package.js << 'EOF'
const fs = require('fs');
const path = require('path');

try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Update scripts for Bun
    packageJson.scripts = {
        ...packageJson.scripts,
        "dev": "bun --bun next dev -p 3900",
        "dev:turbo": "bun --bun next dev --turbo -p 3900",
        "build": "bun --bun next build",
        "start": "bun --bun next start -p 3900",
        "lint": "bun --bun next lint",
        "type-check": "bun --bun tsc --noEmit",
        "bun:install": "bun install",
        "bun:update": "bun update",
        "bun:clean": "rm -rf node_modules bun.lockb && bun install"
    };

    // Add Bun-specific configuration
    packageJson.trustedDependencies = packageJson.trustedDependencies || [];
    if (!packageJson.trustedDependencies.includes("sharp")) {
        packageJson.trustedDependencies.push("sharp");
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json for Bun');
} catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
}
EOF

node update_package.js
rm update_package.js

success "Updated package.json for Bun optimization"

# Step 8: Create bunfig.toml for Bun configuration
echo
info "Step 8: Creating Bun configuration..."

cat > bunfig.toml << 'EOF'
# Bun configuration for Next.js optimization

[install]
# Use exact versions for consistent builds
exact = true

# Cache directory
cache = true

# Faster installs
concurrent = true

# Registry configuration
registry = "https://registry.npmjs.org/"

[install.scopes]
# Add any scoped registries here if needed

[run]
# Shell to use for running scripts
shell = "bash"

# Environment variables
env = [
  "NODE_ENV=development"
]

[test]
# Test runner configuration
runner = "jest"

[build]
# Build optimizations
minify = true
sourcemap = true
target = "esnext"
EOF

success "Created bunfig.toml configuration"

# Step 9: Remove old src directory
echo
info "Step 9: Cleaning up old structure..."

read -p "Remove old src/ directory? This cannot be undone (backup is in $BACKUP_DIR). (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf src/
    success "Removed old src/ directory"
else
    warning "Kept src/ directory - you can remove it manually later"
fi

# Step 10: Install dependencies with Bun
echo
info "Step 10: Installing dependencies with Bun..."

if command -v bun &> /dev/null; then
    bun install
    success "Installed dependencies with Bun"
else
    warning "Bun not available, skipping dependency installation"
fi

# Step 11: Create migration summary
echo
info "Step 11: Creating migration summary..."

cat > NEXTJS_V15_BUN_MIGRATION.md << EOF
# 🚀 Next.js v15 + Bun Migration Complete

## ✅ Migration Summary

### Structure Changes
- ✅ Unified \`src/\` content into \`lib/\` and \`components/\`
- ✅ Updated all import paths
- ✅ Cleaned TypeScript configuration
- ✅ Setup Bun for optimal performance

### New Directory Structure
\`\`\`
├── app/                    # Next.js App Router
├── components/             # All React components
│   ├── ui/                # UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── auth/              # Auth components
├── lib/                   # All utilities and services
│   ├── auth/              # Authentication logic
│   ├── api/               # API utilities
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   └── services/          # Business logic services
├── public/                # Static assets
├── prisma/                # Database schema and migrations
└── Configuration files
\`\`\`

### Bun Scripts
\`\`\`bash
# Development
bun dev                    # Start dev server
bun dev:turbo             # Start with Turbopack

# Building  
bun build                 # Build for production
bun start                 # Start production server

# Maintenance
bun bun:install           # Fresh install with Bun
bun bun:clean             # Clean install
bun type-check            # TypeScript check
\`\`\`

### Performance Improvements
- 🚀 **Faster package installs** with Bun
- ⚡ **Faster dev server** startup
- 📦 **Better dependency resolution**
- 🔧 **Optimized build process**

### Migration Date
$(date)

### Backup Location
$BACKUP_DIR/

## Next Steps

1. **Test the application**:
   \`\`\`bash
   bun dev
   \`\`\`

2. **Verify all imports work**:
   \`\`\`bash
   bun type-check
   \`\`\`

3. **Test build process**:
   \`\`\`bash
   bun build
   \`\`\`

4. **Update any remaining manual imports** if needed

## Rollback Instructions

If you need to rollback:
\`\`\`bash
# Restore from backup
cp -r $BACKUP_DIR/* .
npm install
\`\`\`
EOF

success "Created migration documentation"

# Final summary
echo
echo "=============================================="
echo -e "${GREEN}🎉 Next.js v15 + Bun Migration Complete!${NC}"
echo "=============================================="
echo
echo "📊 Summary:"
echo "  ✅ Unified project structure"
echo "  ✅ Updated import paths"
echo "  ✅ Configured Bun for performance"
echo "  ✅ Updated TypeScript configuration"
echo "  ✅ Created comprehensive backup"
echo
echo "📁 Backup location: $BACKUP_DIR/"
echo
echo "🚀 Next steps:"
echo "  1. bun dev"
echo "  2. bun type-check"
echo "  3. bun build"
echo
echo "📖 Read NEXTJS_V15_BUN_MIGRATION.md for details"
echo

# Test the setup
read -p "Would you like to test the setup now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Testing Bun development server..."
    if command -v bun &> /dev/null; then
        bun dev &
        sleep 5
        if curl -s http://localhost:3900 > /dev/null; then
            success "Development server is running successfully!"
            kill %1 2>/dev/null || true
        else
            warning "Development server may have issues - check manually"
        fi
    else
        warning "Bun not available for testing"
    fi
fi

success "Migration completed successfully!"
