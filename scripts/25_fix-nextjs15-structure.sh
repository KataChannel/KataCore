#!/bin/bash

# Fix NextJS v15 Structure - Remove Duplicates and Standardize
# Author: GitHub Copilot
# Date: 2025-08-07

set -e

echo "🔧 Starting NextJS v15 Structure Fix..."

# Create backup
BACKUP_DIR="structure_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Function to safely move files if they don't exist in destination
safe_move() {
    local src=$1
    local dest=$2
    
    if [ -e "$src" ]; then
        if [ ! -e "$dest" ]; then
            mkdir -p "$(dirname "$dest")"
            mv "$src" "$dest"
            echo "✅ Moved: $src -> $dest"
        else
            echo "⚠️  Destination exists, backing up: $src"
            cp -r "$src" "$BACKUP_DIR/"
        fi
    fi
}

# Function to merge directory contents
merge_dirs() {
    local src=$1
    local dest=$2
    
    if [ -d "$src" ] && [ -d "$dest" ]; then
        echo "🔄 Merging: $src -> $dest"
        cp -r "$src"/* "$dest"/ 2>/dev/null || true
        rm -rf "$src"
        echo "✅ Merged and removed: $src"
    elif [ -d "$src" ]; then
        safe_move "$src" "$dest"
    fi
}

echo "🏗️  Fixing NextJS v15 Structure..."

# 1. Standardize components structure (use root/components, remove app/components)
echo "📁 Fixing components structure..."

# Backup app/components if it exists
if [ -d "app/components" ]; then
    cp -r "app/components" "$BACKUP_DIR/app_components_backup"
    
    # Move ThemeManager if it exists
    if [ -f "app/components/ThemeManager.tsx" ]; then
        safe_move "app/components/ThemeManager.tsx" "components/ThemeManager.tsx"
    fi
    
    # Merge other components
    if [ -d "components" ]; then
        merge_dirs "app/components" "components"
    else
        safe_move "app/components" "components"
    fi
fi

# 2. Standardize hooks structure (use root/hooks, remove app/hooks)
echo "🪝 Fixing hooks structure..."

# Backup app/hooks if it exists
if [ -d "app/hooks" ]; then
    cp -r "app/hooks" "$BACKUP_DIR/app_hooks_backup"
    
    # Move specific hooks
    if [ -f "app/hooks/useMenuItems.ts" ]; then
        safe_move "app/hooks/useMenuItems.ts" "hooks/useMenuItems.ts"
    fi
    
    if [ -f "app/hooks/useUnifiedTheme.ts" ]; then
        safe_move "app/hooks/useUnifiedTheme.ts" "hooks/useUnifiedTheme.ts"
    fi
    
    # Merge remaining hooks
    if [ -d "hooks" ]; then
        merge_dirs "app/hooks" "hooks"
    else
        safe_move "app/hooks" "hooks"
    fi
fi

# 3. Fix imports in files that reference moved components/hooks
echo "🔧 Updating import paths..."

# Update imports from app/components to components
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i.bak 's|from ['\''"]\.\.*/app/components|from "@/components|g' 2>/dev/null || true
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i.bak 's|from ['\''"]app/components|from "@/components|g' 2>/dev/null || true

# Update imports from app/hooks to hooks
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i.bak 's|from ['\''"]\.\.*/app/hooks|from "@/hooks|g' 2>/dev/null || true
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | xargs sed -i.bak 's|from ['\''"]app/hooks|from "@/hooks|g' 2>/dev/null || true

# Clean up .bak files
find . -name "*.bak" -delete 2>/dev/null || true

# 4. Update tsconfig.json paths
echo "📝 Updating tsconfig.json..."

# Create updated tsconfig
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
      "@/components/*": ["./components/*"],
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
    "structure_backup_*",
    "src"
  ]
}
EOF

# 5. Create index files for better imports
echo "📄 Creating index files..."

# Create components/index.ts
if [ ! -f "components/index.ts" ]; then
    cat > components/index.ts << 'EOF'
// Auto-generated component exports for NextJS v15
// Updated: $(date)

// Theme components
export { ThemeManager, ThemeInitScript, ThemeProvider } from './ThemeManager';

// Auth components
export * from './auth';

// Admin components  
export * from './admin';

// UI components
export * from './ui';

// Common components
export * from './common';

// Layout components
export * from './layout';
EOF
fi

# Create hooks/index.ts
if [ ! -f "hooks/index.ts" ]; then
    cat > hooks/index.ts << 'EOF'
// Auto-generated hooks exports for NextJS v15
// Updated: $(date)

// Theme hooks
export * from './useUnifiedTheme';

// Menu hooks
export * from './useMenuItems';

// Add other hooks as needed
EOF
fi

# 6. Cleanup empty directories
echo "🧹 Cleaning up empty directories..."

find . -type d -empty -not -path "./node_modules/*" -not -path "./.next/*" -delete 2>/dev/null || true

# 7. Remove src directory if it exists (NextJS v15 uses app directory)
if [ -d "src" ]; then
    echo "🗑️  Removing old src directory..."
    mv "src" "$BACKUP_DIR/src_backup"
fi

# 8. Verify structure
echo "✅ Verifying final structure..."

echo "📁 Current structure:"
echo "Root directories:"
ls -la | grep "^d" | awk '{print $9}' | grep -E "(app|components|hooks|lib|types|utils)" || true

echo ""
echo "App subdirectories:"
ls -la app/ | grep "^d" | awk '{print $9}' | head -10 || true

echo ""
echo "Components subdirectories:"
ls -la components/ | grep "^d" | awk '{print $9}' | head -10 || true

echo ""
echo "Hooks files:"
ls -la hooks/ 2>/dev/null || echo "No hooks directory"

echo ""
echo "🎉 NextJS v15 Structure Fix Complete!"
echo "📦 Backup created in: $BACKUP_DIR"
echo "🔧 Run 'npm run dev' to test the application"
echo ""
echo "Summary of changes:"
echo "- Consolidated app/components -> components/"
echo "- Consolidated app/hooks -> hooks/"
echo "- Updated import paths"
echo "- Updated tsconfig.json"
echo "- Created index files for better imports"
echo "- Removed duplicate directories"
