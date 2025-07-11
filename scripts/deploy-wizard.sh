#!/bin/bash

# 🎯 Interactive Deployment Wizard for TazaCore
# User-friendly guided deployment process
# Version: 1.0.0

set -euo pipefail

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

# Icons
readonly ICON_SUCCESS="✅"
readonly ICON_WARNING="⚠️"
readonly ICON_ERROR="❌"
readonly ICON_INFO="ℹ️"
readonly ICON_QUESTION="❓"
readonly ICON_ROCKET="🚀"
readonly ICON_GEAR="⚙️"

# Configuration variables
SERVER_IP=""
DOMAIN=""
SSH_USER="root"
SSH_KEY_PATH=""
DEPLOY_MODE="production"
ENABLE_SSL=true
ENABLE_MONITORING=false
ENABLE_BACKUP=true

# ================================
# UTILITY FUNCTIONS
# ================================

print_step() {
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1 ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_info() {
    echo -e "${BLUE}${ICON_INFO} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${ICON_SUCCESS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${ICON_WARNING} $1${NC}"
}

print_error() {
    echo -e "${RED}${ICON_ERROR} $1${NC}"
}

ask_question() {
    echo -e "${YELLOW}${ICON_QUESTION} $1${NC}"
}

# Input validation functions
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

# ================================
# MAIN WIZARD STEPS
# ================================

show_welcome() {
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║                    🚀 TazaCore Deployment Wizard                     ║
    ║                                                                       ║
    ║    Welcome to the interactive deployment wizard!                     ║
    ║    This wizard will guide you through deploying TazaCore             ║
    ║    to your server step by step.                                      ║
    ║                                                                       ║
    ║    Estimated time: 5-15 minutes                                      ║
    ╚═══════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo
    print_info "This wizard will help you:"
    echo "  • Configure server connection"
    echo "  • Set up SSL certificates (optional)"
    echo "  • Choose deployment mode"
    echo "  • Configure monitoring and backup"
    echo "  • Deploy your application"
    echo
    read -p "Press Enter to continue..." -r
}

step_server_config() {
    print_step "Step 1: Server Configuration"
    
    # Get server IP
    while true; do
        ask_question "Enter your server IP address:"
        read -r SERVER_IP
        
        if validate_ip "$SERVER_IP"; then
            print_success "Valid IP address: $SERVER_IP"
            break
        else
            print_error "Invalid IP address format. Please try again."
        fi
    done
    
    echo
    
    # Get SSH user
    ask_question "Enter SSH username (default: root):"
    read -r input_user
    SSH_USER="${input_user:-root}"
    print_info "SSH user: $SSH_USER"
    
    echo
    
    # Find SSH key
    print_info "Looking for SSH keys..."
    local key_paths=(
        "$HOME/.ssh/default"
        "$HOME/.ssh/id_rsa"
        "$HOME/.ssh/id_ed25519"
        "$HOME/.ssh/id_ecdsa"
    )
    
    local found_keys=()
    for key_path in "${key_paths[@]}"; do
        if [[ -f "$key_path" ]]; then
            found_keys+=("$key_path")
        fi
    done
    
    if [[ ${#found_keys[@]} -eq 0 ]]; then
        print_warning "No SSH keys found in common locations."
        ask_question "Enter path to your SSH private key:"
        read -r SSH_KEY_PATH
        
        if [[ ! -f "$SSH_KEY_PATH" ]]; then
            print_error "SSH key file not found: $SSH_KEY_PATH"
            print_info "You can generate SSH keys by running: ./ssh-keygen-setup.sh"
            exit 1
        fi
    elif [[ ${#found_keys[@]} -eq 1 ]]; then
        SSH_KEY_PATH="${found_keys[0]}"
        print_success "Found SSH key: $SSH_KEY_PATH"
    else
        print_info "Multiple SSH keys found. Please choose one:"
        for i in "${!found_keys[@]}"; do
            echo "  $((i+1)). ${found_keys[$i]}"
        done
        
        while true; do
            ask_question "Enter your choice (1-${#found_keys[@]}):"
            read -r choice
            
            if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 && "$choice" -le "${#found_keys[@]}" ]]; then
                SSH_KEY_PATH="${found_keys[$((choice-1))]}"
                print_success "Selected SSH key: $SSH_KEY_PATH"
                break
            else
                print_error "Invalid choice. Please try again."
            fi
        done
    fi
    
    # Test SSH connection
    echo
    print_info "Testing SSH connection..."
    if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" &>/dev/null; then
        print_success "SSH connection established successfully!"
    else
        print_error "Cannot connect to $SSH_USER@$SERVER_IP"
        print_info "Please check your SSH key and server access."
        exit 1
    fi
}

step_domain_ssl() {
    print_step "Step 2: Domain and SSL Configuration"
    
    print_info "You can deploy TazaCore in two modes:"
    echo "  1. Simple Mode: Access via IP address only (http://$SERVER_IP)"
    echo "  2. Domain Mode: Use a custom domain with SSL certificates (https://yourdomain.com)"
    echo
    
    while true; do
        ask_question "Do you have a domain name for this deployment? [y/N]:"
        read -r -n 1 has_domain
        echo
        
        case "$has_domain" in
            [Yy])
                while true; do
                    ask_question "Enter your domain name (e.g., example.com):"
                    read -r DOMAIN
                    
                    if validate_domain "$DOMAIN"; then
                        print_success "Valid domain: $DOMAIN"
                        break
                    else
                        print_error "Invalid domain format. Please try again."
                    fi
                done
                
                echo
                ask_question "Enable SSL certificates (HTTPS)? [Y/n]:"
                read -r -n 1 enable_ssl_input
                echo
                
                case "$enable_ssl_input" in
                    [Nn])
                        ENABLE_SSL=false
                        print_warning "SSL disabled. Your site will use HTTP only."
                        ;;
                    *)
                        ENABLE_SSL=true
                        print_success "SSL enabled. Let's Encrypt certificates will be automatically generated."
                        ;;
                esac
                break
                ;;
            *)
                DOMAIN="$SERVER_IP"
                ENABLE_SSL=false
                print_info "Using simple mode with IP address: $SERVER_IP"
                break
                ;;
        esac
    done
}

step_deployment_mode() {
    print_step "Step 3: Deployment Mode"
    
    print_info "Choose your deployment mode:"
    echo "  1. Production  - Optimized for production use (recommended)"
    echo "  2. Staging     - For testing and staging environments"
    echo "  3. Development - For development and debugging"
    echo
    
    while true; do
        ask_question "Select deployment mode [1-3] (default: 1):"
        read -r mode_choice
        mode_choice="${mode_choice:-1}"
        
        case "$mode_choice" in
            1)
                DEPLOY_MODE="production"
                print_success "Selected: Production mode"
                break
                ;;
            2)
                DEPLOY_MODE="staging"
                print_success "Selected: Staging mode"
                break
                ;;
            3)
                DEPLOY_MODE="development"
                print_success "Selected: Development mode"
                break
                ;;
            *)
                print_error "Invalid choice. Please select 1, 2, or 3."
                ;;
        esac
    done
}

step_additional_features() {
    print_step "Step 4: Additional Features"
    
    # Monitoring
    ask_question "Enable monitoring stack (Grafana, Prometheus)? [y/N]:"
    read -r -n 1 enable_monitoring
    echo
    
    case "$enable_monitoring" in
        [Yy])
            ENABLE_MONITORING=true
            print_success "Monitoring enabled"
            ;;
        *)
            ENABLE_MONITORING=false
            print_info "Monitoring disabled"
            ;;
    esac
    
    echo
    
    # Backup
    ask_question "Enable automated backup system? [Y/n]:"
    read -r -n 1 enable_backup
    echo
    
    case "$enable_backup" in
        [Nn])
            ENABLE_BACKUP=false
            print_info "Backup disabled"
            ;;
        *)
            ENABLE_BACKUP=true
            print_success "Backup enabled"
            ;;
    esac
}

step_confirmation() {
    print_step "Step 5: Deployment Confirmation"
    
    print_info "Please review your configuration:"
    echo
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📍 Server IP:          ${CYAN}$SERVER_IP${NC}"
    echo -e "${WHITE}🌍 Domain:             ${CYAN}$DOMAIN${NC}"
    echo -e "${WHITE}👤 SSH User:           ${CYAN}$SSH_USER${NC}"
    echo -e "${WHITE}🔐 SSH Key:            ${CYAN}$SSH_KEY_PATH${NC}"
    echo -e "${WHITE}🚀 Deploy Mode:        ${CYAN}$DEPLOY_MODE${NC}"
    echo -e "${WHITE}🔒 SSL Enabled:        ${CYAN}$ENABLE_SSL${NC}"
    echo -e "${WHITE}📊 Monitoring:         ${CYAN}$ENABLE_MONITORING${NC}"
    echo -e "${WHITE}💾 Backup:             ${CYAN}$ENABLE_BACKUP${NC}"
    echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    
    if [[ "$ENABLE_SSL" == "true" ]]; then
        print_info "After deployment, your application will be available at:"
        echo -e "  ${GREEN}🌐 Main App: https://$DOMAIN${NC}"
        echo -e "  ${GREEN}🚀 API: https://api.$DOMAIN${NC}"
        echo -e "  ${GREEN}🗄️  pgAdmin: https://pgadmin.$DOMAIN${NC}"
        echo -e "  ${GREEN}📦 MinIO: https://minio.$DOMAIN${NC}"
    else
        print_info "After deployment, your application will be available at:"
        echo -e "  ${GREEN}🌐 Main App: http://$SERVER_IP:3000${NC}"
        echo -e "  ${GREEN}🚀 API: http://$SERVER_IP:3001${NC}"
        echo -e "  ${GREEN}🗄️  pgAdmin: http://$SERVER_IP:5050${NC}"
        echo -e "  ${GREEN}📦 MinIO: http://$SERVER_IP:9000${NC}"
    fi
    
    echo
    print_warning "The deployment process will take approximately 10-20 minutes."
    echo
    
    while true; do
        ask_question "Proceed with deployment? [y/N]:"
        read -r -n 1 proceed
        echo
        
        case "$proceed" in
            [Yy])
                print_success "Starting deployment..."
                break
                ;;
            *)
                print_info "Deployment cancelled by user."
                exit 0
                ;;
        esac
    done
}

step_deployment() {
    print_step "Step 6: Deploying TazaCore"
    
    # Build deployment command
    local deploy_args=(
        --key "$SSH_KEY_PATH"
        --user "$SSH_USER"
        --project tazacore
        --install-api
        --install-postgres
        --install-redis
        --install-minio
        --install-pgadmin
    )
    
    if [[ "$ENABLE_SSL" == "false" ]]; then
        deploy_args+=(--simple)
    else
        deploy_args+=(
            --nginxapi
            --nginxpgadmin
            --nginxminio
        )
    fi
    
    print_info "Executing deployment command..."
    print_info "Command: ./deploy-remote-fixed.sh ${deploy_args[*]} $SERVER_IP $DOMAIN"
    echo
    
    # Execute deployment
    ./deploy-remote-fixed.sh "${deploy_args[@]}" "$SERVER_IP" "$DOMAIN"
}

step_completion() {
    print_step "🎉 Deployment Complete!"
    
    print_success "TazaCore has been successfully deployed!"
    echo
    
    print_info "Your application is now available at:"
    if [[ "$ENABLE_SSL" == "true" ]]; then
        echo -e "  ${GREEN}🌐 Main Application: https://$DOMAIN${NC}"
        echo -e "  ${GREEN}🚀 API Endpoint: https://api.$DOMAIN${NC}"
        echo -e "  ${GREEN}🗄️  Database Admin: https://pgadmin.$DOMAIN${NC}"
        echo -e "  ${GREEN}📦 File Storage: https://minio.$DOMAIN${NC}"
    else
        echo -e "  ${GREEN}🌐 Main Application: http://$SERVER_IP:3000${NC}"
        echo -e "  ${GREEN}🚀 API Endpoint: http://$SERVER_IP:3001${NC}"
        echo -e "  ${GREEN}🗄️  Database Admin: http://$SERVER_IP:5050${NC}"
        echo -e "  ${GREEN}📦 File Storage: http://$SERVER_IP:9000${NC}"
    fi
    
    echo
    print_info "Important notes:"
    echo "  • Database credentials are stored in .env.prod on the server"
    echo "  • Check service logs: docker-compose logs [service_name]"
    echo "  • Restart services: docker-compose restart"
    echo "  • Stop services: docker-compose stop"
    
    if [[ "$ENABLE_MONITORING" == "true" ]]; then
        echo "  • Monitoring dashboard will be available soon"
    fi
    
    if [[ "$ENABLE_BACKUP" == "true" ]]; then
        echo "  • Automated backups are configured"
    fi
    
    echo
    print_success "Thank you for using TazaCore! 🚀"
}

# ================================
# MAIN FUNCTION
# ================================

main() {
    show_welcome
    step_server_config
    step_domain_ssl
    step_deployment_mode
    step_additional_features
    step_confirmation
    step_deployment
    step_completion
}

# Execute main function
main "$@"
