#!/bin/bash

# KataCore Master Deployment Script
# This script provides a unified interface for all deployment operations
# Author: KataCore Team
# Version: 1.0.0
# Last Updated: January 2024

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
SCRIPTS_DIR="$DEPLOYMENT_DIR/scripts"
CONFIGS_DIR="$DEPLOYMENT_DIR/configs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
SHIELD="🛡️"

# Configuration
VERSION="1.0.0"
DEFAULT_ENV="production"
DEFAULT_CONFIG="default"

# Help function
show_help() {
    cat << EOF
${CYAN}
╔═══════════════════════════════════════════════════════════╗
║                    KataCore Deployment                    ║
║                     Master Script                        ║
╚═══════════════════════════════════════════════════════════╝
${NC}

${BLUE}USAGE:${NC}
    $0 <command> [options]

${BLUE}COMMANDS:${NC}
    ${GREEN}setup${NC}           Interactive setup wizard
    ${GREEN}deploy${NC}          Deploy application
    ${GREEN}status${NC}          Check deployment status
    ${GREEN}logs${NC}            View application logs
    ${GREEN}restart${NC}         Restart services
    ${GREEN}backup${NC}          Create backup
    ${GREEN}restore${NC}         Restore from backup
    ${GREEN}update${NC}          Update application
    ${GREEN}rollback${NC}        Rollback to previous version
    ${GREEN}health${NC}          Check system health
    ${GREEN}monitor${NC}         Monitor system performance
    ${GREEN}cleanup${NC}         Clean up old deployments
    ${GREEN}config${NC}          Manage configuration
    ${GREEN}ssl${NC}             SSL/TLS certificate management
    ${GREEN}maintenance${NC}     Maintenance mode operations
    ${GREEN}help${NC}            Show this help message

${BLUE}DEPLOY OPTIONS:${NC}
    -e, --env <env>         Environment (dev/staging/prod)
    -s, --server <ip>       Server IP address
    -u, --user <user>       SSH username
    -d, --domain <domain>   Domain name
    -k, --key <path>        SSH key path
    -t, --type <type>       Deployment type (simple/full/cluster)
    -c, --config <config>   Configuration file
    -f, --force             Force deployment
    -v, --verbose           Verbose output
    -h, --help              Show help

${BLUE}EXAMPLES:${NC}
    ${YELLOW}# Interactive setup${NC}
    $0 setup

    ${YELLOW}# Quick deployment${NC}
    $0 deploy --env prod --server 192.168.1.100

    ${YELLOW}# Full deployment with custom config${NC}
    $0 deploy --env prod --server 192.168.1.100 --domain app.example.com --type full

    ${YELLOW}# Check deployment status${NC}
    $0 status --env prod

    ${YELLOW}# View logs${NC}
    $0 logs --env prod --tail 100

    ${YELLOW}# Create backup${NC}
    $0 backup --env prod --type full

    ${YELLOW}# Enable maintenance mode${NC}
    $0 maintenance enable --message "Scheduled maintenance"

${BLUE}SUPPORT:${NC}
    📧 Email: deploy-support@katacore.com
    📚 Docs:  https://docs.katacore.com/deployment
    💬 Chat:  https://discord.gg/katacore

EOF
}
    ./deploy.sh production --ssl         # Production with SSL
    ./deploy.sh wizard                   # Interactive deployment
    ./deploy.sh cleanup                  # Clean up deployment

For more information, visit: https://docs.katacore.com
EOF
}

# Main function
main() {
    cd "$PROJECT_ROOT"
    
    case "${1:-help}" in
        local)
            log "Starting local deployment..."
            exec bun run docker:up
            ;;
        remote)
            log "Starting remote deployment..."
            exec ./deployment/scripts/deploy-remote-fixed.sh "${@:2}"
            ;;
        production)
            log "Starting production deployment..."
            exec ./deployment/scripts/deploy-production.sh "${@:2}"
            ;;
        staging)
            log "Starting staging deployment..."
            exec ./deployment/scripts/deploy-production.sh --mode staging "${@:2}"
            ;;
        development)
            log "Starting development deployment..."
            exec ./deployment/scripts/deploy-production.sh --mode development "${@:2}"
            ;;
        wizard)
            log "Starting deployment wizard..."
            exec ./deployment/scripts/deploy-wizard.sh
            ;;
        cleanup)
            log "Starting cleanup..."
            exec ./deployment/scripts/deploy-remote-fixed.sh --cleanup "${@:2}"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: ${1:-}"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
