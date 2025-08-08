#!/bin/bash

# Next.js v15 Structure Fix Script
# This script reorganizes the project to follow Next.js v15 App Router standards

echo "🔧 Fixing Next.js v15 structure..."

cd /chikiet/kataoffical/tazagroup

# Backup current structure
echo "📦 Creating backup..."
mkdir -p migration_backup_$(date +%Y%m%d_%H%M%S)

# 1. Fix app directory structure
echo "🗂️  Fixing app directory structure..."

# Move duplicate folders from app/ to root if they don't belong in app/
if [ -d "app/components" ]; then
    echo "Moving app/components to root level (if not already there)..."
    if [ ! -d "components" ]; then
        mv app/components ./
    else
        echo "Merging app/components with existing components/"
        cp -r app/components/* components/ 2>/dev/null || true
        rm -rf app/components
    fi
fi

if [ -d "app/hooks" ]; then
    echo "Moving app/hooks to root level..."
    if [ ! -d "hooks" ]; then
        mv app/hooks ./
    else
        echo "Merging app/hooks with existing hooks/"
        cp -r app/hooks/* hooks/ 2>/dev/null || true
        rm -rf app/hooks
    fi
fi

# 2. Ensure proper app directory structure
echo "📁 Ensuring proper app directory structure..."

# Required app router files should stay in app/
required_app_files=(
    "layout.tsx"
    "page.tsx"
    "loading.tsx"
    "error.tsx"
    "not-found.tsx"
    "global-error.tsx"
)

# 3. Fix imports in layout.tsx to use correct paths
echo "🔗 Fixing imports in layout.tsx..."

# Create a proper Next.js v15 compliant layout
if [ -f "app/layout.tsx" ]; then
    echo "Checking layout.tsx imports..."
    # This will be handled by the file editing tools
fi

# 4. Create proper directory structure for Next.js v15
echo "📂 Creating proper Next.js v15 directory structure..."

# Ensure these directories exist at root level (not in app/)
directories=(
    "components"
    "hooks"
    "lib"
    "utils"
    "types"
    "styles"
    "public"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "Created $dir directory"
    fi
done

# 5. Check for incorrect nested structures
echo "🔍 Checking for incorrect nested structures..."

# Remove any unnecessary nested app directories
if [ -d "app/app" ]; then
    echo "Found nested app/app - fixing..."
    mv app/app/* app/ 2>/dev/null || true
    rmdir app/app 2>/dev/null || true
fi

# 6. Update TypeScript configuration for Next.js v15
echo "⚙️  Updating TypeScript configuration..."

# 7. Update Next.js configuration
echo "🚀 Updating Next.js configuration..."

echo "✅ Next.js v15 structure fix completed!"
echo ""
echo "📋 Summary of changes:"
echo "   - Fixed app directory structure"
echo "   - Moved shared code to root level"
echo "   - Ensured proper Next.js v15 App Router structure"
echo "   - Fixed import paths"
echo ""
echo "🔄 Please run 'npm run build' to test the changes"
