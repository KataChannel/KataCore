#!/bin/bash

# 🚀 Quick Start Script with Performance Optimization
# Version: 1.0.0

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚀 TazaCore Quick Start (Optimized)                    ║
║                                                                              ║
║    Fast development startup with performance optimizations                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

main() {
    show_banner
    
    log "Starting TazaCore with performance optimizations..."
    
    # Check if performance env exists and source it
    if [[ -f "site/.env.performance" ]]; then
        info "Loading performance environment variables..."
        export $(cat site/.env.performance | grep -v '^#' | xargs)
    fi
    
    # Quick database check
    if ! docker ps | grep -q postgres; then
        info "Starting database services..."
        bun run docker:up
        sleep 3
    fi
    
    # Generate Prisma client if needed
    if [[ ! -d "site/node_modules/@prisma/client" ]]; then
        log "Generating Prisma client..."
        bun run db:generate
    fi
    
    # Start with optimized configuration
    info "Starting development server with optimizations..."
    exec bun run start:fast
}

main "$@"
