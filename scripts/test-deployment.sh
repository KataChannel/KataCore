#!/bin/bash

# 🧪 Innerbright Deployment Test Script
# Test various deployment scenarios

set -euo pipefail

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🧪 Innerbright Deployment Test Suite                     ║
║                                                                              ║
║               Test deployment script functionality                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Test deployment script help
test_help() {
    log "Testing deployment script help..."
    
    if ./deploy-remote.sh --help >/dev/null 2>&1; then
        success "Help command works correctly"
    else
        error "Help command failed"
    fi
}

# Test deployment script syntax
test_syntax() {
    log "Testing deployment script syntax..."
    
    if bash -n deploy-remote.sh; then
        success "Deployment script syntax is valid"
    else
        error "Deployment script has syntax errors"
    fi
}

# Test docker-compose file syntax
test_docker_compose() {
    log "Testing docker-compose file syntax..."
    
    if docker-compose -f docker-compose.yml config >/dev/null 2>&1; then
        success "Docker compose file syntax is valid"
    else
        warning "Docker compose file syntax check failed (Docker may not be installed)"
    fi
}

# Test environment file
test_env_file() {
    log "Testing environment file template..."
    
    if [[ -f .env.prod ]]; then
        success "Environment template file exists"
    else
        error "Environment template file missing"
    fi
}

# Test project structure
test_project_structure() {
    log "Testing project structure..."
    
    local dirs=("api" "site" "api/src" "site/src")
    local files=("package.json" "README.md" "deploy-remote.sh" "docker-compose.yml")
    
    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            success "Directory $dir exists"
        else
            error "Directory $dir missing"
        fi
    done
    
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            success "File $file exists"
        else
            error "File $file missing"
        fi
    done
}

# Test package.json files
test_package_json() {
    log "Testing package.json files..."
    
    local pkg_files=("package.json" "api/package.json" "site/package.json")
    
    for pkg in "${pkg_files[@]}"; do
        if [[ -f "$pkg" ]]; then
            if cat "$pkg" | jq empty 2>/dev/null; then
                success "Package.json $pkg is valid JSON"
            else
                warning "Package.json $pkg may have invalid JSON (jq not installed or file invalid)"
            fi
        else
            error "Package.json $pkg missing"
        fi
    done
}

# Main test runner
run_tests() {
    show_banner
    
    log "Starting Innerbright deployment tests..."
    
    test_project_structure
    test_env_file
    test_syntax
    test_help
    test_docker_compose
    test_package_json
    
    success "All tests completed!"
}

# Run tests
run_tests
