#!/bin/bash

# TazaCore Deployment Troubleshooting Script
# Addresses common deployment issues including routes manifest errors

set -euo pipefail

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${CYAN}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       🔧 TazaCore Deployment Fix          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo

# Function to fix routes manifest error
fix_routes_manifest() {
    log "Fixing routes manifest error..."
    
    cd site || error "Cannot navigate to site directory"
    
    # Remove problematic cache files
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Check if next-pwa is causing issues
    if grep -q "next-pwa" package.json; then
        log "Detected next-pwa configuration..."
        
        # Temporarily disable PWA for development
        if [ "${NODE_ENV:-development}" = "development" ]; then
            warning "Disabling PWA for development environment"
            export DISABLE_PWA=true
        fi
    fi
    
    # Reinstall dependencies to fix any corruption
    log "Reinstalling dependencies..."
    if command -v bun &> /dev/null; then
        bun install --force
    else
        rm -rf node_modules package-lock.json
        npm install
    fi
    
    success "Routes manifest fix applied"
    cd ..
}

# Function to check and fix common deployment issues
check_deployment_issues() {
    log "Checking for common deployment issues..."
    
    # Check Node.js version
    node_version=$(node --version | sed 's/v//')
    log "Node.js version: $node_version"
    
    # Check if required files exist
    required_files=(
        "site/package.json"
        "site/next.config.ts"
        "docker-compose.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            success "Found: $file"
        else
            warning "Missing: $file"
        fi
    done
    
    # Check for port conflicts
    if command -v lsof &> /dev/null; then
        if lsof -i :3000 &>/dev/null; then
            warning "Port 3000 is already in use"
            log "Processes using port 3000:"
            lsof -i :3000 || true
        else
            success "Port 3000 is available"
        fi
    fi
}

# Function to fix permission issues
fix_permissions() {
    log "Fixing file permissions..."
    
    # Make shell scripts executable
    find . -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    
    # Fix node_modules permissions if they exist
    if [ -d "site/node_modules" ]; then
        chmod -R 755 site/node_modules 2>/dev/null || true
    fi
    
    success "Permissions fixed"
}

# Function to clean and rebuild
clean_rebuild() {
    log "Performing clean rebuild..."
    
    cd site || error "Cannot navigate to site directory"
    
    # Clean all build artifacts
    rm -rf .next dist build out 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Clean Prisma generated files
    rm -rf prisma/generated 2>/dev/null || true
    
    # Regenerate Prisma client
    if [ -f "prisma/schema.prisma" ]; then
        log "Regenerating Prisma client..."
        if command -v bun &> /dev/null; then
            bun prisma generate
        else
            npx prisma generate
        fi
    fi
    
    # Build the application
    log "Building application..."
    if command -v bun &> /dev/null; then
        bun run build
    else
        npm run build
    fi
    
    success "Clean rebuild completed"
    cd ..
}

# Function to test startup
test_startup() {
    log "Testing application startup..."
    
    cd site || error "Cannot navigate to site directory"
    
    # Try to start the application in background for testing
    log "Starting application for testing..."
    
    if command -v bun &> /dev/null; then
        timeout 30s bun start &
    else
        timeout 30s npm start &
    fi
    
    APP_PID=$!
    sleep 5
    
    # Check if the process is still running
    if kill -0 $APP_PID 2>/dev/null; then
        success "Application started successfully"
        kill $APP_PID 2>/dev/null || true
    else
        warning "Application failed to start or crashed"
    fi
    
    cd ..
}

# Main execution
main() {
    log "Starting TazaCore deployment troubleshooting..."
    
    check_deployment_issues
    fix_permissions
    fix_routes_manifest
    clean_rebuild
    test_startup
    
    echo
    success "🎉 Deployment troubleshooting completed!"
    echo
    log "If you're still experiencing issues:"
    log "1. Check the error logs: docker-compose logs site"
    log "2. Verify environment variables in .env files"
    log "3. Ensure database is accessible if using one"
    log "4. Try: ./scripts/fix-site-startup.sh for additional fixes"
}

# Run main function
main "$@"
