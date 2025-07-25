#!/bin/bash

# ============================================================================
# TAZAGROUP SEED CLEANUP SCRIPT
# ============================================================================
# Purpose: Clean up unnecessary seed files and organize the seed directory
# Keeps only the essential unified seed script and archives old files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$SCRIPT_DIR/site"
SEED_DIR="$SITE_DIR/prisma/seed"
ARCHIVE_DIR="$SEED_DIR/archive"

echo "🧹 Starting seed directory cleanup..."

# Create archive directory if it doesn't exist
if [ ! -d "$ARCHIVE_DIR" ]; then
    mkdir -p "$ARCHIVE_DIR"
    echo "📁 Created archive directory: $ARCHIVE_DIR"
fi

# Move unnecessary files to archive
cd "$SEED_DIR"

# Files to archive (not needed anymore)
FILES_TO_ARCHIVE=(
    "data-migration.ts"
    "hrm-seed.ts" 
    "master-seed-comprehensive.ts"
    "master-seed.ts"
    "modules-permissions-migration.ts"
    "permission-migration-validator.ts"
    "route copy 2.ts"
    "route copy.ts"
    "route.ts"
    "unified-comprehensive-seed-backup.ts"
)

echo "📦 Archiving old seed files..."
for file in "${FILES_TO_ARCHIVE[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "$ARCHIVE_DIR/"
        echo "   ✓ Archived: $file"
    fi
done

# Keep only the essential files
echo ""
echo "✅ Cleanup completed! Remaining files in seed directory:"
ls -la "$SEED_DIR" | grep -v "^d" | awk '{print "   " $9}' | grep -v "^   $"

echo ""
echo "📁 Archived files moved to: $ARCHIVE_DIR"
echo "🎯 Active seed script: unified-comprehensive-seed.ts"
echo ""
echo "🚀 Ready to use:"
echo "   npm run db:seed:unified"
echo "   or"
echo "   ./run-unified-seed.sh"
