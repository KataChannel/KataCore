#!/bin/bash

# Fix Prisma model names from singular to plural
echo "Fixing Prisma model names from singular to plural..."

# Function to fix files
fix_files() {
    local pattern="$1"
    local files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next)
    
    for file in $files; do
        if [ -f "$file" ]; then
            # Only process files that contain the pattern
            if grep -q "$pattern" "$file" 2>/dev/null; then
                echo "Processing: $file"
                case "$pattern" in
                    "prisma\.user[^s]")
                        sed -i.bak 's/prisma\.user\([^s]\)/prisma.users\1/g' "$file"
                        ;;
                    "prisma\.role[^s]")
                        sed -i.bak 's/prisma\.role\([^s]\)/prisma.roles\1/g' "$file"
                        ;;
                    "prisma\.department[^s]")
                        sed -i.bak 's/prisma\.department\([^s]\)/prisma.departments\1/g' "$file"
                        ;;
                    "prisma\.employee[^s]")
                        sed -i.bak 's/prisma\.employee\([^s]\)/prisma.employees\1/g' "$file"
                        ;;
                esac
                rm -f "$file.bak" 2>/dev/null
            fi
        fi
    done
}

# Fix each model type
fix_files "prisma\.user[^s]"
fix_files "prisma\.role[^s]"
fix_files "prisma\.department[^s]"
fix_files "prisma\.employee[^s]"

echo "Completed fixing Prisma model names"
