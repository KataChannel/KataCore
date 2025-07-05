#!/bin/bash

# 🚀 KataCore Production Deployment Script
# Professional deployment workflow for production environments
# Version: 2.0.0
# Author: KataCore Team

set -euo pipefail

# ================================
# CONFIGURATION & CONSTANTS
# ================================

readonly SCRIPT_VERSION="2.0.0"
readonly PROJECT_NAME="katacore"
readonly REQUIRED_DOCKER_VERSION="20.10.0"
readonly REQUIRED_COMPOSE_VERSION="2.0.0"

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

# Icons for better UX
readonly ICON_SUCCESS="✅"
readonly ICON_WARNING="⚠️"
readonly ICON_ERROR="❌"
readonly ICON_INFO="ℹ️"
readonly ICON_ROCKET="🚀"
readonly ICON_GEAR="⚙️"
readonly ICON_SHIELD="🔒"
readonly ICON_GLOBE="🌐"

# Default configuration
SERVER_IP=""
DOMAIN=""
SSH_USER="root"
SSH_KEY_PATH="$HOME/.ssh/default"
DEPLOY_MODE="production"
ENABLE_SSL=true
ENABLE_MONITORING=false
ENABLE_BACKUP=true
DRY_RUN=false
FORCE_REBUILD=false
SKIP_HEALTH_CHECK=false

# Service configuration
SERVICES=(postgres redis minio api site)
NGINX_SERVICES=(api pgadmin minio)

# ================================
# UTILITY FUNCTIONS
# ================================

# Logging functions with timestamps
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ${ICON_INFO} $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ${ICON_SUCCESS} $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ${ICON_WARNING} $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ${ICON_ERROR} $1${NC}" >&2
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${ICON_INFO} $1${NC}"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] [DEBUG] $1${NC}"
    fi
}

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percentage=$((current * 100 / total))
    local filled=$((percentage / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}[%s%s] %d%% - %s${NC}" \
        "$(printf "%${filled}s" | tr ' ' '█')" \
        "$(printf "%${empty}s" | tr ' ' '░')" \
        "$percentage" \
        "$description"
    
    if [[ $current -eq $total ]]; then
        echo
    fi
}

# Banner display
show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🚀 KataCore Production Deploy                        ║
║                                                                              ║
║    Professional-grade deployment system for enterprise applications         ║
║    Version: 2.0.0                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Help display
show_help() {
    cat << 'EOF'
🚀 KataCore Production Deployment Script

USAGE:
    ./deploy-production.sh [OPTIONS] <SERVER_IP> [DOMAIN]

ARGUMENTS:
    SERVER_IP        Target server IP address (required)
    DOMAIN          Domain name for SSL setup (optional)

OPTIONS:
    -u, --user USER           SSH username (default: root)
    -k, --key PATH           SSH private key path (default: ~/.ssh/default)
    -m, --mode MODE          Deployment mode: production|staging|development (default: production)
    --no-ssl                 Disable SSL certificate generation
    --enable-monitoring      Enable monitoring stack (Grafana, Prometheus)
    --enable-backup          Enable automated backup system
    --dry-run               Show what would be done without executing
    --force-rebuild         Force rebuild of all Docker images
    --skip-health-check     Skip post-deployment health checks
    --debug                 Enable debug output
    -h, --help              Show this help message
    -v, --version           Show version information

EXAMPLES:
    # Basic production deployment
    ./deploy-production.sh 192.168.1.100 example.com

    # Staging deployment without SSL
    ./deploy-production.sh --mode staging --no-ssl 192.168.1.100

    # Development deployment with monitoring
    ./deploy-production.sh --mode development --enable-monitoring 192.168.1.100

    # Dry run to see what would happen
    ./deploy-production.sh --dry-run 192.168.1.100 example.com

ENVIRONMENT VARIABLES:
    DEBUG=true              Enable debug mode
    SSH_AGENT_FORWARDING    Enable SSH agent forwarding
    DOCKER_BUILDKIT=1       Enable Docker BuildKit

For more information, visit: https://docs.kataofficial.com/deployment
EOF
}

# Version information
show_version() {
    echo "KataCore Production Deployment Script"
    echo "Version: $SCRIPT_VERSION"
    echo "Docker required: >= $REQUIRED_DOCKER_VERSION"
    echo "Docker Compose required: >= $REQUIRED_COMPOSE_VERSION"
}

# ================================
# VALIDATION FUNCTIONS
# ================================

validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        IFS='.' read -ra ADDR <<< "$ip"
        for i in "${ADDR[@]}"; do
            if [[ $i -gt 255 ]]; then
                return 1
            fi
        done
        return 0
    fi
    return 1
}

validate_domain() {
    local domain=$1
    if [[ $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
        return 0
    fi
    return 1
}

validate_ssh_key() {
    local key_path=$1
    if [[ ! -f "$key_path" ]]; then
        error "SSH key not found: $key_path"
        return 1
    fi
    
    if [[ ! -r "$key_path" ]]; then
        error "SSH key is not readable: $key_path"
        return 1
    fi
    
    # Check key format
    if ssh-keygen -l -f "$key_path" &>/dev/null; then
        return 0
    else
        error "Invalid SSH key format: $key_path"
        return 1
    fi
}

check_dependencies() {
    local missing_deps=()
    
    # Check required commands
    local required_commands=(ssh scp rsync docker curl openssl)
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        error "Please install the missing dependencies and try again"
        return 1
    fi
    
    # Check Docker version
    if command -v docker &> /dev/null; then
        local docker_version
        docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        info "Docker version: $docker_version"
    fi
    
    # Check Docker Compose
    if docker compose version &> /dev/null 2>&1; then
        local compose_version
        compose_version=$(docker compose version --short)
        info "Docker Compose version: $compose_version"
    fi
    
    return 0
}

# ================================
# ARGUMENT PARSING
# ================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--user)
                SSH_USER="$2"
                shift 2
                ;;
            -k|--key)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            -m|--mode)
                DEPLOY_MODE="$2"
                if [[ ! "$DEPLOY_MODE" =~ ^(production|staging|development)$ ]]; then
                    error "Invalid deploy mode: $DEPLOY_MODE"
                    exit 1
                fi
                shift 2
                ;;
            --no-ssl)
                ENABLE_SSL=false
                shift
                ;;
            --enable-monitoring)
                ENABLE_MONITORING=true
                shift
                ;;
            --enable-backup)
                ENABLE_BACKUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force-rebuild)
                FORCE_REBUILD=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --debug)
                DEBUG=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                show_version
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
            *)
                if [[ -z "$SERVER_IP" ]]; then
                    SERVER_IP="$1"
                elif [[ -z "$DOMAIN" ]]; then
                    DOMAIN="$1"
                else
                    error "Too many arguments"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required"
        echo "Use --help for usage information"
        exit 1
    fi
    
    if ! validate_ip "$SERVER_IP"; then
        error "Invalid IP address: $SERVER_IP"
        exit 1
    fi
    
    if [[ -n "$DOMAIN" ]] && ! validate_domain "$DOMAIN"; then
        error "Invalid domain: $DOMAIN"
        exit 1
    fi
    
    # Auto-disable SSL if no domain provided
    if [[ -z "$DOMAIN" ]]; then
        ENABLE_SSL=false
        DOMAIN="$SERVER_IP"
    fi
}

# ================================
# PRE-DEPLOYMENT CHECKS
# ================================

pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check dependencies
    if ! check_dependencies; then
        exit 1
    fi
    
    # Validate SSH key
    if ! validate_ssh_key "$SSH_KEY_PATH"; then
        exit 1
    fi
    
    # Check if we can connect to the server
    info "Testing SSH connection to $SSH_USER@$SERVER_IP..."
    if ! ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'SSH connection successful'" &>/dev/null; then
        error "Cannot connect to $SSH_USER@$SERVER_IP"
        error "Please check your SSH key and server access"
        exit 1
    fi
    success "SSH connection established"
    
    # Check project structure
    local required_files=(
        "docker-compose.yml"
        "site/package.json"
        "site/Dockerfile"
        "api/package.json"
        "api/Dockerfile"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file not found: $file"
            exit 1
        fi
    done
    success "Project structure validated"
}

# ================================
# MAIN DEPLOYMENT FUNCTIONS
# ================================

show_deployment_summary() {
    echo
    log "Deployment Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${WHITE}📍 Server IP:          ${CYAN}$SERVER_IP${NC}"
    echo -e "${WHITE}🌍 Domain:             ${CYAN}$DOMAIN${NC}"
    echo -e "${WHITE}👤 SSH User:           ${CYAN}$SSH_USER${NC}"
    echo -e "${WHITE}🔐 SSH Key:            ${CYAN}$SSH_KEY_PATH${NC}"
    echo -e "${WHITE}🚀 Deploy Mode:        ${CYAN}$DEPLOY_MODE${NC}"
    echo -e "${WHITE}🔒 SSL Enabled:        ${CYAN}$ENABLE_SSL${NC}"
    echo -e "${WHITE}📊 Monitoring:         ${CYAN}$ENABLE_MONITORING${NC}"
    echo -e "${WHITE}💾 Backup:             ${CYAN}$ENABLE_BACKUP${NC}"
    echo -e "${WHITE}🔨 Force Rebuild:      ${CYAN}$FORCE_REBUILD${NC}"
    echo -e "${WHITE}🩺 Health Check:       ${CYAN}$([ "$SKIP_HEALTH_CHECK" = "false" ] && echo "Enabled" || echo "Disabled")${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        warning "DRY RUN MODE - No actual changes will be made"
        echo
    fi
    
    read -p "Do you want to proceed with the deployment? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Deployment cancelled by user"
        exit 0
    fi
}

# ================================
# MAIN FUNCTION
# ================================

main() {
    # Show banner
    show_banner
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Show deployment summary and get confirmation
    show_deployment_summary
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "DRY RUN completed - no changes were made"
        exit 0
    fi
    
    # Start the actual deployment
    log "Starting KataCore deployment..."
    
    # Use the existing deploy-remote-fixed.sh script with our parameters
    local deploy_args=(
        --key "$SSH_KEY_PATH"
        --user "$SSH_USER"
        --project "$PROJECT_NAME"
    )
    
    if [[ "$ENABLE_SSL" == "false" ]]; then
        deploy_args+=(--simple)
    fi
    
    if [[ "$FORCE_REBUILD" == "true" ]]; then
        deploy_args+=(--force-regen)
    fi
    
    # Add services
    deploy_args+=(
        --install-api
        --install-postgres
        --install-redis
        --install-minio
        --install-pgadmin
    )
    
    # Add nginx services if SSL is enabled
    if [[ "$ENABLE_SSL" == "true" ]]; then
        deploy_args+=(
            --nginxapi
            --nginxpgadmin
            --nginxminio
        )
    fi
    
    # Execute the deployment
    exec ./deploy-remote-fixed.sh "${deploy_args[@]}" "$SERVER_IP" "$DOMAIN"
}

# Execute main function with all arguments
main "$@"
