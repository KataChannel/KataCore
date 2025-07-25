#!/bin/bash

# 🚀 Quick Performance Test Script
# Tests the optimized startup configuration

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════╗
║   🚀 Quick Startup Performance Test  ║
╚══════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

main() {
    show_banner
    
    log "Loading optimization environment..."
    source .env.optimization 2>/dev/null || true
    
    log "Starting optimized Next.js server..."
    info "Configuration:"
    echo "  • NODE_OPTIONS: $NODE_OPTIONS"
    echo "  • NEXT_TELEMETRY_DISABLED: $NEXT_TELEMETRY_DISABLED"
    
    echo
    log "Testing optimized startup speed..."
    echo "Command: cd site && bun run start:optimized"
    echo
    
    time (cd site && bun run start:optimized)
}

main "$@"
