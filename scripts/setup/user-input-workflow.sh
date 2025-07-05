#!/bin/bash

# 🎯 KataCore User Input Workflow Manager
# Manages user input flows for different deployment scenarios

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly WORKFLOWS_DIR="$SCRIPT_DIR/workflows"
readonly CONFIGS_DIR="$SCRIPT_DIR/../../configs"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# User input functions
prompt_input() {
    local prompt="$1"
    local default="$2"
    local validation="${3:-}"
    local value
    
    while true; do
        echo -ne "${CYAN}$prompt${NC}"
        if [[ -n "$default" ]]; then
            echo -ne " ${YELLOW}[$default]${NC}"
        fi
        echo -n ": "
        
        read -r value
        value="${value:-$default}"
        
        # Validation
        if [[ -n "$validation" ]]; then
            if eval "$validation '$value'"; then
                echo "$value"
                return 0
            else
                error "Invalid input. Please try again."
                continue
            fi
        fi
        
        echo "$value"
        return 0
    done
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

# Validation functions
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

validate_email() {
    local email="$1"
    if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_path() {
    local path="$1"
    if [[ -n "$path" ]] && [[ "$path" =~ ^[a-zA-Z0-9/_.-]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Workflow definitions
workflow_first_time_setup() {
    log "🎯 First-Time Setup Workflow"
    
    echo -e "${BLUE}Welcome to KataCore! Let's get you set up.${NC}"
    echo "This workflow will help you configure your first deployment."
    echo ""
    
    # Environment
    ENVIRONMENT=$(prompt_select "What type of environment are you setting up?" \
        "Development (local testing)" \
        "Staging (pre-production)" \
        "Production (live environment)")
    
    case "$ENVIRONMENT" in
        *"Development"*) ENV_KEY="dev" ;;
        *"Staging"*) ENV_KEY="staging" ;;
        *"Production"*) ENV_KEY="prod" ;;
    esac
    
    # Server details
    echo ""
    echo -e "${BLUE}📍 Server Configuration${NC}"
    SERVER_IP=$(prompt_input "Enter your server IP address" "" "validate_ip")
    SSH_USER=$(prompt_input "SSH username" "root")
    
    # Domain setup
    echo ""
    HAS_DOMAIN=$(prompt_yes_no "Do you have a domain name for this server?" "n")
    
    if [[ "$HAS_DOMAIN" == "true" ]]; then
        DOMAIN=$(prompt_input "Enter your domain name" "" "validate_domain")
        DEPLOY_TYPE="full"
        ENABLE_SSL=$(prompt_yes_no "Enable SSL certificates?" "y")
        if [[ "$ENABLE_SSL" == "true" ]]; then
            SSL_EMAIL=$(prompt_input "Email for SSL certificates" "admin@$DOMAIN" "validate_email")
        fi
    else
        DOMAIN="$SERVER_IP"
        DEPLOY_TYPE="simple"
        ENABLE_SSL="false"
        info "Using IP-based deployment (no SSL)"
    fi
    
    # SSH key setup
    echo ""
    echo -e "${BLUE}🔐 SSH Key Configuration${NC}"
    DEFAULT_KEY="$HOME/.ssh/id_rsa"
    
    if [[ -f "$DEFAULT_KEY" ]]; then
        USE_EXISTING=$(prompt_yes_no "Use existing SSH key at $DEFAULT_KEY?" "y")
        if [[ "$USE_EXISTING" == "true" ]]; then
            SSH_KEY_PATH="$DEFAULT_KEY"
        else
            SSH_KEY_PATH=$(prompt_input "Path for new SSH key" "$HOME/.ssh/katacore-$ENV_KEY" "validate_path")
            GENERATE_KEY="true"
        fi
    else
        SSH_KEY_PATH=$(prompt_input "Path for new SSH key" "$HOME/.ssh/katacore-$ENV_KEY" "validate_path")
        GENERATE_KEY="true"
    fi
    
    # Project configuration
    echo ""
    echo -e "${BLUE}📦 Project Configuration${NC}"
    PROJECT_NAME=$(prompt_input "Project name" "katacore")
    
    # Services selection
    echo ""
    echo -e "${BLUE}🛠️ Services Selection${NC}"
    echo "Select which services you want to install:"
    
    INSTALL_API=$(prompt_yes_no "API service (backend)" "y")
    INSTALL_POSTGRES=$(prompt_yes_no "PostgreSQL database" "y")
    INSTALL_REDIS=$(prompt_yes_no "Redis cache" "y")
    INSTALL_MINIO=$(prompt_yes_no "MinIO object storage" "y")
    
    if [[ "$ENV_KEY" == "dev" ]]; then
        INSTALL_PGADMIN=$(prompt_yes_no "pgAdmin (database management)" "y")
    else
        INSTALL_PGADMIN=$(prompt_yes_no "pgAdmin (database management)" "n")
    fi
    
    # Output configuration
    output_configuration "$ENV_KEY"
}

workflow_quick_deploy() {
    log "🚀 Quick Deploy Workflow"
    
    echo -e "${BLUE}Quick deployment for existing configurations.${NC}"
    echo ""
    
    # Select existing environment
    local env_files=($(ls "$CONFIGS_DIR/environments/"*.conf 2>/dev/null | xargs -n1 basename | sed 's/.conf$//' || echo ""))
    
    if [[ ${#env_files[@]} -eq 0 ]]; then
        warning "No existing configurations found. Running first-time setup..."
        workflow_first_time_setup
        return
    fi
    
    echo -e "${CYAN}Available environments:${NC}"
    for i in "${!env_files[@]}"; do
        echo -e "  ${YELLOW}$((i+1))${NC}) ${env_files[$i]}"
    done
    
    while true; do
        echo -ne "${CYAN}Select environment [1-${#env_files[@]}]${NC}: "
        read -r choice
        
        if [[ "$choice" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#env_files[@]} )); then
            ENV_KEY="${env_files[$((choice-1))]}"
            break
        else
            echo -e "${RED}Invalid selection. Please choose 1-${#env_files[@]}${NC}"
        fi
    done
    
    # Load and display configuration
    source "$CONFIGS_DIR/environments/$ENV_KEY.conf"
    
    echo ""
    echo -e "${CYAN}Configuration for $ENV_KEY:${NC}"
    echo -e "  Server: $SERVER_IP"
    echo -e "  Domain: $DOMAIN"
    echo -e "  Type: $DEPLOY_TYPE"
    echo ""
    
    CONFIRM=$(prompt_yes_no "Deploy with this configuration?" "y")
    if [[ "$CONFIRM" != "true" ]]; then
        warning "Deployment cancelled"
        exit 0
    fi
}

workflow_custom_deploy() {
    log "⚙️ Custom Deploy Workflow"
    
    echo -e "${BLUE}Custom deployment with manual configuration.${NC}"
    echo ""
    
    # Basic configuration
    SERVER_IP=$(prompt_input "Server IP address" "" "validate_ip")
    SSH_USER=$(prompt_input "SSH username" "root")
    
    # Deployment type
    DEPLOY_TYPE=$(prompt_select "Deployment type:" "Simple (IP-based)" "Full (Domain with SSL)")
    
    if [[ "$DEPLOY_TYPE" == "Full (Domain with SSL)" ]]; then
        DEPLOY_TYPE="full"
        DOMAIN=$(prompt_input "Domain name" "" "validate_domain")
        SSL_EMAIL=$(prompt_input "Email for SSL certificates" "admin@$DOMAIN" "validate_email")
        ENABLE_SSL="true"
    else
        DEPLOY_TYPE="simple"
        DOMAIN="$SERVER_IP"
        ENABLE_SSL="false"
    fi
    
    # SSH key
    SSH_KEY_PATH=$(prompt_input "SSH key path" "$HOME/.ssh/id_rsa" "validate_path")
    
    # Project name
    PROJECT_NAME=$(prompt_input "Project name" "katacore")
    
    # Docker Compose file
    DOCKER_COMPOSE_FILE=$(prompt_select "Docker Compose configuration:" \
        "docker-compose.yml (Standard)" \
        "docker-compose.startkitv1.yml (Full Stack)" \
        "docker-compose.simple.yml (Minimal)")
    
    case "$DOCKER_COMPOSE_FILE" in
        *"Standard"*) DOCKER_COMPOSE_FILE="docker-compose.yml" ;;
        *"Full Stack"*) DOCKER_COMPOSE_FILE="docker-compose.startkitv1.yml" ;;
        *"Minimal"*) DOCKER_COMPOSE_FILE="docker-compose.simple.yml" ;;
    esac
    
    # Services
    INSTALL_API="true"
    INSTALL_POSTGRES=$(prompt_yes_no "Install PostgreSQL?" "y")
    INSTALL_REDIS=$(prompt_yes_no "Install Redis?" "y")
    INSTALL_MINIO=$(prompt_yes_no "Install MinIO?" "y")
    INSTALL_PGADMIN=$(prompt_yes_no "Install pgAdmin?" "n")
    
    # Output configuration
    ENV_KEY="custom"
    output_configuration "$ENV_KEY"
}

output_configuration() {
    local env_key="$1"
    
    echo ""
    echo -e "${CYAN}📋 Configuration Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "📍 Server IP:          $SERVER_IP"
    echo -e "🌍 Domain:             $DOMAIN"
    echo -e "🚀 Deployment Type:    $DEPLOY_TYPE"
    echo -e "👤 SSH User:           $SSH_USER"
    echo -e "🔐 SSH Key:            $SSH_KEY_PATH"
    echo -e "📦 Project Name:       $PROJECT_NAME"
    echo -e "🐳 Docker Compose:     ${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
    echo -e "🔒 SSL Enabled:        ${ENABLE_SSL:-false}"
    
    if [[ "${INSTALL_API:-}" == "true" ]]; then echo -e "  ✅ API Service"; else echo -e "  ❌ API Service"; fi
    if [[ "${INSTALL_POSTGRES:-}" == "true" ]]; then echo -e "  ✅ PostgreSQL"; else echo -e "  ❌ PostgreSQL"; fi
    if [[ "${INSTALL_REDIS:-}" == "true" ]]; then echo -e "  ✅ Redis"; else echo -e "  ❌ Redis"; fi
    if [[ "${INSTALL_MINIO:-}" == "true" ]]; then echo -e "  ✅ MinIO"; else echo -e "  ❌ MinIO"; fi
    if [[ "${INSTALL_PGADMIN:-}" == "true" ]]; then echo -e "  ✅ pgAdmin"; else echo -e "  ❌ pgAdmin"; fi
    
    echo ""
    
    # Save configuration
    SAVE_CONFIG=$(prompt_yes_no "Save this configuration for future use?" "y")
    
    if [[ "$SAVE_CONFIG" == "true" ]]; then
        save_workflow_config "$env_key"
        success "Configuration saved to configs/environments/$env_key.conf"
    fi
    
    # Deploy now
    DEPLOY_NOW=$(prompt_yes_no "Start deployment now?" "y")
    
    if [[ "$DEPLOY_NOW" == "true" ]]; then
        info "Starting deployment..."
        # Export variables for the deployment script
        export SERVER_IP DOMAIN SSH_USER SSH_KEY_PATH DEPLOY_TYPE PROJECT_NAME
        export DOCKER_COMPOSE_FILE ENABLE_SSL SSL_EMAIL
        export INSTALL_API INSTALL_POSTGRES INSTALL_REDIS INSTALL_MINIO INSTALL_PGADMIN
        
        # Call the main deployment script
        "$SCRIPT_DIR/../../deploy.sh" deploy
    else
        info "Configuration ready. Run './deploy.sh deploy --env $env_key' to deploy."
    fi
}

save_workflow_config() {
    local env_key="$1"
    local config_file="$CONFIGS_DIR/environments/$env_key.conf"
    
    mkdir -p "$(dirname "$config_file")"
    
    cat > "$config_file" << EOF
# KataCore Environment Configuration: $env_key
# Generated on $(date)

# Server Configuration
SERVER_IP="$SERVER_IP"
DOMAIN="$DOMAIN"
SSH_USER="$SSH_USER"
SSH_KEY_PATH="$SSH_KEY_PATH"

# Deployment Configuration
DEPLOY_TYPE="$DEPLOY_TYPE"
PROJECT_NAME="$PROJECT_NAME"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"

# Feature Flags
INSTALL_API="${INSTALL_API:-true}"
INSTALL_POSTGRES="${INSTALL_POSTGRES:-true}"
INSTALL_REDIS="${INSTALL_REDIS:-true}"
INSTALL_MINIO="${INSTALL_MINIO:-true}"
INSTALL_PGADMIN="${INSTALL_PGADMIN:-false}"

# SSL Configuration
ENABLE_SSL="${ENABLE_SSL:-false}"
SSL_EMAIL="${SSL_EMAIL:-}"

# Additional Configuration
BACKUP_ENABLED="true"
BACKUP_RETENTION_DAYS="7"
EOF
}

show_help() {
    cat << 'EOF'
KataCore User Input Workflow Manager

USAGE:
    ./user-input-workflow.sh [WORKFLOW]

WORKFLOWS:
    first-time      🎯 First-time setup wizard (recommended for new users)
    quick           🚀 Quick deploy using existing configurations
    custom          ⚙️ Custom deployment with manual configuration
    
If no workflow is specified, you'll be prompted to choose one.

EXAMPLES:
    # Run first-time setup
    ./user-input-workflow.sh first-time
    
    # Quick deployment
    ./user-input-workflow.sh quick
    
    # Custom configuration
    ./user-input-workflow.sh custom

EOF
}

# Main function
main() {
    local workflow="${1:-}"
    
    case "$workflow" in
        first-time|first)
            workflow_first_time_setup
            ;;
        quick)
            workflow_quick_deploy
            ;;
        custom)
            workflow_custom_deploy
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            # Interactive workflow selection
            echo -e "${BLUE}🎯 KataCore User Input Workflow Manager${NC}"
            echo ""
            
            WORKFLOW=$(prompt_select "Select a workflow:" \
                "First-time setup (recommended for new users)" \
                "Quick deploy (use existing configuration)" \
                "Custom deployment (manual configuration)")
            
            case "$WORKFLOW" in
                *"First-time"*) workflow_first_time_setup ;;
                *"Quick"*) workflow_quick_deploy ;;
                *"Custom"*) workflow_custom_deploy ;;
            esac
            ;;
        *)
            error "Unknown workflow: $workflow"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
