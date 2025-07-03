#!/bin/bash

# 🔑 KataCore SSH Key Generation & Setup Script
# Automated SSH key generation and configuration for remote deployment

set -euo pipefail

# Configuration
SSH_KEY_NAME="katacore-deploy"
SSH_KEY_PATH="$HOME/.ssh"
SSH_KEY_TYPE="ed25519"
SSH_KEY_BITS="4096"
DEFAULT_USER="root"
CONFIG_FILE="$HOME/.ssh/config"

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
success() { echo -e "${GREEN}✅ $1${NC}; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Show banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                     🔑 KataCore SSH Key Setup                               ║
║                                                                              ║
║    Generate and configure SSH keys for secure remote deployment            ║
║    Supports ED25519 and RSA key types with automated configuration         ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Show help
show_help() {
    cat << 'EOF'
🔑 KataCore SSH Key Generation & Setup Script

USAGE:
    ./ssh-keygen-setup.sh [OPTIONS]

OPTIONS:
    --name NAME           SSH key name (default: katacore-deploy)
    --type TYPE           Key type: ed25519 or rsa (default: ed25519)
    --bits BITS           Key bits for RSA (default: 4096)
    --path PATH           SSH directory path (default: ~/.ssh)
    --server IP           Server IP to configure
    --user USER           SSH user (default: root)
    --force               Force overwrite existing keys
    --no-config           Skip SSH config file creation
    --copy-key            Copy public key to clipboard
    --help                Show this help

EXAMPLES:
    # Generate default ED25519 key
    ./ssh-keygen-setup.sh

    # Generate RSA key with custom name
    ./ssh-keygen-setup.sh --type rsa --name myproject-key

    # Generate key and configure for specific server
    ./ssh-keygen-setup.sh --server 116.118.85.41 --user ubuntu

    # Generate key with custom bits and copy to clipboard
    ./ssh-keygen-setup.sh --type rsa --bits 2048 --copy-key

    # Force overwrite existing key
    ./ssh-keygen-setup.sh --force --name existing-key

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                SSH_KEY_NAME="$2"
                shift 2
                ;;
            --type)
                SSH_KEY_TYPE="$2"
                shift 2
                ;;
            --bits)
                SSH_KEY_BITS="$2"
                shift 2
                ;;
            --path)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
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
            --no-config)
                NO_CONFIG=true
                shift
                ;;
            --copy-key)
                COPY_KEY=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1. Use --help for usage."
                ;;
        esac
    done
}

# Validate inputs
validate_inputs() {
    # Validate key type
    if [[ "$SSH_KEY_TYPE" != "ed25519" && "$SSH_KEY_TYPE" != "rsa" ]]; then
        error "Invalid key type: $SSH_KEY_TYPE. Use 'ed25519' or 'rsa'"
    fi
    
    # Validate RSA key bits
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        if [[ ! "$SSH_KEY_BITS" =~ ^[0-9]+$ ]] || [[ "$SSH_KEY_BITS" -lt 2048 ]]; then
            error "Invalid RSA key bits: $SSH_KEY_BITS. Minimum 2048 bits required"
        fi
    fi
    
    # Validate SSH directory
    if [[ ! -d "$SSH_KEY_PATH" ]]; then
        log "Creating SSH directory: $SSH_KEY_PATH"
        mkdir -p "$SSH_KEY_PATH"
        chmod 700 "$SSH_KEY_PATH"
    fi
}

# Check if SSH key already exists
check_existing_key() {
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    if [[ -f "$private_key" || -f "$public_key" ]]; then
        if [[ "${FORCE_OVERWRITE:-false}" == "true" ]]; then
            warning "Overwriting existing SSH key: $SSH_KEY_NAME"
            rm -f "$private_key" "$public_key"
        else
            error "SSH key already exists: $SSH_KEY_NAME. Use --force to overwrite"
        fi
    fi
}

# Generate SSH key
generate_ssh_key() {
    log "🔑 Generating SSH key..."
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local comment="${SSH_KEY_NAME}@$(hostname)-$(date +%Y%m%d)"
    
    case "$SSH_KEY_TYPE" in
        ed25519)
            ssh-keygen -t ed25519 -f "$private_key" -N "" -C "$comment"
            ;;
        rsa)
            ssh-keygen -t rsa -b "$SSH_KEY_BITS" -f "$private_key" -N "" -C "$comment"
            ;;
    esac
    
    # Set proper permissions
    chmod 600 "$private_key"
    chmod 644 "$private_key.pub"
    
    success "SSH key generated successfully:"
    info "  Private key: $private_key"
    info "  Public key: $private_key.pub"
    info "  Key type: $SSH_KEY_TYPE"
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        info "  Key bits: $SSH_KEY_BITS"
    fi
}

# Create SSH config entry
create_ssh_config() {
    if [[ "${NO_CONFIG:-false}" == "true" ]]; then
        return
    fi
    
    if [[ -z "${SERVER_IP:-}" ]]; then
        log "⚠️  No server IP provided, skipping SSH config creation"
        return
    fi
    
    log "📝 Creating SSH config entry..."
    
    local config_entry="
# KataCore Deployment Server - Generated $(date)
Host katacore-${SERVER_IP}
    HostName ${SERVER_IP}
    User ${SSH_USER:-$DEFAULT_USER}
    IdentityFile $SSH_KEY_PATH/$SSH_KEY_NAME
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR
"
    
    # Create config file if it doesn't exist
    if [[ ! -f "$CONFIG_FILE" ]]; then
        touch "$CONFIG_FILE"
        chmod 600 "$CONFIG_FILE"
    fi
    
    # Check if entry already exists
    if grep -q "Host katacore-${SERVER_IP}" "$CONFIG_FILE"; then
        warning "SSH config entry already exists for katacore-${SERVER_IP}"
    else
        echo "$config_entry" >> "$CONFIG_FILE"
        success "SSH config entry created for katacore-${SERVER_IP}"
    fi
}

# Copy public key to clipboard
copy_key_to_clipboard() {
    if [[ "${COPY_KEY:-false}" != "true" ]]; then
        return
    fi
    
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    # Try different clipboard commands
    if command -v xclip &> /dev/null; then
        xclip -selection clipboard < "$public_key"
        success "Public key copied to clipboard (xclip)"
    elif command -v pbcopy &> /dev/null; then
        pbcopy < "$public_key"
        success "Public key copied to clipboard (pbcopy)"
    elif command -v clip &> /dev/null; then
        clip < "$public_key"
        success "Public key copied to clipboard (clip)"
    else
        warning "No clipboard utility found. Public key not copied."
    fi
}

# Display key information
display_key_info() {
    log "🔍 SSH Key Information:"
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    # Display key fingerprint
    if command -v ssh-keygen &> /dev/null; then
        echo -e "${CYAN}Fingerprint (SHA256):${NC}"
        ssh-keygen -lf "$public_key"
        echo
        
        echo -e "${CYAN}Fingerprint (MD5):${NC}"
        ssh-keygen -lf "$public_key" -E md5
        echo
    fi
    
    # Display public key
    echo -e "${CYAN}Public Key:${NC}"
    cat "$public_key"
    echo
    
    # Display key size info
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        info "RSA Key Size: $SSH_KEY_BITS bits"
    else
        info "ED25519 Key (256-bit equivalent security)"
    fi
}

# Show usage instructions
show_usage_instructions() {
    echo -e "${PURPLE}📋 Next Steps:${NC}"
    echo
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    echo -e "${YELLOW}1. Copy public key to your server:${NC}"
    echo "   ssh-copy-id -i $public_key ${SSH_USER:-$DEFAULT_USER}@${SERVER_IP:-SERVER_IP}"
    echo
    
    echo -e "${YELLOW}2. Or manually add to authorized_keys:${NC}"
    echo "   cat $public_key | ssh ${SSH_USER:-$DEFAULT_USER}@${SERVER_IP:-SERVER_IP} 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'"
    echo
    
    echo -e "${YELLOW}3. Test SSH connection:${NC}"
    if [[ -n "${SERVER_IP:-}" ]]; then
        echo "   ssh -i $private_key ${SSH_USER:-$DEFAULT_USER}@${SERVER_IP}"
        echo "   # Or using config alias:"
        echo "   ssh katacore-${SERVER_IP}"
    else
        echo "   ssh -i $private_key ${SSH_USER:-$DEFAULT_USER}@SERVER_IP"
    fi
    echo
    
    echo -e "${YELLOW}4. Use with KataCore deployment:${NC}"
    echo "   ./deploy-remote.sh --key $private_key --user ${SSH_USER:-$DEFAULT_USER} SERVER_IP DOMAIN"
    echo
}

# Create deployment helper
create_deployment_helper() {
    local helper_script="deploy-with-generated-key.sh"
    
    cat > "$helper_script" << EOF
#!/bin/bash

# 🚀 KataCore Deployment Helper with Generated SSH Key
# Auto-generated helper script for deployment

SSH_KEY="$SSH_KEY_PATH/$SSH_KEY_NAME"
SSH_USER="${SSH_USER:-$DEFAULT_USER}"

# Check if key exists
if [[ ! -f "\$SSH_KEY" ]]; then
    echo "❌ SSH key not found: \$SSH_KEY"
    exit 1
fi

# Run deployment with generated key
exec ./deploy-remote.sh --key "\$SSH_KEY" --user "\$SSH_USER" "\$@"
EOF
    
    chmod +x "$helper_script"
    success "Created deployment helper: $helper_script"
}

# Auto-deploy SSH key to server
auto_deploy_to_server() {
    if [[ -z "${SERVER_IP:-}" ]]; then
        return
    fi
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    log "🚀 Auto-deploying SSH key to server..."
    
    # Try to copy key to server using ssh-copy-id
    if command -v ssh-copy-id &> /dev/null; then
        info "Attempting to copy SSH key to ${SERVER_IP}..."
        info "You may be prompted for the server password"
        
        if ssh-copy-id -i "$public_key" "${SSH_USER:-$DEFAULT_USER}@${SERVER_IP}"; then
            success "SSH key successfully deployed to ${SERVER_IP}"
            
            # Test connection
            log "Testing SSH connection..."
            if ssh -i "$private_key" -o ConnectTimeout=10 "${SSH_USER:-$DEFAULT_USER}@${SERVER_IP}" "echo 'SSH connection test successful'"; then
                success "SSH connection test passed - Password-less SSH now working!"
                return 0
            else
                warning "SSH key deployed but connection test failed"
            fi
        else
            warning "Failed to auto-deploy SSH key using ssh-copy-id"
            echo ""
            echo "📋 Manual deployment options:"
            echo "1. Copy public key content:"
            echo "   cat $public_key"
            echo ""
            echo "2. SSH to server and add to authorized_keys:"
            echo "   ssh ${SSH_USER:-$DEFAULT_USER}@${SERVER_IP}"
            echo "   mkdir -p ~/.ssh"
            echo "   echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys"
            echo "   chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
            echo ""
            echo "3. Or use this one-liner:"
            echo "   cat $public_key | ssh ${SSH_USER:-$DEFAULT_USER}@${SERVER_IP} 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'"
        fi
    else
        warning "ssh-copy-id not found. Installing openssh-client..."
        
        # Try to install openssh-client
        if command -v apt &> /dev/null; then
            sudo apt update && sudo apt install -y openssh-client
            success "openssh-client installed"
            # Retry deployment
            auto_deploy_to_server
        else
            error "Please install openssh-client manually and run this script again"
        fi
    fi
}

# Main function
main() {
    show_banner
    
    # Set defaults
    FORCE_OVERWRITE=${FORCE_OVERWRITE:-false}
    NO_CONFIG=${NO_CONFIG:-false}
    COPY_KEY=${COPY_KEY:-false}
    SSH_USER=${SSH_USER:-$DEFAULT_USER}
    
    # Parse arguments
    parse_arguments "$@"
    
    # Validate inputs
    validate_inputs
    
    # Check existing keys
    check_existing_key
    
    # Generate SSH key
    generate_ssh_key
    
    # Create SSH config
    create_ssh_config
    
    # Copy key to clipboard
    copy_key_to_clipboard
    
    # Display key information
    display_key_info
    
    # Create deployment helper
    create_deployment_helper
    
    # Auto-deploy SSH key to server
    auto_deploy_to_server
    
    # Show usage instructions
    show_usage_instructions
    
    success "🎉 SSH key setup completed successfully!"
    info "Use the generated key for secure remote deployment with KataCore"
}

# Run main function
main "$@"
