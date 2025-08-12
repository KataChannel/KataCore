#!/bin/bash

# Fix double 's' in Prisma model names
echo "Fixing double 's' in Prisma model names..."

# Function to fix specific model names
fix_double_s() {
    local files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next)
    
    for file in $files; do
        if [ -f "$file" ]; then
            # Check if file contains any of the problematic patterns
            if grep -q "prisma\.\(roless\|userss\|departmentss\|employeess\|positionss\|menu_itemss\|roles_menu_items\)" "$file" 2>/dev/null; then
                echo "Processing: $file"
                
                # Fix the double 's' issues
                sed -i.bak \
                    -e 's/prisma\.roless/prisma.roles/g' \
                    -e 's/prisma\.userss/prisma.users/g' \
                    -e 's/prisma\.departmentss/prisma.departments/g' \
                    -e 's/prisma\.employeess/prisma.employees/g' \
                    -e 's/prisma\.positionss/prisma.positions/g' \
                    -e 's/prisma\.menu_itemss/prisma.menu_items/g' \
                    -e 's/prisma\.roles_menu_items/prisma.role_menu_items/g' \
                    "$file"
                
                rm -f "$file.bak" 2>/dev/null
            fi
        fi
    done
}

# Run the fix
fix_double_s

echo "Completed fixing double 's' in Prisma model names"

# Also check for any remaining issues
echo "Checking for remaining double 's' issues..."
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "prisma\.\(roless\|userss\|departmentss\|employeess\|positionss\|menu_itemss\|roles_menu_items\)" | head -5
