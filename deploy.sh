#!/bin/bash

# 🚀 KataCore Senior-Level Deployment Orchestrator
# Production-ready deployment system with comprehensive management
# Version: 2.0.0
# Author: KataCore Team

set -euo pipefail

# ===== GLOBAL CONFIGURATION =====
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$SCRIPT_DIR"
readonly DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
readonly SCRIPTS_DIR="$PROJECT_ROOT/scripts"
readonly CONFIGS_DIR="$PROJECT_ROOT/configs"
readonly LOGS_DIR="$PROJECT_ROOT/logs"

# Version and metadata
readonly VERSION="2.0.0"
readonly BUILD_DATE="$(date '+%Y-%m-%d')"
readonly AUTHOR="KataCore Team"

# Create logs directory
mkdir -p "$LOGS_DIR"

# Logging configuration
readonly LOG_FILE="$LOGS_DIR/deployment-$(date '+%Y%m%d-%H%M%S').log"
readonly ERROR_LOG="$LOGS_DIR/deployment-errors-$(date '+%Y%m%d-%H%M%S').log"

# ===== COLOR DEFINITIONS =====
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'
readonly BOLD='\033[1m'

# ===== LOGGING FUNCTIONS =====
log_with_timestamp() {
    local level="$1"
    local message="$2"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log() { 
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

info() { 
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
    log_with_timestamp "INFO" "$1"
}

success() { 
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
    log_with_timestamp "SUCCESS" "$1"
}

warning() { 
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
    log_with_timestamp "WARNING" "$1"
}

error() { 
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE" | tee -a "$ERROR_LOG"
    log_with_timestamp "ERROR" "$1"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}🐛 $1${NC}" | tee -a "$LOG_FILE"
        log_with_timestamp "DEBUG" "$1"
    fi
}

# ===== BANNER AND HELP =====
show_banner() {
    echo -e "${BLUE}${BOLD}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 KataCore Deployment Orchestrator v2.0                 ║
║                                                                              ║
║    Senior-Level Production Deployment System                                ║
║    Comprehensive workflow with user input management                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo -e "${WHITE}Version: $VERSION | Build: $BUILD_DATE | Author: $AUTHOR${NC}"
    echo ""
}

show_help() {
    show_banner
    cat << 'EOF'
USAGE:
    ./deploy.sh [COMMAND] [OPTIONS]

COMMANDS:
    setup           🔧 Interactive setup wizard for first-time configuration
    deploy          🚀 Deploy to target environment
    update          🔄 Update existing deployment
    rollback        ⏪ Rollback to previous version
    status          📊 Check deployment status
    logs            📋 View deployment logs
    cleanup         🧹 Clean up resources
    test            🧪 Run deployment tests
    ssh-config      🔐 Configure SSH access
    health-check    ❤️  Check system health

DEPLOYMENT OPTIONS:
    --env ENV              Target environment (dev|staging|prod)
    --server SERVER_IP     Target server IP address
    --domain DOMAIN        Domain name for full deployment
    --user SSH_USER        SSH username (default: root)
    --key SSH_KEY_PATH     SSH private key path
    --compose COMPOSE_FILE Docker compose file to use
    --type TYPE            Deployment type (simple|full)
    --force                Force regeneration of configs
    --dry-run              Show what would be deployed without executing
    --interactive          Enable interactive mode
    --debug                Enable debug logging

EXAMPLES:
    # First-time setup
    ./deploy.sh setup

    # Interactive deployment
    ./deploy.sh deploy --interactive

    # Production deployment
    ./deploy.sh deploy --env prod --server 116.118.85.41 --domain myapp.com

    # Simple development deployment
    ./deploy.sh deploy --env dev --server 192.168.1.100 --type simple

    # Check deployment status
    ./deploy.sh status --server 116.118.85.41

    # View logs
    ./deploy.sh logs --server 116.118.85.41

    # SSH configuration
    ./deploy.sh ssh-config --server 116.118.85.41 --user ubuntu

ADVANCED:
    # Dry run deployment
    ./deploy.sh deploy --dry-run --server 116.118.85.41

    # Force update with debug
    ./deploy.sh update --force --debug --server 116.118.85.41

    # Rollback deployment
    ./deploy.sh rollback --server 116.118.85.41

For detailed documentation, see docs/guides/

EOF
}

# ===== CONFIGURATION MANAGEMENT =====
load_config() {
    local env="${1:-dev}"
    local config_file="$CONFIGS_DIR/environments/$env.conf"
    
    if [[ -f "$config_file" ]]; then
        source "$config_file"
        success "Loaded configuration for environment: $env"
    else
        warning "Configuration file not found: $config_file"
        info "Using default configuration"
    fi
}

save_config() {
    local env="$1"
    local config_file="$CONFIGS_DIR/environments/$env.conf"
    
    mkdir -p "$(dirname "$config_file")"
    
    cat > "$config_file" << EOF
# KataCore Environment Configuration: $env
# Generated on $(date)

# Server Configuration
SERVER_IP="$SERVER_IP"
DOMAIN="$DOMAIN"
SSH_USER="$SSH_USER"
SSH_KEY_PATH="$SSH_KEY_PATH"

# Deployment Configuration
DEPLOY_TYPE="$DEPLOY_TYPE"
PROJECT_NAME="$PROJECT_NAME"
DOCKER_COMPOSE_FILE="$DOCKER_COMPOSE_FILE"

# Feature Flags
INSTALL_API="$INSTALL_API"
INSTALL_POSTGRES="$INSTALL_POSTGRES"
INSTALL_REDIS="$INSTALL_REDIS"
INSTALL_MINIO="$INSTALL_MINIO"
INSTALL_PGADMIN="$INSTALL_PGADMIN"

# SSL Configuration
ENABLE_SSL="$ENABLE_SSL"
SSL_EMAIL="$SSL_EMAIL"

# Backup Configuration
BACKUP_ENABLED="$BACKUP_ENABLED"
BACKUP_RETENTION_DAYS="$BACKUP_RETENTION_DAYS"
EOF

    success "Configuration saved: $config_file"
}

# ===== USER INPUT FUNCTIONS =====
prompt_input() {
    local prompt="$1"
    local default="$2"
    local value
    
    echo -ne "${CYAN}$prompt${NC}"
    if [[ -n "$default" ]]; then
        echo -ne " ${YELLOW}[$default]${NC}"
    fi
    echo -n ": "
    
    read -r value
    echo "${value:-$default}"
}

prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local response
    
    while true; do
        echo -ne "${CYAN}$prompt${NC} ${YELLOW}(y/n) [$default]${NC}: "
        read -r response
        response="${response:-$default}"
        
        case "$response" in
            [Yy]|[Yy][Ee][Ss]) echo "true"; return 0 ;;
            [Nn]|[Nn][Oo]) echo "false"; return 0 ;;
            *) echo -e "${RED}Please answer yes or no${NC}" ;;
        esac
    done
}

prompt_select() {
    local prompt="$1"
    shift
    local options=("$@")
    local i
    
    echo -e "${CYAN}$prompt${NC}"
    for i in "${!options[@]}"; do
        echo -e "  ${YELLOW}$((i+1))${NC}) ${options[$i]}"
    done
    
    while true; do
        echo -ne "${CYAN}Select option [1-${#options[@]}]${NC}: "
        read -r choice
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#options[@]} )); then
            echo "${options[$((choice-1))]}"
            return 0
        else
            echo -e "${RED}Invalid selection. Please choose 1-${#options[@]}${NC}"
        fi
    done
}

# ===== VALIDATION FUNCTIONS =====
validate_ip() {
    local ip="$1"
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_domain() {
    local domain="$1"
    if [[ $domain =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]] || validate_ip "$domain"; then
        return 0
    else
        return 1
    fi
}

validate_ssh_key() {
    local key_path="$1"
    if [[ -f "$key_path" ]]; then
        # Check if it's a valid SSH private key
        if ssh-keygen -l -f "$key_path" &>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# ===== SETUP WIZARD =====
setup_wizard() {
    show_banner
    log "🔧 Starting interactive setup wizard..."
    
    echo -e "${BOLD}${BLUE}Welcome to KataCore Setup Wizard!${NC}"
    echo "This wizard will guide you through the initial configuration."
    echo ""
    
    # Environment selection
    ENVIRONMENT=$(prompt_select "Select target environment:" "Development" "Staging" "Production")
    ENV_KEY=$(echo "$ENVIRONMENT" | tr '[:upper:]' '[:lower:]' | cut -c1-4)
    
    echo ""
    echo -e "${BLUE}📍 Server Configuration${NC}"
    
    # Server IP
    while true; do
        SERVER_IP=$(prompt_input "Enter server IP address" "")
        if validate_ip "$SERVER_IP"; then
            break
        else
            error "Invalid IP address format"
        fi
    done
    
    # Domain configuration
    echo ""
    DEPLOY_TYPE=$(prompt_select "Select deployment type:" "Simple (IP-based)" "Full (Domain with SSL)")
    
    if [[ "$DEPLOY_TYPE" == "Full (Domain with SSL)" ]]; then
        DEPLOY_TYPE="full"
        while true; do
            DOMAIN=$(prompt_input "Enter domain name" "")
            if validate_domain "$DOMAIN"; then
                break
            else
                error "Invalid domain format"
            fi
        done
        ENABLE_SSL="true"
        SSL_EMAIL=$(prompt_input "Enter email for SSL certificates" "admin@$DOMAIN")
    else
        DEPLOY_TYPE="simple"
        DOMAIN="$SERVER_IP"
        ENABLE_SSL="false"
        SSL_EMAIL=""
    fi
    
    # SSH Configuration
    echo ""
    echo -e "${BLUE}🔐 SSH Configuration${NC}"
    SSH_USER=$(prompt_input "SSH username" "root")
    
    # SSH Key handling
    DEFAULT_KEY="$HOME/.ssh/id_rsa"
    if [[ -f "$DEFAULT_KEY" ]]; then
        USE_EXISTING=$(prompt_yes_no "Use existing SSH key at $DEFAULT_KEY?" "y")
        if [[ "$USE_EXISTING" == "true" ]]; then
            SSH_KEY_PATH="$DEFAULT_KEY"
        else
            SSH_KEY_PATH=$(prompt_input "Enter SSH private key path" "$HOME/.ssh/katacore-deploy")
        fi
    else
        GENERATE_KEY=$(prompt_yes_no "Generate new SSH key?" "y")
        if [[ "$GENERATE_KEY" == "true" ]]; then
            SSH_KEY_PATH="$HOME/.ssh/katacore-deploy"
            log "Will generate SSH key during deployment"
        else
            SSH_KEY_PATH=$(prompt_input "Enter SSH private key path" "")
        fi
    fi
    
    # Project Configuration
    echo ""
    echo -e "${BLUE}📦 Project Configuration${NC}"
    PROJECT_NAME=$(prompt_input "Project name" "katacore")
    
    # Docker Compose file selection
    local compose_files=(
        "docker-compose.yml (Standard)"
        "docker-compose.startkitv1.yml (Full Stack)"
        "docker-compose.simple.yml (Minimal)"
    )
    
    COMPOSE_CHOICE=$(prompt_select "Select Docker Compose configuration:" "${compose_files[@]}")
    case "$COMPOSE_CHOICE" in
        *"Standard"*) DOCKER_COMPOSE_FILE="docker-compose.yml" ;;
        *"Full Stack"*) DOCKER_COMPOSE_FILE="docker-compose.startkitv1.yml" ;;
        *"Minimal"*) DOCKER_COMPOSE_FILE="docker-compose.simple.yml" ;;
    esac
    
    # Service Configuration
    echo ""
    echo -e "${BLUE}🛠️ Service Configuration${NC}"
    INSTALL_API=$(prompt_yes_no "Install API service?" "y")
    INSTALL_POSTGRES=$(prompt_yes_no "Install PostgreSQL database?" "y")
    INSTALL_REDIS=$(prompt_yes_no "Install Redis cache?" "y")
    INSTALL_MINIO=$(prompt_yes_no "Install MinIO object storage?" "y")
    INSTALL_PGADMIN=$(prompt_yes_no "Install pgAdmin database management?" "n")
    
    # Backup Configuration
    echo ""
    echo -e "${BLUE}💾 Backup Configuration${NC}"
    BACKUP_ENABLED=$(prompt_yes_no "Enable automated backups?" "y")
    if [[ "$BACKUP_ENABLED" == "true" ]]; then
        BACKUP_RETENTION_DAYS=$(prompt_input "Backup retention (days)" "7")
    fi
    
    # Configuration Summary
    echo ""
    echo -e "${CYAN}📋 Configuration Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🏷️  Environment:       $ENVIRONMENT"
    echo -e "📍 Server IP:          $SERVER_IP"
    echo -e "🌍 Domain:             $DOMAIN"
    echo -e "🚀 Deployment Type:    $DEPLOY_TYPE"
    echo -e "👤 SSH User:           $SSH_USER"
    echo -e "🔐 SSH Key:            $SSH_KEY_PATH"
    echo -e "📦 Project Name:       $PROJECT_NAME"
    echo -e "🐳 Docker Compose:     $DOCKER_COMPOSE_FILE"
    echo -e "🔒 SSL Enabled:        $ENABLE_SSL"
    echo -e "💾 Backup Enabled:     $BACKUP_ENABLED"
    echo ""
    
    # Confirmation
    CONFIRM=$(prompt_yes_no "Save this configuration and proceed?" "y")
    if [[ "$CONFIRM" == "true" ]]; then
        save_config "$ENV_KEY"
        success "Configuration saved successfully!"
        
        # Ask if user wants to deploy now
        DEPLOY_NOW=$(prompt_yes_no "Start deployment now?" "y")
        if [[ "$DEPLOY_NOW" == "true" ]]; then
            main_deploy
        else
            info "Configuration saved. Run './deploy.sh deploy --env $ENV_KEY' to start deployment."
        fi
    else
        warning "Setup cancelled"
        exit 0
    fi
}

# ===== DEPLOYMENT FUNCTIONS =====
main_deploy() {
    log "🚀 Starting deployment process..."
    
    # Validate configuration
    validate_deployment_config
    
    # Show deployment plan
    show_deployment_plan
    
    # Execute deployment steps
    execute_deployment
}

validate_deployment_config() {
    log "🔍 Validating deployment configuration..."
    
    local errors=0
    
    # Check required variables
    [[ -z "${SERVER_IP:-}" ]] && { error "SERVER_IP is required"; ((errors++)); }
    [[ -z "${SSH_USER:-}" ]] && { error "SSH_USER is required"; ((errors++)); }
    [[ -z "${PROJECT_NAME:-}" ]] && { error "PROJECT_NAME is required"; ((errors++)); }
    
    # Validate IP
    if [[ -n "${SERVER_IP:-}" ]] && ! validate_ip "$SERVER_IP"; then
        error "Invalid SERVER_IP format: $SERVER_IP"
        ((errors++))
    fi
    
    # Validate SSH key
    if [[ -n "${SSH_KEY_PATH:-}" ]] && [[ -f "$SSH_KEY_PATH" ]] && ! validate_ssh_key "$SSH_KEY_PATH"; then
        error "Invalid SSH key: $SSH_KEY_PATH"
        ((errors++))
    fi
    
    # Validate Docker Compose file
    if [[ -n "${DOCKER_COMPOSE_FILE:-}" ]] && [[ ! -f "$PROJECT_ROOT/$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        ((errors++))
    fi
    
    if (( errors > 0 )); then
        error "Configuration validation failed with $errors errors"
        exit 1
    fi
    
    success "Configuration validation passed"
}

show_deployment_plan() {
    echo ""
    echo -e "${CYAN}📋 Deployment Plan${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "1. 🔐 SSH Connection Setup"
    echo -e "2. 🏗️  Server Preparation"
    echo -e "3. 📤 File Transfer"
    echo -e "4. 🔧 Environment Configuration"
    echo -e "5. 🐳 Docker Deployment"
    [[ "$ENABLE_SSL" == "true" ]] && echo -e "6. 🔒 SSL Configuration"
    echo -e "7. ❤️  Health Check"
    echo -e "8. 📊 Status Report"
    echo ""
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        warning "DRY RUN MODE - No actual changes will be made"
        return 0
    fi
    
    if [[ "${INTERACTIVE:-false}" == "true" ]]; then
        PROCEED=$(prompt_yes_no "Proceed with deployment?" "y")
        if [[ "$PROCEED" != "true" ]]; then
            warning "Deployment cancelled by user"
            exit 0
        fi
    fi
}

execute_deployment() {
    local start_time=$(date +%s)
    
    log "🎬 Executing deployment steps..."
    
    # Step 1: SSH Setup
    setup_ssh_connection
    
    # Step 2: Server Preparation
    prepare_remote_server
    
    # Step 3: File Transfer
    transfer_project_files
    
    # Step 4: Environment Configuration
    configure_environment
    
    # Step 5: Docker Deployment
    deploy_docker_services
    
    # Step 6: SSL Configuration (if enabled)
    if [[ "$ENABLE_SSL" == "true" ]]; then
        configure_ssl_certificates
    fi
    
    # Step 7: Health Check
    perform_health_check
    
    # Step 8: Status Report
    generate_status_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "🎉 Deployment completed successfully in ${duration}s!"
}

# ===== SSH FUNCTIONS =====
setup_ssh_connection() {
    log "🔐 Setting up SSH connection..."
    
    # Generate SSH key if needed
    if [[ ! -f "${SSH_KEY_PATH:-}" ]]; then
        log "Generating new SSH key..."
        "$SCRIPTS_DIR/setup/generate-ssh-key.sh" "${SSH_KEY_PATH:-$HOME/.ssh/katacore-deploy}"
    fi
    
    # Test SSH connection
    if ! ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_IP" "echo 'SSH connection test successful'" &>/dev/null; then
        log "Deploying SSH key to server..."
        ssh-copy-id -i "$SSH_KEY_PATH.pub" "$SSH_USER@$SERVER_IP"
    fi
    
    success "SSH connection established"
}

# ===== MAIN COMMAND DISPATCHER =====
parse_arguments() {
    COMMAND=""
    ENVIRONMENT="dev"
    INTERACTIVE="false"
    DRY_RUN="false"
    DEBUG="false"
    FORCE="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            setup|deploy|update|rollback|status|logs|cleanup|test|ssh-config|health-check)
                COMMAND="$1"
                shift
                ;;
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --server)
                SERVER_IP="$2"
                shift 2
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --user)
                SSH_USER="$2"
                shift 2
                ;;
            --key)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            --compose)
                DOCKER_COMPOSE_FILE="$2"
                shift 2
                ;;
            --type)
                DEPLOY_TYPE="$2"
                shift 2
                ;;
            --interactive)
                INTERACTIVE="true"
                shift
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --debug)
                DEBUG="true"
                shift
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# ===== MAIN FUNCTION =====
main() {
    # Create required directories
    mkdir -p "$LOGS_DIR" "$CONFIGS_DIR/environments" "$SCRIPTS_DIR/setup"
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Load environment configuration
    load_config "$ENVIRONMENT"
    
    # Execute command
    case "${COMMAND:-help}" in
        setup)
            setup_wizard
            ;;
        deploy)
            main_deploy
            ;;
        update)
            info "Update functionality - coming soon"
            ;;
        rollback)
            info "Rollback functionality - coming soon"
            ;;
        status)
            info "Status check functionality - coming soon"
            ;;
        logs)
            info "Logs functionality - coming soon"
            ;;
        cleanup)
            info "Cleanup functionality - coming soon"
            ;;
        test)
            info "Test functionality - coming soon"
            ;;
        ssh-config)
            info "SSH config functionality - coming soon"
            ;;
        health-check)
            info "Health check functionality - coming soon"
            ;;
        help|*)
            show_help
            ;;
    esac
}

# ===== SIGNAL HANDLERS =====
cleanup_on_exit() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        error "Deployment failed with exit code: $exit_code"
        info "Check logs: $LOG_FILE"
        info "Error logs: $ERROR_LOG"
    fi
}

trap cleanup_on_exit EXIT

# ===== SCRIPT EXECUTION =====
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
