#!/bin/bash

# Remove HR/HRM modules script
echo "Starting HR/HRM module removal..."

# Remove HR directories
echo "Removing HR API directories..."
rm -rf ./app/api/hr 2>/dev/null || echo "HR directory not found or already removed"

# Remove HRM directories 
echo "Removing HRM API directories..."
rm -rf ./app/api/hrm 2>/dev/null || echo "HRM directory not found or already removed"

# Remove shared-hr
echo "Removing shared-hr directory..."
rm -rf ./app/api/shared-hr 2>/dev/null || echo "shared-hr directory not found or already removed"

# Remove HRM seed
echo "Removing HRM seed directory..."
rm -rf ./app/api/seed/hrm 2>/dev/null || echo "HRM seed directory not found or already removed"

# Remove HR/HRM references from prisma schema
echo "Checking for HR/HRM model references in schema..."
if grep -q "employees\|attendances\|departments\|positions\|payrolls\|leave_requests\|performance_reviews" ./prisma/schema.prisma; then
    echo "Found HR/HRM models in schema. Creating backup..."
    cp ./prisma/schema.prisma ./prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "Removing HR/HRM models from schema..."
    # Remove HR/HRM related models from schema
    sed -i '/^model employees {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model attendances {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model departments {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model positions {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model payrolls {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model leave_requests {/,/^}/d' ./prisma/schema.prisma
    sed -i '/^model performance_reviews {/,/^}/d' ./prisma/schema.prisma
fi

# Look for component references
echo "Searching for HR/HRM component references..."
find ./components -name "*hr*" -o -name "*employee*" -o -name "*department*" 2>/dev/null | head -10

# Look for any remaining references
echo "Searching for remaining HR/HRM references in code..."
grep -r "api/hr\|api/hrm\|/hr/\|/hrm/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v node_modules | head -10

echo "HR/HRM module removal completed!"
echo "Note: You may need to:"
echo "1. Update any navigation/menu items that reference HR/HRM modules"
echo "2. Remove HR/HRM permissions from the auth system"
echo "3. Run 'prisma generate' and 'prisma db push' if schema was modified"
