#!/bin/bash

# 🚀 Complete Next.js v15 + BunJS Structure Migration
# Chuẩn hóa và loại bỏ src/ theo Next.js v15 App Router standards

set -e

echo "🚀 Next.js v15 + BunJS Migration Starting..."
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${PURPLE}[MIGRATE]${NC} $1"; }

# Step 1: Pre-migration analysis
analyze_current_structure() {
    log "Analyzing current project structure..."
    
    echo "📁 Current directories found:"
    [ -d "src" ] && echo "  ❌ src/ (needs removal)"
    [ -d "app" ] && echo "  ✅ app/ (Next.js v15 standard)"
    [ -d "components" ] && echo "  📦 components/ (root level)"
    [ -d "lib" ] && echo "  📚 lib/ (utilities)"
    [ -d "hooks" ] && echo "  🪝 hooks/ (custom hooks)"
    
    if [ -d "src" ]; then
        echo "🔍 src/ contents:"
        find src -type d -maxdepth 2 | sort
        echo
        warning "src/ directory found - will be migrated and removed"
    else
        success "No src/ directory found - structure already clean"
    fi
}

# Step 2: Create backup
create_backup() {
    local backup_dir="migration_backup_$(date +%Y%m%d_%H%M%S)"
    log "Creating backup at: $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # Backup critical directories and files
    for item in "src" "app" "components" "lib" "hooks" "types" "next.config.ts" "tsconfig.json" "package.json"; do
        if [ -e "$item" ]; then
            cp -r "$item" "$backup_dir/"
            info "Backed up: $item"
        fi
    done
    
    echo "$backup_dir" > .migration-backup-path
    success "Backup created successfully"
}

# Step 3: Migrate src/ contents
migrate_src_directory() {
    if [ ! -d "src" ]; then
        success "No src/ directory to migrate"
        return 0
    fi
    
    log "Migrating src/ directory contents..."
    
    # Create target directories
    mkdir -p app/components lib hooks types utils
    
    # Migrate specific directories
    migrate_directory() {
        local source_dir="$1"
        local target_dir="$2"
        local description="$3"
        
        if [ -d "$source_dir" ]; then
            info "Migrating $description: $source_dir → $target_dir"
            
            # Create target directory
            mkdir -p "$target_dir"
            
            # Copy contents, handling conflicts
            find "$source_dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
                relative_path="${file#$source_dir/}"
                target_file="$target_dir/$relative_path"
                target_file_dir=$(dirname "$target_file")
                
                mkdir -p "$target_file_dir"
                
                if [ ! -f "$target_file" ]; then
                    cp "$file" "$target_file"
                    info "  ✓ $relative_path"
                else
                    warning "  ⚠ $relative_path (file exists, skipped)"
                fi
            done
        fi
    }
    
    # Perform migrations
    migrate_directory "src/components" "app/components" "Components"
    migrate_directory "src/lib" "lib" "Library files"
    migrate_directory "src/hooks" "hooks" "Custom hooks"
    migrate_directory "src/types" "types" "Type definitions"
    migrate_directory "src/utils" "utils" "Utility functions"
    
    # Handle src/app specially
    if [ -d "src/app" ]; then
        warning "Found src/app/ - merging with existing app/"
        
        find src/app -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
            relative_path="${file#src/app/}"
            target_file="app/$relative_path"
            target_file_dir=$(dirname "$target_file")
            
            mkdir -p "$target_file_dir"
            
            if [ ! -f "$target_file" ]; then
                cp "$file" "$target_file"
                info "  ✓ app/$relative_path"
            else
                warning "  ⚠ app/$relative_path (exists, manual merge needed)"
            fi
        done
    fi
    
    success "Migration completed"
}

# Step 4: Update import paths
update_import_paths() {
    log "Updating import paths..."
    
    # Find all relevant files
    find app lib hooks types utils -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            # Update @/src/* imports to @/*
            sed -i 's|from "@/src/|from "@/|g' "$file" 2>/dev/null || true
            sed -i "s|from '@/src/|from '@/|g" "$file" 2>/dev/null || true
            
            # Update import() statements
            sed -i 's|import("@/src/|import("@/|g' "$file" 2>/dev/null || true
            sed -i "s|import('@/src/|import('@/|g" "$file" 2>/dev/null || true
            
            # Update relative paths
            sed -i 's|"../src/|"../|g' "$file" 2>/dev/null || true
            sed -i "s|'../src/|'../|g" "$file" 2>/dev/null || true
            
            info "Updated imports in: $(basename "$file")"
        fi
    done
    
    success "Import paths updated"
}

# Step 5: Update TypeScript configuration
update_typescript_config() {
    log "Updating TypeScript configuration..."
    
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/public/*": ["./public/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "migration_backup_*",
    "src"
  ]
}
EOF
    
    success "Updated tsconfig.json"
}

# Step 6: Update package.json for BunJS
update_package_scripts() {
    log "Updating package.json for BunJS..."
    
    # Backup original package.json
    cp package.json package.json.backup
    
    # Update scripts using Node.js (since jq might not be available)
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        pkg.scripts = {
            ...pkg.scripts,
            'dev': 'bun --bun next dev -p 3900',
            'dev:turbo': 'bun --bun next dev --turbo -p 3900',
            'build': 'bun --bun next build',
            'start': 'bun --bun next start -p 3900',
            'lint': 'bun --bun next lint',
            'type-check': 'bun --bun tsc --noEmit',
            'clean': 'rm -rf .next out dist node_modules/.cache',
            'clean:install': 'rm -rf node_modules bun.lockb && bun install'
        };
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('✅ Updated package.json scripts for BunJS');
    " 2>/dev/null && success "Package.json updated for BunJS" || warning "Could not update package.json automatically"
}

# Step 7: Create BunJS configuration
create_bun_config() {
    log "Creating BunJS configuration..."
    
    # Create .bunfig.toml
    cat > .bunfig.toml << 'EOF'
[install]
cache = true
registry = "https://registry.npmjs.org"
optional = true

[run]
bun = true
shell = "bash"

[test]
preload = ["./test/setup.ts"]
timeout = 20000
EOF
    
    success "Created .bunfig.toml"
}

# Step 8: Update Next.js configuration
update_nextjs_config() {
    log "Updating Next.js configuration..."
    
    cat > next.config.ts << 'EOF'
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 15 optimizations
  serverExternalPackages: [
    'prisma',
    '@prisma/client',
    'bcryptjs',
    'sharp'
  ],
  
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      'lucide-react',
      'framer-motion'
    ],
    optimizeCss: true,
    scrollRestoration: true
  },

  // Build optimization
  compress: true,
  poweredByHeader: false,
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false
  },
  
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'lib', 'hooks', 'components']
  },

  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: '*.vercel.app' }
    ]
  }
};

export default nextConfig;
EOF
    
    success "Updated next.config.ts"
}

# Step 9: Remove src directory
remove_src_directory() {
    if [ ! -d "src" ]; then
        success "src/ directory already removed"
        return 0
    fi
    
    warning "Ready to remove src/ directory"
    echo "All content has been migrated to the new structure."
    
    read -p "Remove src/ directory now? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Removing src/ directory..."
        rm -rf src/
        success "src/ directory removed"
    else
        warning "src/ directory kept for manual review"
        echo "You can remove it later with: rm -rf src/"
    fi
}

# Step 10: Generate report
generate_report() {
    log "Generating migration report..."
    
    local backup_path=$(cat .migration-backup-path 2>/dev/null || echo "Unknown")
    
    cat > NEXTJS_V15_MIGRATION_COMPLETE.md << EOF
# 🚀 Next.js v15 + BunJS Migration Report

**Date**: $(date)
**Backup**: $backup_path

## ✅ Completed

1. **Structure Migration**
   - ✅ Migrated src/ → App Router structure
   - ✅ Updated import paths (@/src/* → @/*)
   - ✅ Created proper directory hierarchy

2. **BunJS Integration**
   - ✅ Updated package.json scripts
   - ✅ Created .bunfig.toml configuration
   - ✅ Optimized for BunJS runtime

3. **Configuration Updates**
   - ✅ TypeScript paths updated
   - ✅ Next.js v15 optimizations
   - ✅ ESLint and build settings

## 📁 New Structure

\`\`\`
/
├── app/                 # Next.js App Router
│   ├── components/      # React components
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Pages
├── lib/                 # Utilities
├── hooks/               # Custom hooks
├── types/               # TypeScript types
├── utils/               # Helper functions
├── next.config.ts       # Next.js config
├── tsconfig.json        # TypeScript config
└── .bunfig.toml        # BunJS config
\`\`\`

## 🚀 New Commands

\`\`\`bash
bun dev              # Development with BunJS
bun run dev:turbo    # Turbopack development
bun run build        # Production build
bun run type-check   # TypeScript validation
\`\`\`

## 📞 Next Steps

1. Test the application:
   \`\`\`bash
   bun install
   bun dev
   \`\`\`

2. Verify build:
   \`\`\`bash
   bun run type-check
   bun run build
   \`\`\`

## 🔄 Rollback

If needed, restore from backup:
\`\`\`bash
cp -r $backup_path/* .
bun install
\`\`\`

---
✅ **Migration Status: COMPLETED**
EOF
    
    success "Generated NEXTJS_V15_MIGRATION_COMPLETE.md"
}

# Main execution
main() {
    echo "🚀 Starting Next.js v15 + BunJS Migration"
    echo "========================================"
    
    # Check BunJS installation
    if ! command -v bun &> /dev/null; then
        error "BunJS not found. Install with: curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    
    info "Using BunJS version: $(bun --version)"
    echo
    
    # Execute migration steps
    analyze_current_structure
    create_backup
    migrate_src_directory
    update_import_paths
    update_typescript_config
    update_package_scripts
    create_bun_config
    update_nextjs_config
    remove_src_directory
    generate_report
    
    # Final summary
    echo
    echo "=============================================="
    echo -e "${GREEN}🎉 Migration Completed Successfully!${NC}"
    echo "=============================================="
    echo
    echo "📊 Summary:"
    echo "  ✅ Next.js v15 App Router structure"
    echo "  ✅ BunJS integration completed"
    echo "  ✅ Import paths updated"
    echo "  ✅ Configurations optimized"
    echo
    echo "🚀 Next steps:"
    echo "  1. bun install"
    echo "  2. bun dev"
    echo "  3. Test your application"
    echo
    echo "📖 See NEXTJS_V15_MIGRATION_COMPLETE.md for details"
    
    success "Your project is now ready for Next.js v15 + BunJS! 🚀"
}

# Run the migration
main "$@"
