#!/bin/bash

# NextJS v15 Structure Optimization Script
# Fixes duplicate folders and standardizes structure

set -e

echo "🔧 Starting NextJS v15 Structure Optimization..."

# Create backup
BACKUP_DIR="structure_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Standard NextJS v15 structure should be:
# ├── app/              (App Router pages and layouts)
# ├── components/       (Shared components - ROOT level)
# ├── hooks/           (Custom hooks - ROOT level)  
# ├── lib/             (Utilities and configurations)
# ├── types/           (TypeScript type definitions)
# ├── utils/           (Helper functions)
# └── public/          (Static assets)

echo "📦 Creating backup in $BACKUP_DIR..."

# 1. Fix components structure
if [ -d "app/components" ]; then
    echo "🔄 Moving app/components to root components/"
    
    # Backup existing
    cp -r "app/components" "$BACKUP_DIR/app_components_backup"
    
    # Merge with root components
    if [ -d "components" ]; then
        # Merge contents
        cp -r app/components/* components/ 2>/dev/null || true
    else
        # Move entire directory
        mv "app/components" "components"
    fi
    
    # Remove app/components
    rm -rf "app/components"
    echo "✅ Consolidated components to root level"
fi

# 2. Fix hooks structure  
if [ -d "app/hooks" ]; then
    echo "🪝 Moving app/hooks to root hooks/"
    
    # Backup existing
    cp -r "app/hooks" "$BACKUP_DIR/app_hooks_backup"
    
    # Merge with root hooks
    if [ -d "hooks" ]; then
        # Merge contents
        cp -r app/hooks/* hooks/ 2>/dev/null || true
    else
        # Move entire directory
        mv "app/hooks" "hooks"
    fi
    
    # Remove app/hooks
    rm -rf "app/hooks"
    echo "✅ Consolidated hooks to root level"
fi

# 3. Update import paths
echo "🔧 Updating import paths..."

# Fix imports from app/components to @/components
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | while read file; do
    sed -i.bak 's|from ['\''"]\.\.*/app/components|from "@/components|g' "$file" 2>/dev/null || true
    sed -i.bak 's|from ['\''"]app/components|from "@/components|g' "$file" 2>/dev/null || true
done

# Fix imports from app/hooks to @/hooks  
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | while read file; do
    sed -i.bak 's|from ['\''"]\.\.*/app/hooks|from "@/hooks|g' "$file" 2>/dev/null || true
    sed -i.bak 's|from ['\''"]app/hooks|from "@/hooks|g' "$file" 2>/dev/null || true
done

# Clean backup files
find . -name "*.bak" -delete 2>/dev/null || true

echo "✅ Import paths updated"

echo "🎉 NextJS v15 Structure Optimization Complete!"
echo "📦 Backup created in: $BACKUP_DIR"

# Show final structure
echo ""
echo "📁 Final structure:"
echo "├── app/              (Pages, layouts, API routes)"
echo "├── components/       (Shared components)"  
echo "├── hooks/           (Custom hooks)"
echo "├── lib/             (Configs and utilities)"
echo "├── types/           (TypeScript types)"
echo "└── utils/           (Helper functions)"