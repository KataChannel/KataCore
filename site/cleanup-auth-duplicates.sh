#!/bin/bash
# ============================================================================
# AUTH CLEANUP SCRIPT - Remove Duplicate User Interfaces
# ============================================================================
# This script helps identify and optionally fix duplicate User interfaces

echo "🔍 Scanning for duplicate User interface definitions..."

# Find all files with User interface definitions
echo "📋 Files with 'interface User' definitions:"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "interface User" | while read file; do
    echo "  📄 $file"
    
    # Show the line number and context
    grep -n "interface User" "$file"
done

echo ""
echo "🎯 Recommended actions:"
echo "1. Replace duplicate User interfaces with:"
echo "   import { type User } from '@/types/auth';"
echo ""
echo "2. For components that need extended User properties:"
echo "   interface ExtendedUser extends User { ... }"
echo ""
echo "3. Files to check and update:"

# Specific recommendations for each file type
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "interface User" | while read file; do
    case "$file" in
        *"dashboard"*)
            echo "  📄 $file - Use: import { type User } from '@/types/auth'"
            ;;
        *"admin"*)
            echo "  📄 $file - Use: import { type User } from '@/types/auth'"
            ;;
        *"components"*)
            echo "  📄 $file - Use: import { type User } from '@/types/auth'"
            ;;
        *"lib/auth"*)
            echo "  📄 $file - Consider extending User from @/types/auth if needed"
            ;;
        *)
            echo "  📄 $file - Review and replace with unified User type"
            ;;
    esac
done

echo ""
echo "✅ Run this script again after making changes to verify cleanup."
echo "🚀 Goal: Only /src/types/auth.ts should define the User interface."
