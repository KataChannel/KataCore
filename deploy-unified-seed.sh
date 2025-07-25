#!/bin/bash

# ============================================================================
# TAZAGROUP UNIFIED SEED - PRODUCTION DEPLOYMENT SCRIPT
# ============================================================================
# Final production-ready deployment script for the unified seed system
# Use this script for clean deployment in production environments

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SITE_DIR="$SCRIPT_DIR/site"

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
separator() { echo -e "${CYAN}$1${NC}"; }

print_header() {
    separator "============================================================"
    separator "🚀 TAZAGROUP UNIFIED SEED - PRODUCTION DEPLOYMENT"
    separator "============================================================"
    echo ""
    info "Version: 4.0 - Production Ready"
    info "Status: Fully Validated & Tested"
    info "Target: Production Environment"
    echo ""
}

print_footer() {
    echo ""
    separator "============================================================"
    success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    separator "============================================================"
    echo ""
    info "🔑 SUPER ADMIN LOGIN:"
    echo -e "${CYAN}   Email: it@tazagroup.vn${NC}"
    echo -e "${CYAN}   Password: TazaGroup@2024!${NC}"
    echo -e "${CYAN}   Access Level: 10 (Full System Access)${NC}"
    echo ""
    info "📊 SYSTEM READY WITH:"
    echo -e "${CYAN}   • 10 Roles with hierarchical permissions${NC}"
    echo -e "${CYAN}   • 6 Departments (Tech, HR, Sales, Finance, Ops, QA)${NC}"
    echo -e "${CYAN}   • 13 Positions from C-level to Staff${NC}"
    echo -e "${CYAN}   • 17 Users (2 Admin + 6 Managers + 9 Employees)${NC}"
    echo -e "${CYAN}   • Complete HR system (Attendance, Leave, Payroll)${NC}"
    echo -e "${CYAN}   • Communication system (Messages, Conversations)${NC}"
    echo -e "${CYAN}   • Affiliate system (Referrals, Commissions)${NC}"
    echo ""
    separator "✨ TazaGroup is ready for production use! ✨"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "$SITE_DIR/package.json" ]; then
        error "package.json not found in site directory"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "$SITE_DIR/node_modules" ]; then
        warning "node_modules not found, installing dependencies..."
        cd "$SITE_DIR"
        npm install
    fi
    
    # Check if Prisma client is generated
    if [ ! -d "$SITE_DIR/node_modules/.prisma" ]; then
        warning "Prisma client not generated, generating now..."
        cd "$SITE_DIR"
        npx prisma generate
    fi
    
    # Check database connection
    cd "$SITE_DIR"
    if ! npx prisma db pull > /dev/null 2>&1; then
        error "Cannot connect to database. Please check DATABASE_URL in .env"
        exit 1
    fi
    
    success "All prerequisites satisfied"
}

run_deployment() {
    log "Starting unified seed deployment..."
    
    cd "$SITE_DIR"
    
    # Run the unified seed
    log "Executing unified comprehensive seed..."
    if npm run db:seed:unified; then
        success "Seed data created successfully"
    else
        error "Seed deployment failed"
        exit 1
    fi
    
    # Validate the seeded data
    log "Validating seeded data..."
    if npx tsx validate-seed-data.ts; then
        success "Data validation passed"
    else
        error "Data validation failed"
        exit 1
    fi
}

# Main execution
main() {
    print_header
    check_prerequisites
    run_deployment
    print_footer
}

# Execute main function
main "$@"
