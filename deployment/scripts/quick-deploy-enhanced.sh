#!/bin/bash

# 🔧 KataCore Quick Deploy - Enhanced Version
# One-command deployment for experienced users
# Version: 2.0.0

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Icons
readonly ICON_SUCCESS="✅"
readonly ICON_WARNING="⚠️"
readonly ICON_ERROR="❌"
readonly ICON_INFO="ℹ️"
readonly ICON_ROCKET="🚀"
readonly ICON_GEAR="⚙️"

echo -e "${CYAN}${ICON_ROCKET} KataCore Quick Deploy - Enhanced Version${NC}"
echo "============================================="

# Function to print colored output
success() { echo -e "${GREEN}${ICON_SUCCESS} $1${NC}"; }
warning() { echo -e "${YELLOW}${ICON_WARNING} $1${NC}"; }
error() { echo -e "${RED}${ICON_ERROR} $1${NC}"; }
info() { echo -e "${BLUE}${ICON_INFO} $1${NC}"; }

# Check if we're in the right directory
if [[ ! -f "deploy-remote-fixed.sh" ]]; then
    error "Please run this script from the KataCore root directory"
    error "Required file not found: deploy-remote-fixed.sh"
    exit 1
fi

info "Checking deployment prerequisites..."

# ================================
# PROJECT STRUCTURE VALIDATION
# ================================

info "Validating project structure..."

# Check required files
required_files=(
    "docker-compose.yml"
    "site/package.json"
    "site/Dockerfile"
    "api/package.json"
    "api/Dockerfile"
    "deploy-remote-fixed.sh"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    error "Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

success "Project structure validated"

# ================================
# DEPENDENCY FIXES
# ================================

info "Checking and fixing dependencies..."

# Check if jsonwebtoken was added to site/package.json
if grep -q '"jsonwebtoken"' site/package.json; then
    success "jsonwebtoken dependency found in site/package.json"
else
    warning "jsonwebtoken dependency missing from site/package.json"
    info "Adding jsonwebtoken to site/package.json..."
    
    # Create backup
    cp site/package.json site/package.json.backup
    
    # Add jsonwebtoken dependency
    if grep -q '"clsx"' site/package.json; then
        sed -i 's/"clsx": "[^"]*"/"clsx": "^2.1.1",\n    "jsonwebtoken": "^9.0.2"/' site/package.json
        success "Added jsonwebtoken dependency"
    else
        warning "Could not automatically add jsonwebtoken. Please add it manually."
    fi
fi

# Check if @types/jsonwebtoken was added
if grep -q '"@types/jsonwebtoken"' site/package.json; then
    success "@types/jsonwebtoken dependency found in site/package.json"
else
    warning "@types/jsonwebtoken dependency missing from site/package.json"
    info "Adding @types/jsonwebtoken to site/package.json..."
    
    # Add @types/jsonwebtoken dependency
    if grep -q '"@types/bcryptjs"' site/package.json; then
        sed -i 's/"@types\/bcryptjs": "[^"]*"/"@types\/bcryptjs": "^2.4.6",\n    "@types\/jsonwebtoken": "^9.0.7"/' site/package.json
        success "Added @types/jsonwebtoken dependency"
    else
        warning "Could not automatically add @types/jsonwebtoken. Please add it manually."
    fi
fi

# ================================
# DOCKERFILE VALIDATION
# ================================

info "Validating Dockerfile configurations..."

# Check site Dockerfile
if [[ -f "site/Dockerfile" ]]; then
    if grep -q "npm run dev" site/Dockerfile; then
        success "Site Dockerfile configured for development mode"
    elif grep -q "npm run build" site/Dockerfile; then
        success "Site Dockerfile configured for production build"
    else
        warning "Site Dockerfile may need improvement"
    fi
else
    error "Site Dockerfile not found"
    exit 1
fi

# Check API Dockerfile
if [[ -f "api/Dockerfile" ]]; then
    success "API Dockerfile found"
else
    error "API Dockerfile not found"
    exit 1
fi

# ================================
# SSH KEY VALIDATION
# ================================

info "Checking SSH key configuration..."

# Find SSH key
SSH_KEY_PATH=""
ssh_key_paths=(
    "$HOME/.ssh/default"
    "$HOME/.ssh/id_rsa"
    "$HOME/.ssh/id_ed25519"
    "$HOME/.ssh/id_ecdsa"
)

for key_path in "${ssh_key_paths[@]}"; do
    if [[ -f "$key_path" ]]; then
        SSH_KEY_PATH="$key_path"
        success "SSH key found at $SSH_KEY_PATH"
        break
    fi
done

if [[ -z "$SSH_KEY_PATH" ]]; then
    error "No SSH key found in common locations:"
    for key_path in "${ssh_key_paths[@]}"; do
        echo "  - $key_path"
    done
    echo
    info "Please run one of the following:"
    echo "  1. ./ssh-keygen-setup.sh (to create SSH keys)"
    echo "  2. Specify key with: $0 --key /path/to/your/key [server_ip] [domain]"
    exit 1
fi

# Validate SSH key
if ! ssh-keygen -l -f "$SSH_KEY_PATH" &>/dev/null; then
    error "Invalid SSH key format: $SSH_KEY_PATH"
    exit 1
fi

success "SSH key validated"

# ================================
# DOCKER VALIDATION
# ================================

info "Checking Docker configuration..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    success "Docker version: $docker_version"
else
    warning "Docker not found locally (will be installed on remote server)"
fi

# Check Docker Compose
if docker compose version &> /dev/null 2>&1; then
    compose_version=$(docker compose version --short)
    success "Docker Compose version: $compose_version"
elif command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    success "Docker Compose (standalone) version: $compose_version"
else
    warning "Docker Compose not found locally (will be installed on remote server)"
fi

# Validate docker-compose.yml
if docker compose -f docker-compose.yml config --quiet &>/dev/null; then
    success "docker-compose.yml syntax is valid"
else
    warning "docker-compose.yml may have syntax issues (will be checked on server)"
fi

# ================================
# ENVIRONMENT VALIDATION
# ================================

info "Checking environment configuration..."

# Check if .env.prod exists locally (it's okay if it doesn't)
if [[ -f ".env.prod" ]]; then
    success "Local .env.prod found (will be used as template)"
else
    info "No local .env.prod found (will be generated on server)"
fi

# Check site environment files
if [[ -f "site/.env" ]] || [[ -f "site/.env.local" ]]; then
    success "Site environment configuration found"
else
    info "No site environment files found (will be configured on server)"
fi

# ================================
# NETWORK CONNECTIVITY
# ================================

info "All prerequisites checked successfully!"
echo

# ================================
# DEPLOYMENT OPTIONS
# ================================

info "Quick deploy options:"
echo "  1. Full deployment with domain and SSL"
echo "  2. Simple deployment (IP only, no SSL)"  
echo "  3. Development deployment"
echo "  4. Custom deployment (specify parameters)"
echo "  5. Interactive wizard"
echo

# If arguments provided, use them directly
if [[ $# -gt 0 ]]; then
    info "Using provided arguments: $*"
    exec ./deploy-remote-fixed.sh --key "$SSH_KEY_PATH" "$@"
fi

# Ask user for deployment type
while true; do
    echo -e "${YELLOW}Choose deployment option [1-5]: ${NC}"
    read -r choice
    
    case $choice in
        1)
            echo -e "${YELLOW}Enter server IP: ${NC}"
            read -r server_ip
            echo -e "${YELLOW}Enter domain name: ${NC}"
            read -r domain
            
            info "Starting full deployment..."
            exec ./deploy-remote-fixed.sh \
                --key "$SSH_KEY_PATH" \
                --install-api \
                --install-postgres \
                --install-redis \
                --install-minio \
                --install-pgadmin \
                --nginxapi \
                --nginxpgadmin \
                --nginxminio \
                "$server_ip" "$domain"
            ;;
        2)
            echo -e "${YELLOW}Enter server IP: ${NC}"
            read -r server_ip
            
            info "Starting simple deployment..."
            exec ./deploy-remote-fixed.sh \
                --key "$SSH_KEY_PATH" \
                --simple \
                --install-api \
                --install-postgres \
                --install-redis \
                --install-minio \
                --install-pgadmin \
                "$server_ip"
            ;;
        3)
            echo -e "${YELLOW}Enter server IP: ${NC}"
            read -r server_ip
            
            info "Starting development deployment..."
            exec ./deploy-remote-fixed.sh \
                --key "$SSH_KEY_PATH" \
                --simple \
                --install-api \
                --install-postgres \
                --install-redis \
                "$server_ip"
            ;;
        4)
            echo -e "${YELLOW}Enter custom deployment command (without script name): ${NC}"
            read -r custom_args
            
            info "Starting custom deployment..."
            exec ./deploy-remote-fixed.sh --key "$SSH_KEY_PATH" $custom_args
            ;;
        5)
            info "Starting interactive wizard..."
            exec ./deploy-wizard.sh
            ;;
        *)
            error "Invalid choice. Please select 1-5."
            ;;
    esac
done
