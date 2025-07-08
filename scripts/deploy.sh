#!/bin/bash

# KataCore Master Deployment Script
# This script provides a unified interface for all deployment operations
# Author: KataCore Team
# Version: 1.0.0
# Last Updated: January 2024

set -euo pipefail

# Script configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT=$SCRIPT_DIR
# readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
readonly SCRIPTS_DIR="$DEPLOYMENT_DIR/scripts"
readonly CONFIGS_DIR="$DEPLOYMENT_DIR/configs"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Icons
readonly SUCCESS="✅"
readonly ERROR="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly ROCKET="🚀"
readonly GEAR="⚙️"
readonly SHIELD="🛡️"

# Configuration
readonly VERSION="1.0.0"
readonly DEFAULT_ENV="production"
readonly DEFAULT_CONFIG="default"
readonly DEFAULT_SSH_USER="root"
readonly DEFAULT_SSH_KEY_PATH="~/.ssh/id_rsa"
readonly DEFAULT_DEPLOY_TYPE="simple"
readonly DEFAULT_BACKUP_TYPE="database"

# Global variables
ENV=""
SERVER=""
SSH_USER=""
DOMAIN=""
SSH_KEY_PATH=""
DEPLOY_TYPE=""
CONFIG_FILE=""
FORCE=false
VERBOSE=false
TAIL=""
FOLLOW=false
SERVICE=""
BACKUP_TYPE=""
MESSAGE=""

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
    -e, --env <env>         Environment (dev/staging/prod) [default: ${DEFAULT_ENV}]
    -s, --server <ip>       Server IP address
    -u, --user <user>       SSH username [default: ${DEFAULT_SSH_USER}]
    -d, --domain <domain>   Domain name
    -k, --key <path>        SSH key path [default: ${DEFAULT_SSH_KEY_PATH}]
    -t, --type <type>       Deployment type (simple/full/cluster) [default: ${DEFAULT_DEPLOY_TYPE}]
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

# Logging functions
log_info() {
    echo -e "${INFO} ${BLUE}[INFO]${NC} $1" >&2
}

log_success() {
    echo -e "${SUCCESS} ${GREEN}[SUCCESS]${NC} $1" >&2
}

log_warning() {
    echo -e "${WARNING} ${YELLOW}[WARNING]${NC} $1" >&2
}

log_error() {
    echo -e "${ERROR} ${RED}[ERROR]${NC} $1" >&2
}

log_header() {
    echo -e "${CYAN}
╔═══════════════════════════════════════════════════════════╗
║ $1
╚═══════════════════════════════════════════════════════════╝
${NC}" >&2
}

# Function to prompt with default value
prompt_with_default() {
    local prompt="$1"
    local default_value="$2"
    local variable_name="$3"
    local user_input
    
    if [[ -n "$default_value" ]]; then
        printf "%b%s %b[%s]%b: " "${CYAN}" "$prompt" "${YELLOW}" "$default_value" "${NC}"
    else
        printf "%b%s%b: " "${CYAN}" "$prompt" "${NC}"
    fi
    
    read -r user_input
    
    # If user input is empty, use default value
    if [[ -z "$user_input" && -n "$default_value" ]]; then
        printf "%bUsing default: %s%b\n" "${GREEN}" "$default_value" "${NC}"
        printf -v "$variable_name" "%s" "$default_value"
    else
        printf -v "$variable_name" "%s" "$user_input"
    fi
}

# Function to prompt for yes/no with default
prompt_yes_no() {
    local prompt="$1"
    local default_value="${2:-Y}"
    local variable_name="$3"
    local user_input
    
    printf "%b%s %b[%s]%b: " "${CYAN}" "$prompt" "${YELLOW}" "$default_value" "${NC}"
    read -r user_input
    
    # If user input is empty, use default value
    if [[ -z "$user_input" ]]; then
        user_input="$default_value"
        printf "%bUsing default: %s%b\n" "${GREEN}" "$default_value" "${NC}"
    fi
    
    if [[ $user_input =~ ^[Yy]$ ]]; then
        printf -v "$variable_name" "true"
    else
        printf -v "$variable_name" "false"
    fi
}

# Function to prompt for selection with default
prompt_selection() {
    local prompt="$1"
    local default_value="$2"
    local variable_name="$3"
    local user_input
    
    printf "%b%s %b[%s]%b: " "${CYAN}" "$prompt" "${YELLOW}" "$default_value" "${NC}"
    read -r user_input
    
    # If user input is empty, use default value
    if [[ -z "$user_input" ]]; then
        user_input="$default_value"
        printf "%bUsing default: %s%b\n" "${GREEN}" "$default_value" "${NC}"
    fi
    
    printf -v "$variable_name" "%s" "$user_input"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "curl" "jq" "ssh" "git")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Please install missing dependencies and try again"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Load configuration
load_config() {
    local env=${1:-$DEFAULT_ENV}
    local config_file="$CONFIGS_DIR/environments/${env}.conf"
    
    if [[ -f "$config_file" ]]; then
        # shellcheck source=/dev/null
        source "$config_file"
        log_success "Loaded configuration for environment: $env"
    else
        log_warning "Configuration file not found: $config_file"
        log_info "Using default configuration"
    fi
}

# Interactive setup wizard
setup_wizard() {
    log_header "🚀 KataCore Setup Wizard"
    
    echo -e "${BLUE}Welcome to KataCore deployment setup!${NC}"
    echo -e "${BLUE}This wizard will guide you through the initial setup process.${NC}"
    echo -e "${YELLOW}Press Enter to use default values shown in brackets${NC}"
    echo
    
    # Environment selection
    echo -e "${CYAN}1. Select target environment:${NC}"
    echo "   1) Development"
    echo "   2) Staging"
    echo "   3) Production (default)"
    echo
    
    local env_choice
    prompt_selection "Select option [1-3]" "3" "env_choice"
    
    local environment
    case $env_choice in
        1) environment="dev" ;;
        2) environment="staging" ;;
        3) environment="prod" ;;
        *) 
            log_warning "Invalid selection, using default: Production"
            environment="prod"
            ;;
    esac
    
    # Server configuration
    echo -e "${CYAN}2. Server Configuration:${NC}"
    local server_ip
    prompt_with_default "Server IP address" "" "server_ip"
    
    if [[ -z "$server_ip" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    local ssh_user
    prompt_with_default "SSH username" "$DEFAULT_SSH_USER" "ssh_user"
    
    local domain
    prompt_with_default "Domain name (optional)" "" "domain"
    
    # SSH key configuration
    echo -e "${CYAN}3. SSH Key Configuration:${NC}"
    local ssh_key_path
    prompt_with_default "SSH key path" "$DEFAULT_SSH_KEY_PATH" "ssh_key_path"
    
    # Deployment type
    echo -e "${CYAN}4. Deployment Type:${NC}"
    echo "   1) Simple (Basic setup) (default)"
    echo "   2) Full (Complete setup with all services)"
    echo "   3) Cluster (Multi-node setup)"
    echo
    
    local deploy_choice
    prompt_selection "Select option [1-3]" "1" "deploy_choice"
    
    local deploy_type
    case $deploy_choice in
        1) deploy_type="simple" ;;
        2) deploy_type="full" ;;
        3) deploy_type="cluster" ;;
        *) 
            log_warning "Invalid selection, using default: Simple"
            deploy_type="simple"
            ;;
    esac
    
    # Features selection
    echo -e "${CYAN}5. Features Selection:${NC}"
    local install_api install_postgres install_redis install_minio install_pgadmin
    prompt_yes_no "Install API service?" "Y" "install_api"
    prompt_yes_no "Install PostgreSQL?" "Y" "install_postgres"
    prompt_yes_no "Install Redis?" "Y" "install_redis"
    prompt_yes_no "Install MinIO?" "Y" "install_minio"
    prompt_yes_no "Install pgAdmin?" "n" "install_pgadmin"
    
    # SSL configuration
    echo -e "${CYAN}6. SSL Configuration:${NC}"
    local enable_ssl
    prompt_yes_no "Enable SSL/TLS?" "Y" "enable_ssl"
    
    local ssl_cert_path ssl_key_path
    if [[ "$enable_ssl" = true ]]; then
        prompt_with_default "SSL certificate path (optional)" "" "ssl_cert_path"
        prompt_with_default "SSL key path (optional)" "" "ssl_key_path"
    fi
    
    # Summary
    echo -e "${CYAN}
╔═══════════════════════════════════════════════════════════╗
║                    Configuration Summary                   ║
╚═══════════════════════════════════════════════════════════╝
${NC}"
    echo -e "${BLUE}Environment:${NC} $environment"
    echo -e "${BLUE}Server:${NC} $server_ip"
    echo -e "${BLUE}User:${NC} $ssh_user"
    echo -e "${BLUE}Domain:${NC} ${domain:-"Not specified"}"
    echo -e "${BLUE}Deploy Type:${NC} $deploy_type"
    echo -e "${BLUE}SSH Key:${NC} $ssh_key_path"
    echo -e "${BLUE}Features:${NC}"
    echo -e "  - API Service: ${install_api}"
    echo -e "  - PostgreSQL: ${install_postgres}"
    echo -e "  - Redis: ${install_redis}"
    echo -e "  - MinIO: ${install_minio}"
    echo -e "  - pgAdmin: ${install_pgadmin}"
    echo -e "${BLUE}SSL Enabled:${NC} ${enable_ssl}"
    echo
    
    local confirm_deploy
    prompt_yes_no "Proceed with deployment?" "Y" "confirm_deploy"
    
    if [[ "$confirm_deploy" = true ]]; then
        log_info "Starting deployment..."
        # Set global variables for deployment
        ENV="$environment"
        SERVER="$server_ip"
        SSH_USER="$ssh_user"
        DOMAIN="$domain"
        DEPLOY_TYPE="$deploy_type"
        SSH_KEY_PATH="$ssh_key_path"
        deploy_application
    else
        log_info "Deployment cancelled"
        exit 0
    fi
}

# Deploy application
deploy_application() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    local domain=${DOMAIN:-""}
    local deploy_type=${DEPLOY_TYPE:-$DEFAULT_DEPLOY_TYPE}
    local force=${FORCE:-false}
    local verbose=${VERBOSE:-false}
    
    log_header "🚀 Deploying KataCore Application"
    
    # Display deployment configuration
    echo -e "${BLUE}Deployment Configuration:${NC}"
    echo -e "  Environment: ${YELLOW}${env}${NC}"
    echo -e "  Server: ${YELLOW}${server}${NC}"
    echo -e "  User: ${YELLOW}${user}${NC}"
    echo -e "  Domain: ${YELLOW}${domain:-"Not specified"}${NC}"
    echo -e "  Type: ${YELLOW}${deploy_type}${NC}"
    echo -e "  Force: ${YELLOW}${force}${NC}"
    echo -e "  Verbose: ${YELLOW}${verbose}${NC}"
    echo
    
    # Validate parameters
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    # Load environment configuration
    load_config "$env"
    
    # Choose deployment script based on type
    case $deploy_type in
        "simple")
            log_info "Using simple deployment"
            if [[ -f "$SCRIPTS_DIR/quick-deploy-enhanced.sh" ]]; then
                "$SCRIPTS_DIR/quick-deploy-enhanced.sh" "$server" "$user" "$domain"
            else
                log_error "Simple deployment script not found"
                exit 1
            fi
            ;;
        "full")
            log_info "Using full deployment"
            if [[ -f "$SCRIPTS_DIR/deploy-production.sh" ]]; then
                "$SCRIPTS_DIR/deploy-production.sh" "$server" "$user" "$domain"
            else
                log_error "Full deployment script not found"
                exit 1
            fi
            ;;
        "wizard")
            log_info "Using deployment wizard"
            if [[ -f "$SCRIPTS_DIR/deploy-wizard.sh" ]]; then
                "$SCRIPTS_DIR/deploy-wizard.sh"
            else
                log_error "Deployment wizard script not found"
                exit 1
            fi
            ;;
        "auto")
            log_info "Using auto deployment"
            if [[ -f "$SCRIPTS_DIR/auto-ssh-deploy.sh" ]]; then
                "$SCRIPTS_DIR/auto-ssh-deploy.sh" "$server" "$user"
            else
                log_error "Auto deployment script not found"
                exit 1
            fi
            ;;
        *)
            log_error "Unknown deployment type: $deploy_type"
            exit 1
            ;;
    esac
    
    if [[ $? -eq 0 ]]; then
        log_success "Deployment completed successfully!"
        log_info "Application URL: ${domain:-$server}"
        log_info "Use '$0 status' to check deployment status"
    else
        log_error "Deployment failed!"
        exit 1
    fi
}

# Check deployment status
check_status() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    
    log_header "📊 Checking Deployment Status"
    
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    # Load configuration
    load_config "$env"
    
    # Check if server is reachable
    if ! ping -c 1 "$server" &> /dev/null; then
        log_error "Server $server is not reachable"
        exit 1
    fi
    
    log_success "Server $server is reachable"
    
    # Check application health
    local health_url="http://$server:3000/api/health"
    if curl -s "$health_url" &> /dev/null; then
        log_success "Application is responding"
        
        # Get detailed health information
        local health_data
        health_data=$(curl -s "$health_url" | jq '.' 2>/dev/null)
        if [[ $? -eq 0 ]]; then
            echo -e "${CYAN}Health Status:${NC}"
            echo "$health_data"
        fi
    else
        log_error "Application is not responding"
    fi
    
    # Check services via SSH
    log_info "Checking services on $server..."
    if ssh -o ConnectTimeout=10 "$user@$server" "
        echo '=== Docker Services ==='
        docker-compose ps
        echo
        echo '=== System Resources ==='
        free -h
        df -h
        echo
        echo '=== Service Logs (last 10 lines) ==='
        docker-compose logs --tail=10
    " 2>/dev/null; then
        log_success "SSH connection successful"
    else
        log_warning "Could not connect via SSH"
    fi
}

# View logs
view_logs() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    local service=${SERVICE:-""}
    local tail=${TAIL:-50}
    local follow=${FOLLOW:-false}
    
    log_header "📋 Viewing Application Logs"
    
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local cmd="docker-compose logs"
    if [[ "$follow" = true ]]; then
        cmd="$cmd -f"
    fi
    if [[ -n "$tail" ]]; then
        cmd="$cmd --tail=$tail"
    fi
    if [[ -n "$service" ]]; then
        cmd="$cmd $service"
    fi
    
    log_info "Connecting to $server to view logs..."
    ssh -t "$user@$server" "$cmd"
}

# Restart services
restart_services() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    local service=${SERVICE:-""}
    
    log_header "🔄 Restarting Services"
    
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local cmd="docker-compose restart"
    if [[ -n "$service" ]]; then
        cmd="$cmd $service"
    fi
    
    log_info "Restarting services on $server..."
    if ssh "$user@$server" "$cmd"; then
        log_success "Services restarted successfully"
    else
        log_error "Failed to restart services"
        exit 1
    fi
}

# Create backup
create_backup() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    local backup_type=${BACKUP_TYPE:-$DEFAULT_BACKUP_TYPE}
    
    log_header "💾 Creating Backup"
    
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="katacore_backup_${env}_${timestamp}"
    
    echo -e "${BLUE}Backup Configuration:${NC}"
    echo -e "  Environment: ${YELLOW}${env}${NC}"
    echo -e "  Server: ${YELLOW}${server}${NC}"
    echo -e "  Type: ${YELLOW}${backup_type}${NC}"
    echo -e "  Name: ${YELLOW}${backup_name}${NC}"
    echo
    
    case $backup_type in
        "database")
            log_info "Creating database backup..."
            ssh "$user@$server" "
                docker-compose exec -T postgres pg_dump -U postgres katacore | gzip > ${backup_name}.sql.gz
                echo 'Database backup created: ${backup_name}.sql.gz'
            "
            ;;
        "files")
            log_info "Creating files backup..."
            ssh "$user@$server" "
                tar -czf ${backup_name}.tar.gz docker-compose.yml .env uploads/
                echo 'Files backup created: ${backup_name}.tar.gz'
            "
            ;;
        "full")
            log_info "Creating full backup..."
            ssh "$user@$server" "
                docker-compose exec -T postgres pg_dump -U postgres katacore | gzip > ${backup_name}_db.sql.gz
                tar -czf ${backup_name}_files.tar.gz docker-compose.yml .env uploads/
                echo 'Full backup created: ${backup_name}_db.sql.gz and ${backup_name}_files.tar.gz'
            "
            ;;
        *)
            log_error "Unknown backup type: $backup_type"
            exit 1
            ;;
    esac
    
    log_success "Backup created successfully"
}

# System health check
health_check() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local user=${SSH_USER:-$DEFAULT_SSH_USER}
    
    log_header "🏥 System Health Check"
    
    if [[ -z "$server" ]]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    log_info "Performing comprehensive health check on $server..."
    
    if ssh "$user@$server" "
        echo '=== System Information ==='
        uname -a
        echo
        echo '=== System Resources ==='
        echo 'CPU Usage:'
        top -bn1 | grep 'Cpu(s)'
        echo 'Memory Usage:'
        free -h
        echo 'Disk Usage:'
        df -h
        echo
        echo '=== Docker Status ==='
        docker --version
        docker-compose --version
        echo 'Container Status:'
        docker-compose ps
        echo
        echo '=== Service Health ==='
        echo 'Application Health:'
        curl -s http://localhost:3000/api/health | jq '.' 2>/dev/null || echo 'Health endpoint not available'
        echo
        echo 'Database Connection:'
        docker-compose exec -T postgres psql -U postgres -d katacore -c 'SELECT 1;' > /dev/null 2>&1 && echo 'Database: OK' || echo 'Database: ERROR'
        echo 'Redis Connection:'
        docker-compose exec -T redis redis-cli ping 2>/dev/null || echo 'Redis: ERROR'
        echo
        echo '=== Network Status ==='
        echo 'Open Ports:'
        netstat -tulpn | grep -E ':(3000|5432|6379|80|443)'
        echo
        echo '=== Recent Logs ==='
        docker-compose logs --tail=5 app 2>/dev/null || echo 'No recent logs available'
    " 2>/dev/null; then
        log_success "Health check completed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                if [[ -n "${2:-}" ]]; then
                    ENV="$2"
                    shift 2
                else
                    log_error "Option --env requires a value"
                    exit 1
                fi
                ;;
            -s|--server)
                if [[ -n "${2:-}" ]]; then
                    SERVER="$2"
                    shift 2
                else
                    log_error "Option --server requires a value"
                    exit 1
                fi
                ;;
            -u|--user)
                if [[ -n "${2:-}" ]]; then
                    SSH_USER="$2"
                    shift 2
                else
                    log_error "Option --user requires a value"
                    exit 1
                fi
                ;;
            -d|--domain)
                if [[ -n "${2:-}" ]]; then
                    DOMAIN="$2"
                    shift 2
                else
                    log_error "Option --domain requires a value"
                    exit 1
                fi
                ;;
            -k|--key)
                if [[ -n "${2:-}" ]]; then
                    SSH_KEY_PATH="$2"
                    shift 2
                else
                    log_error "Option --key requires a value"
                    exit 1
                fi
                ;;
            -t|--type)
                if [[ -n "${2:-}" ]]; then
                    DEPLOY_TYPE="$2"
                    shift 2
                else
                    log_error "Option --type requires a value"
                    exit 1
                fi
                ;;
            -c|--config)
                if [[ -n "${2:-}" ]]; then
                    CONFIG_FILE="$2"
                    shift 2
                else
                    log_error "Option --config requires a value"
                    exit 1
                fi
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --tail)
                if [[ -n "${2:-}" ]]; then
                    TAIL="$2"
                    shift 2
                else
                    log_error "Option --tail requires a value"
                    exit 1
                fi
                ;;
            --follow)
                FOLLOW=true
                shift
                ;;
            --service)
                if [[ -n "${2:-}" ]]; then
                    SERVICE="$2"
                    shift 2
                else
                    log_error "Option --service requires a value"
                    exit 1
                fi
                ;;
            --backup-type)
                if [[ -n "${2:-}" ]]; then
                    BACKUP_TYPE="$2"
                    shift 2
                else
                    log_error "Option --backup-type requires a value"
                    exit 1
                fi
                ;;
            --message)
                if [[ -n "${2:-}" ]]; then
                    MESSAGE="$2"
                    shift 2
                else
                    log_error "Option --message requires a value"
                    exit 1
                fi
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Main function
main() {
    local command=${1:-help}
    shift 2>/dev/null || true
    
    # Parse remaining arguments
    parse_arguments "$@"
    
    # Check dependencies
    check_dependencies
    
    # Execute command
    case $command in
        "setup")
            setup_wizard
            ;;
        "deploy")
            deploy_application
            ;;
        "status")
            check_status
            ;;
        "logs")
            view_logs
            ;;
        "restart")
            restart_services
            ;;
        "backup")
            create_backup
            ;;
        "health")
            health_check
            ;;
        "local")
            log_info "Starting local deployment..."
            cd "$PROJECT_ROOT" || exit 1
            exec bun run docker:up
            ;;
        "remote")
            log_info "Starting remote deployment..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-remote-fixed.sh "$@"
            ;;
        "production")
            log_info "Starting production deployment..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-production.sh "$@"
            ;;
        "staging")
            log_info "Starting staging deployment..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-production.sh --mode staging "$@"
            ;;
        "development")
            log_info "Starting development deployment..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-production.sh --mode development "$@"
            ;;
        "wizard")
            log_info "Starting deployment wizard..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-wizard.sh
            ;;
        "cleanup")
            log_info "Starting cleanup..."
            cd "$PROJECT_ROOT" || exit 1
            exec ./deployment/scripts/deploy-remote-fixed.sh --cleanup "$@"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"
