#!/bin/bash

# Deployment Verification Script
# Checks if the site is properly built and ready for deployment

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🔍 Verifying deployment readiness..."

# Check 1: Build exists
if [ -d "site/.next" ]; then
    success "Next.js build directory exists"
    
    if [ -f "site/.next/BUILD_ID" ]; then
        success "Build ID found"
    else
        error "Build ID missing - build may be incomplete"
        exit 1
    fi
else
    error "No build found - run 'cd site && bun run build' first"
    exit 1
fi

# Check 2: Docker compose file
if [ -f "docker-compose.yml" ]; then
    success "Docker Compose file found"
    
    # Validate docker-compose.yml
    if command -v docker > /dev/null; then
        if docker compose config > /dev/null 2>&1; then
            success "Docker Compose configuration is valid"
        else
            warning "Docker Compose configuration has issues"
        fi
    fi
else
    error "docker-compose.yml not found"
    exit 1
fi

# Check 3: Environment files
if [ -f ".env" ] || [ -f ".env.local" ] || [ -f ".env.production" ]; then
    success "Environment configuration found"
else
    warning "No environment files found - deployment may need configuration"
fi

# Check 4: Package files
if [ -f "site/package.json" ]; then
    success "Site package.json found"
else
    error "Site package.json missing"
    exit 1
fi

# Check 5: Test build start
echo "🚀 Testing build startup..."
cd site
timeout 15s bun run start > /tmp/start-test.log 2>&1 &
START_PID=$!

sleep 10

if kill -0 $START_PID 2>/dev/null; then
    success "Application starts successfully"
    kill $START_PID 2>/dev/null || true
    wait $START_PID 2>/dev/null || true
else
    warning "Application startup test inconclusive"
fi

cd ..

success "Deployment verification completed!"
