#!/bin/bash

# 🚀 KataCore Auto SSH Setup & Deploy Script
# Automatically generate SSH keys and deploy to server

set -euo pipefail

# Default configuration
SERVER_IP=""
SSH_USER="root"
SSH_KEY_NAME="katacore-deploy"
AUTO_DEPLOY=false
FORCE_OVERWRITE=false

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

# Show banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                   🚀 KataCore Auto SSH Setup & Deploy                       ║
║                                                                              ║
║    Automatically generate SSH keys and deploy to server                     ║
║    No more password prompts - complete automation                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Show help
show_help() {
    cat << 'EOF'
🚀 KataCore Auto SSH Setup & Deploy Script

USAGE:
    ./auto-ssh-deploy.sh [OPTIONS] SERVER_IP

ARGUMENTS:
    SERVER_IP           Server IP address (e.g., 116.118.85.41)

OPTIONS:
    --user USER         SSH user (default: root)
    --key-name NAME     SSH key name (default: katacore-deploy)
    --auto-deploy       Automatically deploy after key generation
    --force             Force overwrite existing keys
    --help              Show this help

EXAMPLES:
    # Generate SSH key and auto-deploy to server
    ./auto-ssh-deploy.sh --auto-deploy 116.118.85.41

    # Generate SSH key for specific user
    ./auto-ssh-deploy.sh --user ubuntu --auto-deploy 116.118.85.41

    # Force overwrite existing key and deploy
    ./auto-ssh-deploy.sh --force --auto-deploy 116.118.85.41

    # Just generate key (no auto-deploy)
    ./auto-ssh-deploy.sh 116.118.85.41

WORKFLOW:
    1. Generate SSH key pair (ED25519)
    2. Copy public key to server (password required once)
    3. Test password-less SSH connection
    4. Ready for KataCore deployment

EOF
}

# Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --user)
                SSH_USER="$2"
                shift 2
                ;;
            --key-name)
                SSH_KEY_NAME="$2"
                shift 2
                ;;
            --auto-deploy)
                AUTO_DEPLOY=true
                shift
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
                error "Unknown option: $1. Use --help for usage."
                ;;
            *)
                if [[ -z "$SERVER_IP" ]]; then
                    SERVER_IP="$1"
                else
                    error "Too many arguments. Use --help for usage."
                fi
                shift
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required. Use --help for usage."
    fi
    
    # Validate IP format
    if [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        error "Invalid IP address: $SERVER_IP"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if ssh-keygen is available
    if ! command -v ssh-keygen &> /dev/null; then
        error "ssh-keygen not found. Please install openssh-client."
    fi
    
    # Check if ssh-copy-id is available
    if ! command -v ssh-copy-id &> /dev/null; then
        warning "ssh-copy-id not found. Attempting to install openssh-client..."
        
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y openssh-client
            success "openssh-client installed"
        else
            error "Please install openssh-client manually"
        fi
    fi
    
    success "Prerequisites check passed"
}

# Generate SSH key
generate_ssh_key() {
    log "🔑 Generating SSH key..."
    
    local ssh_dir="$HOME/.ssh"
    local private_key="$ssh_dir/$SSH_KEY_NAME"
    local public_key="$ssh_dir/$SSH_KEY_NAME.pub"
    
    # Create SSH directory if it doesn't exist
    if [[ ! -d "$ssh_dir" ]]; then
        mkdir -p "$ssh_dir"
        chmod 700 "$ssh_dir"
    fi
    
    # Check if key already exists
    if [[ -f "$private_key" ]]; then
        if [[ "$FORCE_OVERWRITE" == "true" ]]; then
            warning "Overwriting existing SSH key: $SSH_KEY_NAME"
            rm -f "$private_key" "$public_key"
        else
            error "SSH key already exists: $private_key. Use --force to overwrite."
        fi
    fi
    
    # Generate ED25519 key (more secure and faster)
    local comment="KataCore-${SERVER_IP}-$(date +%Y%m%d)-$(whoami)@$(hostname)"
    ssh-keygen -t ed25519 -f "$private_key" -N "" -C "$comment"
    
    # Set proper permissions
    chmod 600 "$private_key"
    chmod 644 "$public_key"
    
    success "SSH key generated successfully"
    info "  Private key: $private_key"
    info "  Public key: $public_key"
    
    # Display key fingerprint
    echo -e "${CYAN}Key fingerprint:${NC}"
    ssh-keygen -lf "$public_key"
}

# Deploy SSH key to server
deploy_ssh_key() {
    log "🚀 Deploying SSH key to server..."
    
    local private_key="$HOME/.ssh/$SSH_KEY_NAME"
    local public_key="$HOME/.ssh/$SSH_KEY_NAME.pub"
    
    info "Connecting to $SSH_USER@$SERVER_IP..."
    info "You will be prompted for the server password (this is the last time!)"
    echo
    
    # Try to copy key to server
    if ssh-copy-id -i "$public_key" "$SSH_USER@$SERVER_IP"; then
        success "SSH key successfully deployed to $SERVER_IP"
        
        # Test password-less connection
        log "Testing password-less SSH connection..."
        if ssh -i "$private_key" -o ConnectTimeout=10 "$SSH_USER@$SERVER_IP" "echo 'SSH connection test successful'"; then
            success "🎉 Password-less SSH connection is now working!"
            return 0
        else
            error "SSH key deployed but connection test failed"
        fi
    else
        error "Failed to deploy SSH key to server"
    fi
}

# Create SSH config entry
create_ssh_config() {
    log "📝 Creating SSH config entry..."
    
    local config_file="$HOME/.ssh/config"
    local config_entry="
# KataCore Server - Auto-generated $(date)
Host katacore-${SERVER_IP}
    HostName ${SERVER_IP}
    User ${SSH_USER}
    IdentityFile $HOME/.ssh/$SSH_KEY_NAME
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR
"
    
    # Create config file if it doesn't exist
    if [[ ! -f "$config_file" ]]; then
        touch "$config_file"
        chmod 600 "$config_file"
    fi
    
    # Check if entry already exists
    if grep -q "Host katacore-${SERVER_IP}" "$config_file"; then
        warning "SSH config entry already exists for katacore-${SERVER_IP}"
    else
        echo "$config_entry" >> "$config_file"
        success "SSH config entry created for katacore-${SERVER_IP}"
    fi
}

# Show deployment instructions
show_deployment_instructions() {
    echo -e "${PURPLE}🚀 Ready for KataCore Deployment!${NC}"
    echo
    echo -e "${CYAN}Quick Deploy Commands:${NC}"
    echo
    echo -e "${YELLOW}1. Simple deployment (IP only, no SSL):${NC}"
    echo "   ./deploy-remote.sh --simple --key ~/.ssh/$SSH_KEY_NAME --user $SSH_USER $SERVER_IP $SERVER_IP"
    echo
    echo -e "${YELLOW}2. Full deployment (with domain and SSL):${NC}"
    echo "   ./deploy-remote.sh --key ~/.ssh/$SSH_KEY_NAME --user $SSH_USER $SERVER_IP your-domain.com"
    echo
    echo -e "${YELLOW}3. Using SSH config alias:${NC}"
    echo "   ssh katacore-${SERVER_IP}"
    echo
    echo -e "${CYAN}Test SSH Connection:${NC}"
    echo "   ssh -i ~/.ssh/$SSH_KEY_NAME $SSH_USER@$SERVER_IP"
    echo
    echo -e "${CYAN}Generated Files:${NC}"
    echo "   Private key: ~/.ssh/$SSH_KEY_NAME"
    echo "   Public key:  ~/.ssh/$SSH_KEY_NAME.pub"
    echo "   SSH config:  ~/.ssh/config"
    echo
}

# Main function
main() {
    show_banner
    parse_arguments "$@"
    check_prerequisites
    
    # Generate SSH key
    generate_ssh_key
    
    # Create SSH config
    create_ssh_config
    
    # Deploy SSH key if requested
    if [[ "$AUTO_DEPLOY" == "true" ]]; then
        deploy_ssh_key
    else
        info "SSH key generated. Use --auto-deploy to deploy to server automatically."
        echo
        echo -e "${YELLOW}To deploy SSH key manually:${NC}"
        echo "  ssh-copy-id -i ~/.ssh/$SSH_KEY_NAME.pub $SSH_USER@$SERVER_IP"
        echo
    fi
    
    # Show deployment instructions
    show_deployment_instructions
    
    success "🎉 SSH setup completed successfully!"
}

# Run main function
main "$@"
