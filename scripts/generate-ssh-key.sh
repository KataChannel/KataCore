#!/bin/bash

# 🔑 SSH Key Generation and Management Script
# Part of KataCore Senior-Level Deployment System

set -euo pipefail

# Default configuration
SSH_KEY_NAME="katacore-deploy"
SSH_KEY_PATH=""
SERVER_IP=""
SSH_USER="root"
FORCE_OVERWRITE=false

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if OpenSSH is installed
    if ! command -v ssh-keygen &> /dev/null; then
        error "OpenSSH client is not installed"
        exit 1
    fi
    
    if ! command -v ssh-copy-id &> /dev/null; then
        error "ssh-copy-id is not installed"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Generate SSH key
generate_ssh_key() {
    local key_path="$1"
    log "🔑 Generating SSH key..."
    
    local ssh_dir="$(dirname "$key_path")"
    local private_key="$key_path"
    local public_key="$key_path.pub"
    
    # Create SSH directory if it doesn't exist
    if [[ ! -d "$ssh_dir" ]]; then
        mkdir -p "$ssh_dir"
        chmod 700 "$ssh_dir"
    fi
    
    # Check if key already exists
    if [[ -f "$private_key" ]] && [[ "$FORCE_OVERWRITE" != "true" ]]; then
        warning "SSH key already exists: $private_key"
        read -p "Overwrite existing key? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Using existing SSH key"
            return 0
        fi
    fi
    
    # Generate the key
    ssh-keygen -t ed25519 -C "katacore-deploy-$(date +%Y%m%d)" -f "$private_key" -N ""
    
    # Set proper permissions
    chmod 600 "$private_key"
    chmod 644 "$public_key"
    
    success "SSH key generated: $private_key"
}

# Deploy SSH key to server
deploy_ssh_key() {
    local key_path="$1"
    local server="$2"
    local user="$3"
    
    log "🚀 Deploying SSH key to server..."
    
    local public_key="$key_path.pub"
    
    if [[ ! -f "$public_key" ]]; then
        error "Public key not found: $public_key"
        exit 1
    fi
    
    # Deploy the key
    ssh-copy-id -i "$public_key" "$user@$server"
    
    # Test the connection
    if ssh -i "$key_path" -o ConnectTimeout=10 "$user@$server" "echo 'SSH key deployment successful'"; then
        success "SSH key deployed and tested successfully"
    else
        error "SSH key deployment failed"
        exit 1
    fi
}

# Create SSH config entry
create_ssh_config() {
    local key_path="$1"
    local server="$2"
    local user="$3"
    
    log "📝 Creating SSH config entry..."
    
    local config_file="$HOME/.ssh/config"
    local alias="katacore-$(echo "$server" | tr '.' '-')"
    
    # Create SSH config if it doesn't exist
    if [[ ! -f "$config_file" ]]; then
        touch "$config_file"
        chmod 600 "$config_file"
    fi
    
    # Check if entry already exists
    if grep -q "Host $alias" "$config_file"; then
        warning "SSH config entry already exists for $alias"
        return 0
    fi
    
    # Add config entry
    cat >> "$config_file" << EOF

# KataCore deployment server
Host $alias
    HostName $server
    User $user
    IdentityFile $key_path
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR

EOF
    
    success "SSH config entry created: $alias"
    info "You can now connect with: ssh $alias"
}

# Show help
show_help() {
    cat << 'EOF'
SSH Key Generation and Management Script

USAGE:
    ./generate-ssh-key.sh [OPTIONS] [KEY_PATH]

OPTIONS:
    --server SERVER_IP    Deploy key to server after generation
    --user SSH_USER       SSH username (default: root)
    --force               Force overwrite existing key
    --help                Show this help

EXAMPLES:
    # Generate key only
    ./generate-ssh-key.sh ~/.ssh/katacore-deploy

    # Generate and deploy to server
    ./generate-ssh-key.sh --server 116.118.85.41 --user ubuntu ~/.ssh/katacore-deploy

    # Force overwrite existing key
    ./generate-ssh-key.sh --force ~/.ssh/katacore-deploy

EOF
}

# Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --server)
                SERVER_IP="$2"
                shift 2
                ;;
            --user)
                SSH_USER="$2"
                shift 2
                ;;
            --force)
                FORCE_OVERWRITE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                SSH_KEY_PATH="$1"
                shift
                ;;
        esac
    done
}

# Main function
main() {
    parse_arguments "$@"
    
    # Set default key path if not provided
    if [[ -z "$SSH_KEY_PATH" ]]; then
        SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"
    fi
    
    check_prerequisites
    generate_ssh_key "$SSH_KEY_PATH"
    
    if [[ -n "$SERVER_IP" ]]; then
        deploy_ssh_key "$SSH_KEY_PATH" "$SERVER_IP" "$SSH_USER"
        create_ssh_config "$SSH_KEY_PATH" "$SERVER_IP" "$SSH_USER"
    fi
    
    success "SSH key generation completed!"
}

# Run main function
main "$@"
