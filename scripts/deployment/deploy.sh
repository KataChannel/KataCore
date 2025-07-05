#!/bin/bash

# KataCore Master Deployment Script
# This script provides a unified interface for all deployment operations
# Author: KataCore Team
# Version: 1.0.0
# Last Updated: January 2024

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
SCRIPTS_DIR="$DEPLOYMENT_DIR/scripts"
CONFIGS_DIR="$DEPLOYMENT_DIR/configs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"
SHIELD="🛡️"

# Configuration
VERSION="1.0.0"
DEFAULT_ENV="production"
DEFAULT_CONFIG="default"

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
    -e, --env <env>         Environment (dev/staging/prod)
    -s, --server <ip>       Server IP address
    -u, --user <user>       SSH username
    -d, --domain <domain>   Domain name
    -k, --key <path>        SSH key path
    -t, --type <type>       Deployment type (simple/full/cluster)
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
    echo -e "${INFO} ${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${SUCCESS} ${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${WARNING} ${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${ERROR} ${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${CYAN}
╔═══════════════════════════════════════════════════════════╗
║ $1
╚═══════════════════════════════════════════════════════════╝
${NC}"
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
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
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
    
    if [ -f "$config_file" ]; then
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
    echo
    
    # Environment selection
    echo -e "${CYAN}1. Select target environment:${NC}"
    echo "   1) Development"
    echo "   2) Staging"
    echo "   3) Production"
    echo
    read -p "Select option [1-3]: " env_choice
    
    case $env_choice in
        1) ENVIRONMENT="dev" ;;
        2) ENVIRONMENT="staging" ;;
        3) ENVIRONMENT="prod" ;;
        *) log_error "Invalid selection"; exit 1 ;;
    esac
    
    # Server configuration
    echo -e "${CYAN}2. Server Configuration:${NC}"
    read -p "Server IP address: " SERVER_IP
    read -p "SSH username [root]: " SSH_USER
    SSH_USER=${SSH_USER:-root}
    read -p "Domain name (optional): " DOMAIN
    
    # SSH key configuration
    echo -e "${CYAN}3. SSH Key Configuration:${NC}"
    read -p "SSH key path [~/.ssh/id_rsa]: " SSH_KEY_PATH
    SSH_KEY_PATH=${SSH_KEY_PATH:-~/.ssh/id_rsa}
    
    # Deployment type
    echo -e "${CYAN}4. Deployment Type:${NC}"
    echo "   1) Simple (Basic setup)"
    echo "   2) Full (Complete setup with all services)"
    echo "   3) Cluster (Multi-node setup)"
    echo
    read -p "Select option [1-3]: " deploy_choice
    
    case $deploy_choice in
        1) DEPLOY_TYPE="simple" ;;
        2) DEPLOY_TYPE="full" ;;
        3) DEPLOY_TYPE="cluster" ;;
        *) log_error "Invalid selection"; exit 1 ;;
    esac
    
    # Features selection
    echo -e "${CYAN}5. Features Selection:${NC}"
    read -p "Install API service? [Y/n]: " install_api
    read -p "Install PostgreSQL? [Y/n]: " install_postgres
    read -p "Install Redis? [Y/n]: " install_redis
    read -p "Install MinIO? [Y/n]: " install_minio
    read -p "Install pgAdmin? [Y/n]: " install_pgadmin
    
    # SSL configuration
    echo -e "${CYAN}6. SSL Configuration:${NC}"
    read -p "Enable SSL/TLS? [Y/n]: " enable_ssl
    if [[ $enable_ssl =~ ^[Yy]$ ]]; then
        read -p "SSL certificate path (optional): " SSL_CERT_PATH
        read -p "SSL key path (optional): " SSL_KEY_PATH
    fi
    
    # Summary
    echo -e "${CYAN}
╔═══════════════════════════════════════════════════════════╗
║                    Configuration Summary                   ║
╚═══════════════════════════════════════════════════════════╝
${NC}"
    echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
    echo -e "${BLUE}Server:${NC} $SERVER_IP"
    echo -e "${BLUE}User:${NC} $SSH_USER"
    echo -e "${BLUE}Domain:${NC} ${DOMAIN:-"Not specified"}"
    echo -e "${BLUE}Deploy Type:${NC} $DEPLOY_TYPE"
    echo -e "${BLUE}SSH Key:${NC} $SSH_KEY_PATH"
    echo
    
    read -p "Proceed with deployment? [Y/n]: " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        log_info "Starting deployment..."
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
    local user=${SSH_USER:-"root"}
    local domain=${DOMAIN:-""}
    local deploy_type=${DEPLOY_TYPE:-"simple"}
    local force=${FORCE:-false}
    local verbose=${VERBOSE:-false}
    
    log_header "🚀 Deploying KataCore Application"
    
    # Validate parameters
    if [ -z "$server" ]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    # Load environment configuration
    load_config "$env"
    
    # Choose deployment script based on type
    case $deploy_type in
        "simple")
            log_info "Using simple deployment"
            "$SCRIPTS_DIR/quick-deploy-enhanced.sh" "$server" "$user" "$domain"
            ;;
        "full")
            log_info "Using full deployment"
            "$SCRIPTS_DIR/deploy-production.sh" "$server" "$user" "$domain"
            ;;
        "wizard")
            log_info "Using deployment wizard"
            "$SCRIPTS_DIR/deploy-wizard.sh"
            ;;
        "auto")
            log_info "Using auto deployment"
            "$SCRIPTS_DIR/auto-ssh-deploy.sh" "$server" "$user"
            ;;
        *)
            log_error "Unknown deployment type: $deploy_type"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
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
    
    log_header "📊 Checking Deployment Status"
    
    if [ -z "$server" ]; then
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
        local health_data=$(curl -s "$health_url" | jq '.')
        echo -e "${CYAN}Health Status:${NC}"
        echo "$health_data"
    else
        log_error "Application is not responding"
    fi
    
    # Check services via SSH
    log_info "Checking services on $server..."
    ssh -o ConnectTimeout=10 "$SSH_USER@$server" "
        echo '=== Docker Services ==='
        docker-compose ps
        echo
        echo '=== System Resources ==='
        free -h
        df -h
        echo
        echo '=== Service Logs (last 10 lines) ==='
        docker-compose logs --tail=10
    " 2>/dev/null || log_warning "Could not connect via SSH"
}

# View logs
view_logs() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local service=${SERVICE:-""}
    local tail=${TAIL:-50}
    local follow=${FOLLOW:-false}
    
    log_header "📋 Viewing Application Logs"
    
    if [ -z "$server" ]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local cmd="docker-compose logs"
    if [ "$follow" = true ]; then
        cmd="$cmd -f"
    fi
    if [ -n "$tail" ]; then
        cmd="$cmd --tail=$tail"
    fi
    if [ -n "$service" ]; then
        cmd="$cmd $service"
    fi
    
    log_info "Connecting to $server to view logs..."
    ssh -t "$SSH_USER@$server" "$cmd"
}

# Restart services
restart_services() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    local service=${SERVICE:-""}
    
    log_header "🔄 Restarting Services"
    
    if [ -z "$server" ]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local cmd="docker-compose restart"
    if [ -n "$service" ]; then
        cmd="$cmd $service"
    fi
    
    log_info "Restarting services on $server..."
    ssh "$SSH_USER@$server" "$cmd"
    
    if [ $? -eq 0 ]; then
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
    local backup_type=${BACKUP_TYPE:-"database"}
    
    log_header "💾 Creating Backup"
    
    if [ -z "$server" ]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="katacore_backup_${env}_${timestamp}"
    
    case $backup_type in
        "database")
            log_info "Creating database backup..."
            ssh "$SSH_USER@$server" "
                docker-compose exec -T postgres pg_dump -U postgres katacore | gzip > ${backup_name}.sql.gz
                echo 'Database backup created: ${backup_name}.sql.gz'
            "
            ;;
        "files")
            log_info "Creating files backup..."
            ssh "$SSH_USER@$server" "
                tar -czf ${backup_name}.tar.gz docker-compose.yml .env uploads/
                echo 'Files backup created: ${backup_name}.tar.gz'
            "
            ;;
        "full")
            log_info "Creating full backup..."
            ssh "$SSH_USER@$server" "
                docker-compose exec -T postgres pg_dump -U postgres katacore | gzip > ${backup_name}_db.sql.gz
                tar -czf ${backup_name}_files.tar.gz docker-compose.yml .env uploads/
                echo 'Full backup created: ${backup_name}_db.sql.gz and ${backup_name}_files.tar.gz'
            "
            ;;
    esac
    
    log_success "Backup created successfully"
}

# System health check
health_check() {
    local env=${ENV:-$DEFAULT_ENV}
    local server=${SERVER:-""}
    
    log_header "🏥 System Health Check"
    
    if [ -z "$server" ]; then
        log_error "Server IP address is required"
        exit 1
    fi
    
    load_config "$env"
    
    log_info "Performing comprehensive health check on $server..."
    
    ssh "$SSH_USER@$server" "
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
    " 2>/dev/null || log_error "Health check failed"
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENV="$2"
                shift 2
                ;;
            -s|--server)
                SERVER="$2"
                shift 2
                ;;
            -u|--user)
                SSH_USER="$2"
                shift 2
                ;;
            -d|--domain)
                DOMAIN="$2"
                shift 2
                ;;
            -k|--key)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            -t|--type)
                DEPLOY_TYPE="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
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
                TAIL="$2"
                shift 2
                ;;
            --follow)
                FOLLOW=true
                shift
                ;;
            --service)
                SERVICE="$2"
                shift 2
                ;;
            --backup-type)
                BACKUP_TYPE="$2"
                shift 2
                ;;
            --message)
                MESSAGE="$2"
                shift 2
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
            cd "$PROJECT_ROOT"
            exec bun run docker:up
            ;;
        "remote")
            log_info "Starting remote deployment..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-remote-fixed.sh "${@:2}"
            ;;
        "production")
            log_info "Starting production deployment..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-production.sh "${@:2}"
            ;;
        "staging")
            log_info "Starting staging deployment..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-production.sh --mode staging "${@:2}"
            ;;
        "development")
            log_info "Starting development deployment..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-production.sh --mode development "${@:2}"
            ;;
        "wizard")
            log_info "Starting deployment wizard..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-wizard.sh
            ;;
        "cleanup")
            log_info "Starting cleanup..."
            cd "$PROJECT_ROOT"
            exec ./deployment/scripts/deploy-remote-fixed.sh --cleanup "${@:2}"
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
