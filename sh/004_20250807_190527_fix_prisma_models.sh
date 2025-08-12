#!/bin/bash

# Script to fix Prisma model naming issues in API routes
# Based on schema.prisma model names

echo "🔍 Scanning for Prisma model naming issues in API routes..."

# Define correct model mappings based on schema.prisma
declare -A model_mappings=(
    ["prisma.user"]="prisma.users"
    ["prisma.role"]="prisma.roles"
    ["prisma.department"]="prisma.departments" 
    ["prisma.employee"]="prisma.employees"
    ["prisma.position"]="prisma.positions"
    ["prisma.attendance"]="prisma.attendances"
    ["prisma.leave_request"]="prisma.leave_requests"
    ["prisma.payroll"]="prisma.payrolls"
    ["prisma.performance_review"]="prisma.performance_reviews"
    ["prisma.notification"]="prisma.notifications"
    ["prisma.message"]="prisma.messages"
    ["prisma.conversation"]="prisma.conversations"
    ["prisma.project"]="prisma.projects"
    ["prisma.task"]="prisma.tasks"
    ["prisma.facebook_page"]="prisma.facebook_pages"
    ["prisma.facebook_interaction"]="prisma.facebook_interactions"
    ["prisma.audit_log"]="prisma.audit_logs"
    ["prisma.call_extension"]="prisma.call_extensions"
    ["prisma.call_extension_user"]="prisma.call_extension_users"
    ["prisma.friend_request"]="prisma.friend_requests"
    ["prisma.message_reaction"]="prisma.message_reactions"
    ["prisma.conversation_member"]="prisma.conversation_members"
    ["prisma.workflow"]="prisma.workflows"
    ["prisma.workflow_step"]="prisma.workflow_steps"
    ["prisma.workflow_execution"]="prisma.workflow_executions"
    ["prisma.menu_item"]="prisma.menu_items"
    ["prisma.permission"]="prisma.permissions"
    ["prisma.role_permission"]="prisma.role_permissions"
    ["prisma.user_permission"]="prisma.user_permissions"
)

# Function to fix a single file
fix_file() {
    local file="$1"
    local backup_file="${file}.backup"
    
    echo "📝 Fixing: $file"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # Apply all mappings
    for wrong_name in "${!model_mappings[@]}"; do
        correct_name="${model_mappings[$wrong_name]}"
        sed -i "s|${wrong_name}|${correct_name}|g" "$file"
    done
    
    # Check if file was actually changed
    if diff -q "$file" "$backup_file" > /dev/null; then
        # No changes, remove backup
        rm "$backup_file"
        echo "   ✅ No changes needed"
    else
        echo "   ✅ Fixed model names"
        echo "   📦 Backup saved as: $backup_file"
    fi
}

# Find and fix all TypeScript files in app/api
echo "🔍 Searching for API files..."
find app/api -name "*.ts" -type f | while read -r file; do
    if grep -q "prisma\." "$file"; then
        fix_file "$file"
    fi
done

echo ""
echo "✅ Prisma model naming fixes completed!"
echo ""
echo "📋 Summary of corrections made:"
for wrong_name in "${!model_mappings[@]}"; do
    correct_name="${model_mappings[$wrong_name]}"
    echo "   $wrong_name → $correct_name"
done

echo ""
echo "⚠️  Important notes:"
echo "   - Backup files (.backup) have been created for changed files"
echo "   - Please test your API routes after these changes"
echo "   - Run 'npm run build' to check for any remaining TypeScript errors"
echo "   - You may need to run 'prisma generate' to update the Prisma client"

echo ""
echo "🔄 Regenerating Prisma client..."
npx prisma generate

echo ""
echo "🧪 Running TypeScript check..."
npx tsc --noEmit
