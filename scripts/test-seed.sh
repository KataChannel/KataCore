#!/bin/bash

# Test Master Seed Script
# Kiểm tra và test dữ liệu seed đã được tạo thành công

set -e

echo "🧪 Testing TazaCore Master Seed Data..."

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "shared" ]]; then
    error "Please run this script from the TazaCore root directory"
    exit 1
fi

# Test database connection
log "Testing database connection..."
cd shared
if bun prisma db pull --force-reset 2>/dev/null; then
    success "Database connection successful"
else
    error "Database connection failed"
    exit 1
fi

# Test seed data
log "Testing seed data..."

# Count roles
ROLE_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.role.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $ROLE_COUNT -ge 8 ]]; then
    success "Roles: $ROLE_COUNT found"
else
    error "Roles: Expected >= 8, found $ROLE_COUNT"
fi

# Count users
USER_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.user.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $USER_COUNT -ge 10 ]]; then
    success "Users: $USER_COUNT found"
else
    error "Users: Expected >= 10, found $USER_COUNT"
fi

# Count departments
DEPT_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.department.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $DEPT_COUNT -ge 6 ]]; then
    success "Departments: $DEPT_COUNT found"
else
    error "Departments: Expected >= 6, found $DEPT_COUNT"
fi

# Count positions
POS_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.position.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $POS_COUNT -ge 12 ]]; then
    success "Positions: $POS_COUNT found"
else
    error "Positions: Expected >= 12, found $POS_COUNT"
fi

# Count employees
EMP_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.employee.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $EMP_COUNT -ge 3 ]]; then
    success "Employees: $EMP_COUNT found"
else
    error "Employees: Expected >= 3, found $EMP_COUNT"
fi

# Count conversations
CONV_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.conversation.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $CONV_COUNT -ge 2 ]]; then
    success "Conversations: $CONV_COUNT found"
else
    error "Conversations: Expected >= 2, found $CONV_COUNT"
fi

# Count messages
MSG_COUNT=$(bun -e "
import { prisma } from './lib/prisma.js';
const count = await prisma.message.count();
console.log(count);
await prisma.\$disconnect();
" 2>/dev/null || echo "0")

if [[ $MSG_COUNT -ge 4 ]]; then
    success "Messages: $MSG_COUNT found"
else
    error "Messages: Expected >= 4, found $MSG_COUNT"
fi

# Test admin user login
log "Testing admin user credentials..."
SUPER_ADMIN_EXISTS=$(bun -e "
import { prisma } from './lib/prisma.js';
import bcrypt from 'bcrypt';
const user = await prisma.user.findUnique({
  where: { email: 'superadmin@tazacore.com' }
});
if (user && await bcrypt.compare('SuperAdmin@2024', user.password)) {
  console.log('true');
} else {
  console.log('false');
}
await prisma.\$disconnect();
" 2>/dev/null || echo "false")

if [[ $SUPER_ADMIN_EXISTS == "true" ]]; then
    success "Super Admin credentials verified"
else
    error "Super Admin credentials failed"
fi

cd ..

echo ""
echo "📋 Test Summary:"
echo "   Roles: $ROLE_COUNT"
echo "   Users: $USER_COUNT"
echo "   Departments: $DEPT_COUNT"
echo "   Positions: $POS_COUNT"
echo "   Employees: $EMP_COUNT"
echo "   Conversations: $CONV_COUNT"
echo "   Messages: $MSG_COUNT"
echo ""

if [[ $ROLE_COUNT -ge 8 && $USER_COUNT -ge 10 && $DEPT_COUNT -ge 6 && $POS_COUNT -ge 12 && $EMP_COUNT -ge 3 && $CONV_COUNT -ge 2 && $MSG_COUNT -ge 4 && $SUPER_ADMIN_EXISTS == "true" ]]; then
    echo "🎉 All seed tests passed successfully!"
    echo ""
    echo "💡 You can now:"
    echo "   1. Start the development server: bun run dev"
    echo "   2. Login with Super Admin: superadmin@tazacore.com / SuperAdmin@2024"
    echo "   3. Explore the application features"
    echo ""
else
    echo "❌ Some seed tests failed. Please check the errors above."
    exit 1
fi
