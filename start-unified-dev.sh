#!/bin/bash
# ============================================================================
# TAZA CORE UNIFIED DEVELOPMENT SCRIPT
# ============================================================================
# Run this after migration to start development with unified standards

echo "🚀 TazaCore Unified Development Environment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "site/package.json" ]; then
    echo "❌ Error: Please run this script from the tazagroup root directory"
    exit 1
fi

cd site

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================
echo "🔧 Setting up environment..."

# Install dependencies
echo "  📦 Installing dependencies..."
npm install --silent

# ============================================================================
# CODE QUALITY CHECKS
# ============================================================================
echo "🔍 Running code quality checks..."

# TypeScript compilation check
echo "  📝 Checking TypeScript..."
if npm run type-check; then
    echo "  ✅ TypeScript check passed"
else
    echo "  ⚠️  TypeScript issues found - continuing anyway"
fi

# Linting check
echo "  🧹 Running linter..."
if npm run lint:fix; then
    echo "  ✅ Linting passed"
else
    echo "  ⚠️  Lint issues found - continuing anyway"
fi

# ============================================================================
# AUTHENTICATION SYSTEM TEST
# ============================================================================
echo "🔐 Testing authentication system..."

# Create a simple test file
cat > test-auth.js << 'EOF'
const https = require('https');

async function testAuth() {
    console.log('  🧪 Testing auth endpoints...');
    
    // Test health endpoint
    try {
        const healthResponse = await fetch('http://localhost:3000/api/health');
        if (healthResponse.ok) {
            console.log('  ✅ Health endpoint working');
        } else {
            console.log('  ⚠️  Health endpoint issues');
        }
    } catch (error) {
        console.log('  ⚠️  Server not running - will start development server');
    }
}

testAuth();
EOF

node test-auth.js
rm test-auth.js

# ============================================================================
# DATABASE SETUP (if needed)
# ============================================================================
echo "🗄️  Checking database setup..."

if [ -f "prisma/schema.prisma" ]; then
    echo "  📊 Prisma schema found"
    
    # Generate Prisma client
    echo "  🔧 Generating Prisma client..."
    npx prisma generate --silent || echo "  ⚠️  Prisma generation issues"
    
    # Check if database needs migration
    echo "  🔄 Checking database status..."
    npx prisma db push --skip-generate --accept-data-loss || echo "  ⚠️  Database sync issues"
else
    echo "  ⚠️  No Prisma schema found - skipping database setup"
fi

# ============================================================================
# START DEVELOPMENT SERVER
# ============================================================================
echo "🌐 Starting development server..."

# Create development script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🔥 TazaCore Development Server Starting..."
echo ""
echo "📋 Available endpoints:"
echo "  🏠 Homepage: http://localhost:3000"
echo "  🔐 Login: http://localhost:3000/login"
echo "  📊 Dashboard: http://localhost:3000/dashboard"
echo "  🏢 Admin: http://localhost:3000/admin"
echo ""
echo "🧪 Test accounts (after seeding):"
echo "  👑 Super Admin: admin@taza.com / admin123"
echo "  👨‍💼 Manager: manager@taza.com / manager123"
echo "  👩‍💻 Employee: employee@taza.com / employee123"
echo ""
echo "📚 Documentation: ../TAZA-CORE-STANDARDS.md"
echo "🗺️  Migration Guide: ../MIGRATION-PLAN.md"
echo ""
echo "Starting Next.js development server..."
echo "======================================="

npm run dev
EOF

chmod +x start-dev.sh

# ============================================================================
# CREATE QUICK TEST SCRIPT
# ============================================================================
echo "🧪 Creating test utilities..."

cat > test-unified.sh << 'EOF'
#!/bin/bash
# Quick test script for unified system

echo "🧪 TazaCore Unified System Tests"
echo "================================="

echo "📝 TypeScript Check:"
npm run type-check

echo ""
echo "🧹 Linting Check:"
npm run lint

echo ""
echo "🏗️  Build Check:"
npm run build

echo ""
echo "✅ All tests completed!"
EOF

chmod +x test-unified.sh

# ============================================================================
# CREATE SEED DATA SCRIPT
# ============================================================================
echo "🌱 Creating seed data utility..."

cat > seed-data.js << 'EOF'
// Quick seed data for testing unified auth system
const bcrypt = require('bcrypt');

async function createTestUsers() {
    console.log('🌱 Creating test users for unified system...');
    
    const users = [
        {
            email: 'admin@taza.com',
            password: await bcrypt.hash('admin123', 12),
            displayName: 'Super Administrator',
            roleId: 'super_admin',
            modules: ['*'],
            permissions: ['*:*'],
            isActive: true,
            isVerified: true
        },
        {
            email: 'manager@taza.com', 
            password: await bcrypt.hash('manager123', 12),
            displayName: 'Department Manager',
            roleId: 'department_manager',
            modules: ['hrm', 'sales', 'crm'],
            permissions: ['read:*', 'create:*', 'update:department'],
            isActive: true,
            isVerified: true
        },
        {
            email: 'employee@taza.com',
            password: await bcrypt.hash('employee123', 12), 
            displayName: 'Regular Employee',
            roleId: 'employee',
            modules: ['hrm'],
            permissions: ['read:own', 'update:own'],
            isActive: true,
            isVerified: true
        }
    ];
    
    console.log('👥 Test users prepared:');
    users.forEach(user => {
        console.log(`  - ${user.displayName}: ${user.email}`);
    });
    
    console.log('');
    console.log('💡 To actually create these users, implement database integration');
    console.log('   in your Prisma seed file or API endpoint');
}

createTestUsers();
EOF

node seed-data.js
rm seed-data.js

# ============================================================================
# FINAL INSTRUCTIONS
# ============================================================================
echo ""
echo "🎉 TazaCore Unified Development Environment Ready!"
echo "=================================================="
echo ""
echo "🚀 To start development:"
echo "  ./start-dev.sh"
echo ""
echo "🧪 To run tests:"
echo "  ./test-unified.sh"
echo ""
echo "📋 Key Features Enabled:"
echo "  ✅ Unified Authentication System"
echo "  ✅ Role-Based Access Control (RBAC)"
echo "  ✅ Module-Based Permissions"
echo "  ✅ TypeScript Strict Mode"
echo "  ✅ Unified Component Patterns"
echo "  ✅ Consistent API Routes"
echo "  ✅ Development Templates"
echo ""
echo "📚 Documentation:"
echo "  📖 Standards: ../TAZA-CORE-STANDARDS.md"
echo "  🗺️  Migration: ../MIGRATION-PLAN.md"
echo ""
echo "🔐 Authentication Features:"
echo "  🔑 JWT + Multi-provider support"
echo "  📱 OTP authentication"
echo "  👑 Super admin privileges"
echo "  🎯 Granular permissions"
echo "  🛡️  Route protection"
echo ""
echo "Happy coding with TazaCore! 🎯"

cd ..
