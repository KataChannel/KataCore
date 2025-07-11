#!/bin/bash

echo "🔧 Deployment Troubleshooting Script"
echo "=================================="

# Check current directory
echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

# Check if we're in a git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository detected"
    echo "📍 Current branch: $(git branch --show-current)"
    echo "📊 Git status:"
    git status --short
else
    echo "❌ Not in a git repository"
    echo "💡 Run: git init && git remote add origin <your-repo-url>"
fi

# Check for required files
echo ""
echo "🔍 Checking required files:"
for file in "docker-compose.yml" ".env.prod" "sh/3pushauto.sh"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check SSH connectivity (if server IP is provided)
echo ""
echo "🌐 Network connectivity test:"
if [ -n "$1" ]; then
    echo "Testing connection to $1..."
    if ping -c 1 "$1" >/dev/null 2>&1; then
        echo "✅ Server is reachable"
    else
        echo "❌ Cannot reach server"
    fi
else
    echo "💡 Usage: ./troubleshoot.sh <server-ip> to test connectivity"
fi

echo ""
echo "🔧 Common fixes:"
echo "1. Make script executable: chmod +x sh/3pushauto.sh"
echo "2. Install missing tools: apt-get install git ssh rsync docker.io"
echo "3. Setup SSH key: ssh-copy-id root@your-server-ip"
echo "4. Check .env.prod file exists and has correct variables"
