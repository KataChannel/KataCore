#!/bin/bash

# 🧹 TazaCore Project Cleanup Script
# Removes duplicate and unnecessary files to keep the project clean

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Show banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🧹 TazaCore Project Cleanup                          ║
║                                                                              ║
║    Removing duplicate files and organizing project structure                ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Files to remove (duplicates and unnecessary files)
declare -a FILES_TO_REMOVE=(
    "deploy-remote copy.sh"
    "deploy-remote.sh.backup"
    "deploy-remote1.sh"
    "quick-deploy-fixed.sh" 
    "quick-deploy.sh"
    "deploy-with-default.sh"
)

# Empty directories to remove
declare -a DIRS_TO_REMOVE=(
    "deployment/api"
    "deployment/configs"
    "deployment/docker"
    "deployment/docs"
    "deployment/environments"
    "deployment/examples"
    "deployment/guides"
    "deployment/maintenance"
    "deployment/nginx"
    "deployment/setup"
    "deployment/templates"
    "deployment/testing"
    "configs/api"
    "configs/configs"
    "configs/examples"
    "configs/guides"
    "configs/maintenance"
    "configs/nginx"
    "configs/scripts"
    "configs/setup"
    "configs/templates"
    "configs/testing"
    "scripts/api"
    "scripts/configs"
    "scripts/docker"
    "scripts/environments"
    "scripts/examples"
    "scripts/guides"
    "scripts/nginx"
    "scripts/scripts"
    "scripts/templates"
)

main() {
    show_banner
    
    log "Starting project cleanup..."
    
    # Remove duplicate files
    info "Removing duplicate and unnecessary files..."
    for file in "${FILES_TO_REMOVE[@]}"; do
        if [[ -f "$file" ]]; then
            rm "$file"
            success "Removed: $file"
        else
            warning "File not found: $file"
        fi
    done
    
    # Remove empty directories
    info "Removing empty directories..."
    for dir in "${DIRS_TO_REMOVE[@]}"; do
        if [[ -d "$dir" ]] && [[ -z "$(ls -A "$dir" 2>/dev/null)" ]]; then
            rmdir "$dir"
            success "Removed empty directory: $dir"
        elif [[ -d "$dir" ]]; then
            warning "Directory not empty, skipping: $dir"
        fi
    done
    
    # Create organized structure
    info "Organizing project structure..."
    
    # Ensure main directories exist
    mkdir -p {docs,scripts,configs}/deployment
    mkdir -p docs/{api,guides,troubleshooting}
    mkdir -p scripts/{maintenance,setup,testing}
    mkdir -p configs/{environments,docker}
    
    success "Project structure organized"
    
    # Show final structure
    info "Final project structure:"
    echo -e "${BLUE}Main Scripts:${NC}"
    echo "  📜 autopush.sh - Git automation"
    echo "  🚀 deploy-remote.sh - Main deployment script"
    echo "  🔗 deploy-production.sh -> deployment/scripts/deploy-production.sh"
    echo "  🔗 deploy-wizard.sh -> deployment/scripts/deploy-wizard.sh"
    echo "  🔗 quick-deploy-enhanced.sh -> deployment/scripts/quick-deploy-enhanced.sh"
    echo ""
    
    echo -e "${BLUE}Documentation:${NC}"
    echo "  📖 README.md - Main project documentation"
    echo "  🚀 DEPLOYMENT-README.md - Deployment guide"
    echo "  🔄 AUTOPUSH-README.md - AutoPush documentation"
    echo "  📚 docs/ - Comprehensive documentation"
    echo ""
    
    echo -e "${BLUE}Key Directories:${NC}"
    echo "  📁 api/ - Backend NestJS application"
    echo "  📁 site/ - Frontend Next.js application"
    echo "  📁 deployment/ - Deployment scripts and configs"
    echo "  📁 scripts/ - Utility and maintenance scripts"
    echo "  📁 configs/ - Configuration files"
    echo "  📁 docs/ - Project documentation"
    echo ""
    
    success "🎉 Project cleanup completed successfully!"
    info "Project is now organized and ready for development"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h      Show this help message"
    echo "  --dry-run       Show what would be removed without actually removing"
    echo ""
    echo "This script removes duplicate files and organizes the project structure."
}

# Parse arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --dry-run)
        echo "DRY RUN MODE - No files will be removed"
        echo ""
        echo "Files that would be removed:"
        for file in "${FILES_TO_REMOVE[@]}"; do
            if [[ -f "$file" ]]; then
                echo "  - $file"
            fi
        done
        echo ""
        echo "Directories that would be removed:"
        for dir in "${DIRS_TO_REMOVE[@]}"; do
            if [[ -d "$dir" ]] && [[ -z "$(ls -A "$dir" 2>/dev/null)" ]]; then
                echo "  - $dir"
            fi
        done
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
