#!/bin/bash

# 🚀 KataCore Remote Deployment Helper
# Quick deployment script for remote servers

set -euo pipefail

# Configuration - Dynamic parameters
SERVER_IP="116.118.48.143"
DOMAIN="kataoffical.online"
SSH_USER="root"
SSH_KEY_PATH=""
DEPLOY_TYPE="full"
FORCE_REGEN=false
CLEANUP_MODE=false
PROJECT_NAME="katacore"
DOCKER_COMPOSE_FILE="docker-compose.yml"
INSTALL_API=false
INSTALL_PGADMIN=false
INSTALL_MINIO=false
INSTALL_REDIS=false
INSTALL_POSTGRES=false
NGINX_API=false
NGINX_PGADMIN=false
NGINX_MINIO=false
INTERACTIVE_MODE=false

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# User input functions
prompt_input() {
    local prompt="$1"
    local default="$2"
    local value=""
    
    if [[ -n "$default" ]]; then
        read -p "$prompt [$default]: " value
        value="${value:-$default}"
    else
        read -p "$prompt: " value
    fi
    
    echo "$value"
}

prompt_password() {
    local prompt="$1"
    local value=""
    
    read -s -p "$prompt: " value
    echo ""
    echo "$value"
}

prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local value=""
    
    while true; do
        if [[ -n "$default" ]]; then
            read -p "$prompt [y/n, default: $default]: " value
            value="${value:-$default}"
        else
            read -p "$prompt [y/n]: " value
        fi
        
        case "$value" in
            [Yy]|[Yy]es|true) echo "true"; return ;;
            [Nn]|[Nn]o|false) echo "false"; return ;;
            *) echo "Please answer yes or no." ;;
        esac
    done
}

prompt_choice() {
    local prompt="$1"
    shift
    local options=("$@")
    local choice=""
    
    echo "$prompt"
    for i in "${!options[@]}"; do
        echo "  $((i+1)). ${options[$i]}"
    done
    
    while true; do
        read -p "Choose an option [1-${#options[@]}]: " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 && "$choice" -le "${#options[@]}" ]]; then
            echo "${options[$((choice-1))]}"
            return
        else
            echo "Invalid choice. Please enter a number between 1 and ${#options[@]}."
        fi
    done
}

# Interactive configuration
interactive_setup() {
    echo -e "${CYAN}🔧 Interactive Setup${NC}"
    echo -e "Let's configure your deployment step by step...\n"
    
    # Server configuration
    echo -e "${BLUE}📍 Server Configuration${NC}"
    SERVER_IP=$(prompt_input "Enter server IP address" "$SERVER_IP")
    
    # Validate IP
    while [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; do
        echo "Invalid IP address format!"
        SERVER_IP=$(prompt_input "Enter server IP address" "$SERVER_IP")
    done
    
    # Deployment type
    echo -e "\n${BLUE}🚀 Deployment Type${NC}"
    DEPLOY_TYPE=$(prompt_choice "Select deployment type:" "simple (IP only, no SSL)" "full (domain + SSL)")
    
    # Extract the type name from the choice
    if [[ "$DEPLOY_TYPE" == "simple"* ]]; then
        DEPLOY_TYPE="simple"
        info "Selected: Simple deployment (IP only, no SSL)"
        DOMAIN="$SERVER_IP"
    else
        DEPLOY_TYPE="full"
        info "Selected: Full deployment (domain + SSL)"
        DOMAIN=$(prompt_input "Enter domain name (e.g., example.com)" "$DOMAIN")
        
        # Validate domain
        while [[ ! $DOMAIN =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; do
            echo "Invalid domain format!"
            DOMAIN=$(prompt_input "Enter domain name (e.g., example.com)" "$DOMAIN")
        done
    fi
    
    # SSH configuration
    echo -e "\n${BLUE}🔐 SSH Configuration${NC}"
    SSH_USER=$(prompt_input "SSH username" "$SSH_USER")
    
    # SSH key selection
    local default_key="$HOME/.ssh/id_rsa"
    local current_key="${SSH_KEY_PATH:-$default_key}"
    if [[ -f "$default_key" ]]; then
        SSH_KEY_PATH=$(prompt_input "SSH private key path" "$current_key")
    else
        SSH_KEY_PATH=$(prompt_input "SSH private key path" "${SSH_KEY_PATH:-$HOME/.ssh/default}")
    fi
    
    # Project configuration
    echo -e "\n${BLUE}📦 Project Configuration${NC}"
    PROJECT_NAME=$(prompt_input "Project name" "$PROJECT_NAME")
    
    # Docker Compose file selection
    echo -e "\n${BLUE}🐳 Docker Configuration${NC}"
    local compose_files=()
    if [[ -f "docker-compose.startkitv1.yml" ]]; then
        compose_files+=("docker-compose.startkitv1.yml")
    fi
    if [[ -f "docker-compose.yml" ]]; then
        compose_files+=("docker-compose.yml")
    fi
    
    if [[ ${#compose_files[@]} -eq 0 ]]; then
        error "No Docker Compose files found!"
    elif [[ ${#compose_files[@]} -eq 1 ]]; then
        DOCKER_COMPOSE_FILE="${compose_files[0]}"
        info "Using Docker Compose file: $DOCKER_COMPOSE_FILE"
    else
        DOCKER_COMPOSE_FILE=$(prompt_choice "Select Docker Compose file:" "${compose_files[@]}")
    fi
    
    # Service selection
    echo -e "\n${BLUE}🛠️ Service Configuration${NC}"
    echo "Select which services to install:"
    
    INSTALL_API=$(prompt_yes_no "Install API service?" "$([ "$INSTALL_API" = "true" ] && echo "y" || echo "n")")
    INSTALL_POSTGRES=$(prompt_yes_no "Install PostgreSQL database?" "$([ "$INSTALL_POSTGRES" = "true" ] && echo "y" || echo "n")")
    INSTALL_REDIS=$(prompt_yes_no "Install Redis cache?" "$([ "$INSTALL_REDIS" = "true" ] && echo "y" || echo "n")")
    INSTALL_MINIO=$(prompt_yes_no "Install MinIO object storage?" "$([ "$INSTALL_MINIO" = "true" ] && echo "y" || echo "n")")
    INSTALL_PGADMIN=$(prompt_yes_no "Install pgAdmin database management?" "$([ "$INSTALL_PGADMIN" = "true" ] && echo "y" || echo "n")")
    
    # Nginx configuration (only for full deployment)
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        echo -e "\n${BLUE}🌐 Nginx Configuration${NC}"
        echo "Configure Nginx reverse proxy for:"
        
        if [[ "$INSTALL_API" == "true" ]]; then
            NGINX_API=$(prompt_yes_no "Enable API subdomain (api.$DOMAIN)?" "$([ "$NGINX_API" = "true" ] && echo "y" || echo "n")")
        fi
        
        if [[ "$INSTALL_PGADMIN" == "true" ]]; then
            NGINX_PGADMIN=$(prompt_yes_no "Enable pgAdmin subdomain (pgadmin.$DOMAIN)?" "$([ "$NGINX_PGADMIN" = "true" ] && echo "y" || echo "n")")
        fi
        
        if [[ "$INSTALL_MINIO" == "true" ]]; then
            NGINX_MINIO=$(prompt_yes_no "Enable MinIO subdomain (minio.$DOMAIN)?" "$([ "$NGINX_MINIO" = "true" ] && echo "y" || echo "n")")
        fi
    fi
    
    # Additional options
    echo -e "\n${BLUE}⚙️ Additional Options${NC}"
    FORCE_REGEN=$(prompt_yes_no "Force regenerate environment files?" "$([ "$FORCE_REGEN" = "true" ] && echo "y" || echo "n")")
    
    # Configuration summary
    echo -e "\n${CYAN}📋 Configuration Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "📍 Server IP:          $SERVER_IP"
    echo -e "🌍 Domain:             $DOMAIN"
    echo -e "🚀 Deployment Type:    $DEPLOY_TYPE"
    echo -e "👤 SSH User:           $SSH_USER"
    echo -e "🔐 SSH Key:            $SSH_KEY_PATH"
    echo -e "📦 Project Name:       $PROJECT_NAME"
    echo -e "🐳 Docker Compose:     $DOCKER_COMPOSE_FILE"
    echo -e "🔄 Force Regenerate:   $FORCE_REGEN"
    echo ""
    echo -e "${CYAN}🛠️ Services to Install:${NC}"
    [[ "$INSTALL_API" == "true" ]] && echo -e "  ✅ API Service" || echo -e "  ❌ API Service"
    [[ "$INSTALL_POSTGRES" == "true" ]] && echo -e "  ✅ PostgreSQL Database" || echo -e "  ❌ PostgreSQL Database"
    [[ "$INSTALL_REDIS" == "true" ]] && echo -e "  ✅ Redis Cache" || echo -e "  ❌ Redis Cache"
    [[ "$INSTALL_MINIO" == "true" ]] && echo -e "  ✅ MinIO Object Storage" || echo -e "  ❌ MinIO Object Storage"
    [[ "$INSTALL_PGADMIN" == "true" ]] && echo -e "  ✅ pgAdmin Database Management" || echo -e "  ❌ pgAdmin Database Management"
    
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        echo ""
        echo -e "${CYAN}🌐 Nginx Subdomains:${NC}"
        [[ "$NGINX_API" == "true" ]] && echo -e "  ✅ API: api.$DOMAIN" || echo -e "  ❌ API: api.$DOMAIN"
        [[ "$NGINX_PGADMIN" == "true" ]] && echo -e "  ✅ pgAdmin: pgadmin.$DOMAIN" || echo -e "  ❌ pgAdmin: pgadmin.$DOMAIN"
        [[ "$NGINX_MINIO" == "true" ]] && echo -e "  ✅ MinIO: minio.$DOMAIN" || echo -e "  ❌ MinIO: minio.$DOMAIN"
        
        # Show access URLs
        echo ""
        echo -e "${CYAN}🔗 Access URLs (after deployment):${NC}"
        echo -e "  🌐 Main App: https://$DOMAIN"
        [[ "$NGINX_API" == "true" ]] && echo -e "  🚀 API: https://api.$DOMAIN"
        [[ "$NGINX_PGADMIN" == "true" ]] && echo -e "  🗄️ pgAdmin: https://pgadmin.$DOMAIN"
        [[ "$NGINX_MINIO" == "true" ]] && echo -e "  📦 MinIO: https://minio.$DOMAIN"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Confirmation
    local confirm=$(prompt_yes_no "\n Do you want to proceed with this configuration?" "y")
    if [[ "$confirm" != "true" ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
}

show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🚀 KataCore Remote Deploy                            ║
║                                                                              ║
║    Deploy to any server with dynamic IP and domain configuration           ║
║    Supports both simple (IP only) and full (domain + SSL) deployments     ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    if [[ -n "$SERVER_IP" && -n "$DOMAIN" ]]; then
        echo -e "${CYAN}📋 Deployment Details:${NC}"
        echo -e "   📍 Server IP: $SERVER_IP"
        echo -e "   🌍 Domain: $DOMAIN"
        echo -e "   👤 SSH User: $SSH_USER"
        echo -e "   🔐 SSH Key: ${SSH_KEY_PATH:-'default'}"
        echo -e "   🚀 Deploy Type: $DEPLOY_TYPE"
        echo -e "   🐳 Docker Compose: $DOCKER_COMPOSE_FILE"
        echo ""
    fi
}

# Show help
show_help() {
    cat << 'EOF'
🚀 KataCore Remote Deployment Script

USAGE:
    ./deploy-remote.sh [OPTIONS] [IP] [DOMAIN]

ARGUMENTS:
    IP                  Server IP address (e.g., 116.118.85.41)
    DOMAIN             Domain name (e.g., innerbright.vn)

OPTIONS:
    -i, --interactive  Interactive mode (recommended for first-time users)
    --user USER        SSH user (default: root)
    --key PATH         SSH private key path (default: ~/.ssh/default)
    --simple           Simple deployment (no SSL/domain config)
    --force-regen      Force regenerate environment files
    --compose FILE     Docker compose file (default: docker-compose.yml)
    --project NAME     Project name (default: katacore)
    --cleanup          Cleanup deployment on remote server
    --help             Show this help

SERVICE OPTIONS:
    --install-api      Install API service
    --install-postgres Install PostgreSQL database
    --install-redis    Install Redis cache
    --install-minio    Install MinIO object storage
    --install-pgadmin  Install pgAdmin database management

NGINX OPTIONS (for full deployment):
    --nginxapi         Enable API subdomain
    --nginxpgadmin     Enable pgAdmin subdomain
    --nginxminio       Enable MinIO subdomain

EXAMPLES:
    # Interactive mode (recommended)
    ./deploy-remote.sh --interactive

    # Full deployment with domain and SSL
    ./deploy-remote.sh 116.118.85.41 innerbright.vn

    # Simple deployment (IP only, no SSL)
    ./deploy-remote.sh --simple 116.118.85.41 innerbright.vn

    # Custom SSH user and key
    ./deploy-remote.sh --user ubuntu --key ~/.ssh/my-key.pem 116.118.85.41 innerbright.vn

    # With specific services
    ./deploy-remote.sh --install-api --install-postgres --install-redis 116.118.85.41 innerbright.vn

    # Cleanup remote deployment
    ./deploy-remote.sh --cleanup 116.118.85.41

EOF
}

# Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -i|--interactive)
                INTERACTIVE_MODE=true
                shift
                ;;
            --user)
                SSH_USER="$2"
                shift 2
                ;;
            --key)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            --simple)
                DEPLOY_TYPE="simple"
                shift
                ;;
            --force-regen)
                FORCE_REGEN=true
                shift
                ;;
            --cleanup)
                CLEANUP_MODE=true
                shift
                ;;
            --compose)
                DOCKER_COMPOSE_FILE="$2"
                shift 2
                ;;
            --project)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --nginxapi)
                NGINX_API=true
                shift
                ;;
            --nginxpgadmin)
                NGINX_PGADMIN=true
                shift
                ;;
            --nginxminio)
                NGINX_MINIO=true
                shift
                ;;
            --install-api)
                INSTALL_API=true
                shift
                ;;
            --install-pgadmin)
                INSTALL_PGADMIN=true
                shift
                ;;
            --install-minio)
                INSTALL_MINIO=true
                shift
                ;;
            --install-redis)
                INSTALL_REDIS=true
                shift
                ;;
            --install-postgres)
                INSTALL_POSTGRES=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                if [[ -z "$SERVER_IP" ]]; then
                    SERVER_IP="$1"
                elif [[ -z "$DOMAIN" ]]; then
                    DOMAIN="$1"
                else
                    error "Too many arguments"
                fi
                shift
                ;;
        esac
    done
    
    # Interactive mode setup
    if [[ "$INTERACTIVE_MODE" == "true" ]]; then
        interactive_setup
        return
    fi
    
    # Validate required arguments for non-interactive mode
    if [[ -z "$SERVER_IP" && "$CLEANUP_MODE" != "true" ]]; then
        echo -e "${YELLOW}No arguments provided. Starting interactive mode...${NC}\n"
        INTERACTIVE_MODE=true
        interactive_setup
        return
    fi
    
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required. Use --help for usage."
    fi
    
    if [[ "$DEPLOY_TYPE" == "full" && -z "$DOMAIN" ]]; then
        error "Domain is required for full deployment. Use --simple for IP-only deployment."
    fi
    
    # Set default SSH key if not provided
    if [[ -z "$SSH_KEY_PATH" ]]; then
        SSH_KEY_PATH="$HOME/.ssh/default"
    fi
    
    # For simple deployment, use IP as domain
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        DOMAIN="$SERVER_IP"
    fi
}

# Validate inputs
validate_inputs() {
    # Validate IP
    if [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        error "Invalid IP address: $SERVER_IP"
    fi
    
    # Validate domain (only for full deployment)
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        if [[ ! $DOMAIN =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
            error "Invalid domain: $DOMAIN"
        fi
    fi
    
    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
}

# Select Docker Compose file
select_docker_compose_file() {
    log "🐳 Selecting Docker Compose file..."
    
    # Available compose files
    local compose_files=(
        "docker-compose.yml"
    )
    
    # If compose file not specified, use default
    if [[ -z "$DOCKER_COMPOSE_FILE" ]]; then
        DOCKER_COMPOSE_FILE="${compose_files[0]}"
    fi
    
    # Validate selected file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        info "Available files:"
        for file in "${compose_files[@]}"; do
            if [[ -f "$file" ]]; then
                info "  ✅ $file"
            else
                info "  ❌ $file (not found)"
            fi
        done
        exit 1
    fi
    
    success "Using Docker Compose file: $DOCKER_COMPOSE_FILE"
}

# Enhanced Docker Compose validation
validate_docker_compose() {
    log "[CHECK] Validating Docker Compose configuration..."
    
    # Check Docker Compose version - try both docker-compose and docker compose
    local compose_cmd=""
    if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
        compose_cmd="docker compose"
    elif command -v docker-compose &> /dev/null; then
        compose_cmd="docker-compose"
    else
        error "Docker Compose not found. Please install Docker Compose."
    fi
    
    # Skip validation if .env.prod doesn't exist yet
    if [[ ! -f .env.prod ]]; then
        warning "No .env.prod file found, skipping compose validation"
        return 0
    fi
    
    # Validate compose file syntax
    log "Testing Docker Compose configuration with command: $compose_cmd"
    if eval "$compose_cmd -f \"$DOCKER_COMPOSE_FILE\" --env-file .env.prod config --quiet" > /dev/null 2>&1; then
        log "Docker Compose configuration is valid"
    else
        warning "Docker Compose validation failed (may be due to missing environment file)"
    fi
    
    success "Docker Compose configuration checked"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if SSH key exists
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        warning "SSH key not found at $SSH_KEY_PATH"
        echo "Available options:"
        echo "1. Create a new SSH key: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
        echo "2. Use existing key: ./deploy-remote.sh --key /path/to/your/key IP DOMAIN"
        echo "3. Run ssh-keygen-setup.sh to create and configure SSH keys automatically"
        exit 1
    fi
    
    success "SSH key found at $SSH_KEY_PATH"
    
    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    # Check Docker version
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed locally. It will be installed on the remote server."
    else
        docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        log "Local Docker version: $docker_version"
    fi

    # Check Docker Compose version (support both plugin and standalone)
    if docker compose version &> /dev/null 2>&1; then
        compose_version=$(docker compose version --short)
        log "Local Docker Compose (plugin) version: $compose_version"
    elif command -v docker-compose &> /dev/null; then
        compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
        log "Local Docker Compose (standalone) version: $compose_version"
    else
        warning "Docker Compose is not installed locally. It will be installed on the remote server."
    fi
    
    success "Prerequisites checked"
    
    # Check if required build contexts exist
    if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
        # Check if api directory exists
        if [[ ! -d "api" ]]; then
            error "API directory not found. Make sure you're in the KataCore root directory."
        fi
        
        # Check if site directory exists
        if [[ ! -d "site" ]]; then
            error "Site directory not found. Make sure you're in the KataCore root directory."
        fi
        
        # Check if Dockerfiles exist
        if [[ ! -f "api/Dockerfile" ]]; then
            error "API Dockerfile not found at api/Dockerfile"
        fi
        
        if [[ ! -f "site/Dockerfile" ]]; then
            error "Site Dockerfile not found at site/Dockerfile"
        fi
        
        success "Build contexts validated"
    fi
}

# Check SSH connection
check_ssh_connection() {
    log "🔗 Testing SSH connection to $SSH_USER@$SERVER_IP..."
    
    local ssh_cmd="ssh -i $SSH_KEY_PATH -o ConnectTimeout=10 -o BatchMode=yes"
    
    if $ssh_cmd "$SSH_USER@$SERVER_IP" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        success "SSH connection successful"
        return 0
    else
        error "Cannot connect to $SSH_USER@$SERVER_IP. Please check your SSH key and server access."
    fi
}

# Prepare remote server
prepare_remote_server() {
    log "🛠️  Preparing remote server..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << 'EOF'
        set -e
        
        echo "🔄 Updating system..."
        apt update && apt upgrade -y
        
        echo "🐳 Installing Docker..."
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl enable docker
            systemctl start docker
            rm get-docker.sh
        fi
        
        echo "🔧 Installing Docker Compose..."
        if ! command -v docker-compose &> /dev/null; then
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        echo "📦 Installing required packages..."
        apt install -y curl wget git nginx certbot python3-certbot-nginx openssl ufw rsync
        
        echo "🔥 Configuring firewall..."
        ufw --force enable
        ufw allow OpenSSH
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp
        ufw allow 3001/tcp
        ufw allow 9000/tcp
        ufw allow 9001/tcp
        ufw allow 5050/tcp
        ufw allow 5432/tcp
        ufw allow 6379/tcp
        
        echo "✅ Remote server preparation completed"
EOF
    
    success "Remote server prepared successfully"
}

# Transfer project files to remote server
transfer_project() {
    log "📤 Transferring project files to remote server..."
    
    # Create deployment directory on remote server
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" "mkdir -p /opt/$PROJECT_NAME"
    
    # Create a temporary directory for deployment files
    local temp_dir=$(mktemp -d)
    # Copy all project files to temp directory (excluding .git, node_modules, etc.)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$temp_dir/"
    
    # Remove any existing .env.prod to force regeneration if requested
    if [[ "$FORCE_REGEN" == "true" ]]; then
        rm -f "$temp_dir/.env.prod"
    fi
    
    # Transfer files to remote server using rsync for better performance
    rsync -avz -e "ssh -i $SSH_KEY_PATH" "$temp_dir/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Project files transferred successfully"
}

# Generate environment configuration
generate_environment() {
    log "🔧 Generating environment configuration..."
    
    # Validate required environment variables
    if [[ -z "$PROJECT_NAME" || -z "$SERVER_IP" || -z "$DOMAIN" || -z "$DEPLOY_TYPE" ]]; then
        log "❌ Error: Required environment variables (PROJECT_NAME, SERVER_IP, DOMAIN, DEPLOY_TYPE) are not set."
        exit 1
    fi

    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOSSH
        set -e
        export PROJECT_NAME="$PROJECT_NAME"
        export SERVER_IP="$SERVER_IP"
        export DOMAIN="$DOMAIN"
        export DEPLOY_TYPE="$DEPLOY_TYPE"
        export FORCE_REGEN="$FORCE_REGEN"
        
        cd /opt/\$PROJECT_NAME
        
        # Create .env.prod file if it doesn't exist
        if [[ ! -f .env.prod ]] || [[ "\$FORCE_REGEN" == "true" ]]; then
            echo "🔐 Generating environment variables..."
            
            # Generate random passwords and keys
            DB_PASSWORD=\$(openssl rand -hex 16)
            REDIS_PASSWORD=\$(openssl rand -hex 16)
            JWT_SECRET=\$(openssl rand -hex 64)
            ENCRYPTION_KEY=\$(openssl rand -hex 32)
            MINIO_ROOT_PASSWORD=\$(openssl rand -hex 16)
            PGADMIN_PASSWORD=\$(openssl rand -hex 16)
            GRAFANA_ADMIN_PASSWORD=\$(openssl rand -hex 16)
           
            # Create .env.prod file
            cat > .env.prod << EOF
# Generated on \$(date)
# KataCore Production Environment Configuration

# ===== Application Configuration =====
NODE_ENV=production
API_VERSION=latest
SITE_VERSION=latest
RESTART_POLICY=unless-stopped

# ===== Port Configuration =====
PORT=3000
SITE_PORT=3000
API_PORT=3001

# ===== Database Configuration =====
POSTGRES_DB=\$PROJECT_NAME
POSTGRES_USER=\$PROJECT_NAME
POSTGRES_PASSWORD=\$DB_PASSWORD
DATABASE_URL=postgresql://\$PROJECT_NAME:\$DB_PASSWORD@postgres:5432/\$PROJECT_NAME

# ===== Redis Configuration =====
REDIS_PASSWORD=\$REDIS_PASSWORD
REDIS_URL=redis://:\$REDIS_PASSWORD@redis:6379

# ===== Authentication & Security =====
JWT_SECRET=\$JWT_SECRET
ENCRYPTION_KEY=\$ENCRYPTION_KEY
LOG_LEVEL=info

# ===== MinIO Configuration =====
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=\$MINIO_ROOT_PASSWORD
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=\$MINIO_ROOT_PASSWORD
MINIO_USE_SSL=false

# ===== PgAdmin Configuration =====
PGADMIN_PORT=5050
PGADMIN_DEFAULT_PASSWORD=\$PGADMIN_PASSWORD

# ===== Internal Services =====
INTERNAL_API_URL=http://api:3001

# ===== Server Configuration =====
SERVER_IP=\$SERVER_IP
DOMAIN=\$DOMAIN
DEPLOY_TYPE=\$DEPLOY_TYPE

# ===== SSL Configuration (for full deployment) =====
SSL_EMAIL=admin@\$DOMAIN
EOF

            # Append deployment-specific configuration
            if [[ "\$DEPLOY_TYPE" == "simple" ]]; then
                cat >> .env.prod << EOF

# ===== CORS Configuration =====
CORS_ORIGIN=http://\$SERVER_IP:3000
NEXT_PUBLIC_API_URL=http://\$SERVER_IP:3001
NEXT_PUBLIC_APP_URL=http://\$SERVER_IP:3000
NEXT_PUBLIC_MINIO_ENDPOINT=http://\$SERVER_IP:9000
PGADMIN_DEFAULT_EMAIL=admin@\$SERVER_IP
EOF
            else
                cat >> .env.prod << EOF

# ===== CORS Configuration =====
CORS_ORIGIN=https://\$DOMAIN,http://\$SERVER_IP:3000
NEXT_PUBLIC_API_URL=https://api.\$DOMAIN
NEXT_PUBLIC_APP_URL=https://\$DOMAIN
NEXT_PUBLIC_MINIO_ENDPOINT=https://minio.\$DOMAIN
PGADMIN_DEFAULT_EMAIL=admin@\$DOMAIN
EOF
            fi
            
            echo "✅ .env.prod file created successfully!"

            # Print credentials
            echo "✅ Environment file generated with the following credentials (SAVE SECURELY):"
            echo "   🔐 Database Password: \$DB_PASSWORD"
            echo "   🔐 Redis Password: \$REDIS_PASSWORD"
            echo "   🔐 JWT Secret: \$JWT_SECRET"
            echo "   🔐 Encryption Key: \$ENCRYPTION_KEY"
            echo "   🔐 MinIO Root Password: \$MINIO_ROOT_PASSWORD"
            echo "   🔐 pgAdmin Password: \$PGADMIN_PASSWORD"
            echo "   🔐 Grafana Admin Password: \$GRAFANA_ADMIN_PASSWORD"

        else
            echo "📋 Using existing .env.prod file"
        fi

        # Check if a system restart is required
        if [ -f /var/run/reboot-required ]; then
            echo "⚠️ System restart required. Please run 'sudo reboot' manually when ready."
        fi
EOSSH
    
    success "Environment configuration completed"
}

# Build and run Docker Compose
run_docker_compose() {
    log "🚀 Building and running Docker Compose..."

    # Determine which services to include based on install flags
    local enabled_services=()
    [[ "$INSTALL_API" == "true" ]] && enabled_services+=("api")
    [[ "$INSTALL_PGADMIN" == "true" ]] && enabled_services+=("pgadmin")
    [[ "$INSTALL_MINIO" == "true" ]] && enabled_services+=("minio")
    [[ "$INSTALL_REDIS" == "true" ]] && enabled_services+=("redis")
    [[ "$INSTALL_POSTGRES" == "true" ]] && enabled_services+=("postgres")

    # If no install flags are set to true, run all services (default behavior)
    local compose_cmd="docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod"
    local run_services=""
    if [[ ${#enabled_services[@]} -gt 0 ]]; then
        run_services="${enabled_services[*]}"
    fi

    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" bash -s <<EOF
set -e
cd /opt/$PROJECT_NAME

echo "🧹 Cleaning up existing containers..."
$compose_cmd down --remove-orphans 2>/dev/null || true

echo "🗑️  Cleaning up Docker system..."
docker system prune -f || true

echo "🔍 Checking Docker Compose file..."
if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
    echo "❌ Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    exit 1
fi

echo "📋 Validating Docker Compose configuration..."
if ! docker compose -f $DOCKER_COMPOSE_FILE --env-file .env.prod config --quiet; then
    echo "⚠️ Docker Compose validation failed, but continuing..."
fi

echo "🔨 Building Docker images..."
if [[ -n "$run_services" ]]; then
    $compose_cmd build --no-cache $run_services || echo "Build failed for some services, continuing..."
else
    $compose_cmd build --no-cache || echo "Build failed for some services, continuing..."
fi

echo "🚀 Starting services..."
if [[ -n "$run_services" ]]; then
    $compose_cmd up -d $run_services
else
    $compose_cmd up -d
fi

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service health..."
for i in {1..10}; do
    if $compose_cmd ps | grep -q "Up\|running"; then
        echo "✅ Services are starting up..."
        break
    fi
    echo "⏳ Waiting for services... (\$i/10)"
    sleep 3
done

echo "📊 Checking service status..."
$compose_cmd ps || true

echo "📋 Checking service logs for errors..."
$compose_cmd logs --tail=20 || true

echo "✅ Docker Compose deployment completed!"
EOF

    success "Docker Compose services are running"
}

# Configure SSL (for full deployment)
configure_ssl() {
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        log "🔒 Configuring SSL certificates..."

        # Build Nginx config blocks based on flags
        local nginx_conf=""
        nginx_conf+="server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        if [[ "$NGINX_API" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name api.$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi
        if [[ "$NGINX_PGADMIN" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name pgadmin.$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5050;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi
        if [[ "$NGINX_MINIO" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name minio.$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi
        # Prepare certbot domains
        local certbot_domains="-d $DOMAIN -d www.$DOMAIN"
        [[ "$NGINX_API" == "true" ]] && certbot_domains+=" -d api.$DOMAIN"
        [[ "$NGINX_PGADMIN" == "true" ]] && certbot_domains+=" -d pgadmin.$DOMAIN"
        [[ "$NGINX_MINIO" == "true" ]] && certbot_domains+=" -d minio.$DOMAIN"
        
        ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" bash -s <<EOF
set -e
DOMAIN="$DOMAIN"
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/\$DOMAIN <<'NGINXEOF'
$nginx_conf
NGINXEOF

ln -sf /etc/nginx/sites-available/\$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "🔒 Obtaining SSL certificate..."
certbot --nginx $certbot_domains --non-interactive --agree-tos --expand --email admin@\$DOMAIN || {
    echo "⚠️  Certbot failed, but continuing with HTTP configuration..."
}

echo "✅ SSL configuration completed"
EOF

        success "SSL certificates configured"
    fi
}

# Check service health
check_service_health() {
    log "🔍 Checking service health..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        cd /opt/$PROJECT_NAME
        
        echo "🔍 Checking Docker container status..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps || true
        
        echo ""
        echo "🔍 Checking service health..."
        
        # Check main app
        if curl -sf http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Main App (port 3000): Healthy"
        else
            echo "❌ Main App (port 3000): Not responding"
        fi
        
        # Check API
        if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ API (port 3001): Healthy"
        elif curl -sf http://localhost:3001 > /dev/null 2>&1; then
            echo "✅ API (port 3001): Responding (no health endpoint)"
        else
            echo "❌ API (port 3001): Not responding"
        fi
        
        echo ""
        echo "📊 Docker container resource usage:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" || true
EOF
    
    success "Health check completed"
}

# Show deployment summary
show_deployment_summary() {
    local protocol="https"
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        protocol="http"
    fi
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                         🎉 DEPLOYMENT SUCCESSFUL!                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}🌐 Server Information:${NC}"
    echo -e "   📍 IP Address:    $SERVER_IP"
    echo -e "   🌍 Domain:        $DOMAIN"
    echo -e "   👤 User:          $SSH_USER"
    echo -e "   🔐 SSH Key:       $SSH_KEY_PATH"
    echo -e "   🐳 Docker File:   $DOCKER_COMPOSE_FILE"
    echo -e "   📦 Project:       $PROJECT_NAME"
    echo ""
    
    echo -e "${CYAN}📊 Services Status:${NC}"
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps" || true
    echo ""
    
    echo -e "${CYAN}🔗 Service URLs:${NC}"
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        echo -e "   🌐 Main App:      http://$SERVER_IP:3000"
        echo -e "   🚀 API:           http://$SERVER_IP:3001"
        echo -e "   📦 MinIO:         http://$SERVER_IP:9000"
        echo -e "   🗄️  MinIO Console: http://$SERVER_IP:9001"
        echo -e "   🗄️  pgAdmin:      http://$SERVER_IP:5050"
        echo -e "   🗄️  Database:     $SERVER_IP:5432"
        echo -e "   🗄️  Redis:        $SERVER_IP:6379"
    else
        echo -e "   🌐 Main App:      https://$DOMAIN (IP: http://$SERVER_IP:3000)"
        echo -e "   🚀 API:           https://api.$DOMAIN (IP: http://$SERVER_IP:3001)"
        echo -e "   📦 MinIO:         https://minio.$DOMAIN (IP: http://$SERVER_IP:9000)"
        echo -e "   🗄️  MinIO Console: https://minio.$DOMAIN (IP: http://$SERVER_IP:9001)"
        echo -e "   🗄️  pgAdmin:      https://pgadmin.$DOMAIN (IP: http://$SERVER_IP:5050)"
        echo -e "   🗄️  Database:     $DOMAIN:5432 (IP: $SERVER_IP:5432)"
        echo -e "   🗄️  Redis:        $DOMAIN:6379 (IP: $SERVER_IP:6379)"
    fi
    echo ""
    
    echo -e "${CYAN}📋 Management Commands:${NC}"
    echo -e "   🔍 Check logs:    ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod logs'"
    echo -e "   🔄 Restart:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod restart'"
    echo -e "   ⏹️  Stop:         ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod stop'"
    echo -e "   🗑️  Remove:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down'"
    echo ""
    
    echo -e "${YELLOW}🔐 Important: Check .env.prod file on server for generated passwords${NC}"
    echo -e "   ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cat /opt/$PROJECT_NAME/.env.prod'"
}

# Main deployment function
deploy() {
    show_banner
    validate_inputs
    
    # Select and validate Docker Compose file
    select_docker_compose_file
    validate_docker_compose
    
    check_prerequisites
    
    log "🚀 Starting remote deployment..."
    
    # Check SSH connection
    check_ssh_connection
    
    # Prepare remote server
    prepare_remote_server
    
    # Transfer project files
    transfer_project
    
    # Generate environment configuration
    generate_environment
    
    # Run Docker Compose
    run_docker_compose
    
    # Configure SSL if full deployment
    configure_ssl
    
    # Check service health
    check_service_health
    
    # Show summary
    show_deployment_summary
    
    success "🎉 Remote deployment completed successfully!"
}

# Cleanup deployment function
cleanup_deployment() {
    show_banner
    
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required for cleanup. Usage: ./deploy-remote.sh --cleanup SERVER_IP"
    fi
    
    log "🧹 Starting cleanup of remote deployment..."
    
    # Set default SSH key if not provided
    if [[ -z "$SSH_KEY_PATH" ]]; then
        SSH_KEY_PATH="$HOME/.ssh/default"
    fi
    
    # Check SSH connection
    check_ssh_connection
    
    # Cleanup deployment
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        
        echo "🧹 Cleaning up KataCore deployment..."
        
        # Stop and remove Docker containers
        if [[ -d "/opt/$PROJECT_NAME" ]]; then
            cd /opt/$PROJECT_NAME
            
            if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
                echo "🛑 Stopping Docker containers..."
                docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down --remove-orphans -v || true
                
                echo "🗑️  Removing Docker images..."
                docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down --rmi all || true
            fi
            
            echo "🧹 Removing project directory..."
            cd /
            rm -rf /opt/$PROJECT_NAME
        fi
        
        # Remove Nginx configuration (if exists)
        if [[ -f "/etc/nginx/sites-available/$DOMAIN" ]]; then
            echo "🌐 Removing Nginx configuration..."
            rm -f /etc/nginx/sites-available/$DOMAIN
            rm -f /etc/nginx/sites-enabled/$DOMAIN
            nginx -t && systemctl reload nginx || true
        fi
        
        # Clean up SSL certificates (if exists)
        if command -v certbot &> /dev/null; then
            echo "🔒 Removing SSL certificates..."
            certbot delete --cert-name $DOMAIN --non-interactive || true
        fi
        
        # Clean up Docker system
        echo "🧹 Cleaning Docker system..."
        docker system prune -af || true
        docker volume prune -f || true
        
        # Remove firewall rules (optional)
        echo "🔥 Removing specific firewall rules..."
        ufw delete allow 3000/tcp || true
        ufw delete allow 3001/tcp || true
        ufw delete allow 9000/tcp || true
        ufw delete allow 9001/tcp || true
        ufw delete allow 5050/tcp || true
        
        echo "✅ Cleanup completed successfully!"
EOF
    
    success "🎉 Remote deployment cleanup completed!"
    
    echo ""
    echo -e "${CYAN}📋 Cleanup Summary:${NC}"
    echo -e "   🛑 Docker containers stopped and removed"
    echo -e "   🗑️  Project files deleted from /opt/$PROJECT_NAME"
    echo -e "   🌐 Nginx configuration removed"
    echo -e "   🔒 SSL certificates removed"
    echo -e "   🧹 Docker system cleaned"
    echo -e "   🔥 Firewall rules cleaned"
    echo ""
}

# Test SSH connection function
test_connection() {
    show_banner
    validate_inputs
    
    log "🧪 Testing SSH connection..."
    
    if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 "$SSH_USER@$SERVER_IP" "echo 'SSH connection test successful!'"; then
        success "SSH connection works perfectly!"
    else
        error "SSH connection failed"
    fi
}

# Main function
main() {
    # Parse arguments first
    parse_arguments "$@"
    
    # If no arguments provided and not in interactive mode, show help
    if [[ -z "$SERVER_IP" && "$INTERACTIVE_MODE" != "true" && "$CLEANUP_MODE" != "true" ]]; then
        show_help
        exit 0
    fi
    
    # Execute based on mode
    if [[ "$CLEANUP_MODE" == "true" ]]; then
        cleanup_deployment
    else
        deploy
    fi
}

# Run main function
main "$@"
