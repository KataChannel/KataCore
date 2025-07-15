#!/bin/bash

# TazaCore Super Administrator Setup Script
# This script sets up a Super Administrator with full permissions

echo "🚀 TazaCore Super Administrator Setup"
echo "====================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the site directory"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if TypeScript is available
if ! npx tsc --version &> /dev/null; then
    echo "📦 Installing TypeScript..."
    npm install -g typescript ts-node
fi

# Run the setup script
echo "🔧 Running Super Administrator setup..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure your database connection is configured."
    echo "📝 You may need to create a .env file with DATABASE_URL and other required variables."
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Run the TypeScript setup script
npx ts-node scripts/setup-super-admin.ts

# Check the exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Super Administrator setup completed successfully!"
    echo ""
    echo "🔗 Quick Links:"
    echo "• Admin Dashboard: http://localhost:3000/admin"
    echo "• Permission Management: http://localhost:3000/admin/permissions"
    echo "• User Management: http://localhost:3000/admin/permissions"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Start your development server: npm run dev"
    echo "2. Navigate to http://localhost:3000/admin"
    echo "3. Login with the credentials shown above"
    echo "4. Change the default password immediately"
    echo "5. Set up additional users and permissions"
    echo ""
    echo "🔐 Security Reminders:"
    echo "• Change the default password immediately"
    echo "• Never share Super Admin credentials"
    echo "• Regularly review user permissions"
    echo "• Monitor system access logs"
else
    echo ""
    echo "❌ Super Administrator setup failed!"
    echo "Please check the error messages above and try again."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Ensure your database is running and accessible"
    echo "2. Check your .env file configuration"
    echo "3. Verify all dependencies are installed"
    echo "4. Check the logs for specific error messages"
    exit 1
fi
