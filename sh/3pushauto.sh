#!/bin/bash

# Set default variables
SSH_USER="root"
DEFAULT_SERVER_IP="116.118.48.143"
DEFAULT_PROJECT_NAME="katacore"
TEMP_DIR="/tmp/deploy_$(date +%s)"

# Colors for better display
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function for logging with colors
log() {
    echo -e "${CYAN}📋 $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

error() {
    echo -e "${RED}❌ $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

progress() {
    echo -e "${PURPLE}🔄 $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
}

# Function to get server configuration from user
get_server_config() {
    clear
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                   🛠️  Server Configuration${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    
    # Get server IP
    echo -e "${YELLOW}Enter server IP address:${NC}"
    echo -e "${BLUE}Default: ${DEFAULT_SERVER_IP}${NC}"
    echo -ne "${YELLOW}Server IP (press Enter for default): ${NC}"
    read input_server_ip
    
    if [ -z "$input_server_ip" ]; then
        SERVER_IP="$DEFAULT_SERVER_IP"
    else
        SERVER_IP="$input_server_ip"
    fi
    
    # Validate IP format (basic validation)
    if [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        warning "Invalid IP format. Please use format: xxx.xxx.xxx.xxx"
        echo -ne "${YELLOW}Re-enter server IP: ${NC}"
        read SERVER_IP
        if [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            error "Invalid IP format provided twice. Exiting."
        fi
    fi
    
    echo ""
    
    # Get project name
    echo -e "${YELLOW}Enter project name:${NC}"
    echo -e "${BLUE}Default: ${DEFAULT_PROJECT_NAME}${NC}"
    echo -ne "${YELLOW}Project name (press Enter for default): ${NC}"
    read input_project_name
    
    if [ -z "$input_project_name" ]; then
        PROJECT_NAME="$DEFAULT_PROJECT_NAME"
    else
        PROJECT_NAME="$input_project_name"
    fi
    
    # Validate project name (only alphanumeric and underscores)
    if [[ ! $PROJECT_NAME =~ ^[a-zA-Z0-9_-]+$ ]]; then
        warning "Project name should only contain letters, numbers, underscores, and hyphens"
        echo -ne "${YELLOW}Re-enter project name: ${NC}"
        read PROJECT_NAME
        if [[ ! $PROJECT_NAME =~ ^[a-zA-Z0-9_-]+$ ]]; then
            error "Invalid project name provided twice. Exiting."
        fi
    fi
    
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Configuration Summary:${NC}"
    echo -e "${YELLOW}Server IP:${NC} $SERVER_IP"
    echo -e "${YELLOW}Project Name:${NC} $PROJECT_NAME"
    echo -e "${YELLOW}SSH User:${NC} $SSH_USER"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    
    echo -e "${YELLOW}Is this configuration correct? (Y/n):${NC}"
    read -p "❓ " confirm
    if [[ $confirm =~ ^[Nn]$ ]]; then
        get_server_config  # Recursive call to re-enter configuration
    fi
    
    success "Server configuration completed"
}

# Function to select services
select_services() {
    clear
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                   🛠️  Service Selection Menu${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Select services to deploy (space-separated numbers or 'all'):${NC}"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "  ${GREEN}1)${NC} 🔧 API Service"
    echo -e "  ${GREEN}2)${NC} 🌐 Site Service"
    echo -e "  ${GREEN}3)${NC} 🐘 PostgreSQL Database"
    echo -e "  ${GREEN}4)${NC} 🔴 Redis Cache"
    echo -e "  ${GREEN}5)${NC} 📦 MinIO Object Storage"
    echo -e "  ${GREEN}6)${NC} 🛠️  pgAdmin Database Admin"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Examples:${NC}"
    echo -e "  • ${YELLOW}all${NC} - Deploy all services"
    echo -e "  • ${YELLOW}1 2 3${NC} - Deploy API, Site, and PostgreSQL"
    echo -e "  • ${YELLOW}3 4 5${NC} - Deploy Database stack only"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    
    echo -ne "${YELLOW}Enter your selection: ${NC}"
    read service_selection
    
    # Parse service selection
    SELECTED_SERVICES=""
    if [[ "$service_selection" == "all" ]]; then
        SELECTED_SERVICES="api site postgres redis minio pgadmin"
    else
        for num in $service_selection; do
            case $num in
                1) SELECTED_SERVICES="$SELECTED_SERVICES api" ;;
                2) SELECTED_SERVICES="$SELECTED_SERVICES site" ;;
                3) SELECTED_SERVICES="$SELECTED_SERVICES postgres" ;;
                4) SELECTED_SERVICES="$SELECTED_SERVICES redis" ;;
                5) SELECTED_SERVICES="$SELECTED_SERVICES minio" ;;
                6) SELECTED_SERVICES="$SELECTED_SERVICES pgadmin" ;;
                *) warning "Invalid service number: $num" ;;
            esac
        done
    fi
    
    # Remove leading/trailing spaces and deduplicate
    SELECTED_SERVICES=$(echo $SELECTED_SERVICES | tr ' ' '\n' | sort -u | tr '\n' ' ' | sed 's/^ *//;s/ *$//')
    
    if [ -z "$SELECTED_SERVICES" ]; then
        error "No valid services selected"
    fi
    
    success "Selected services: $SELECTED_SERVICES"
    return 0
}

# Function to show enhanced menu
show_menu() {
    clear
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    🚀 Tazav1 Deployment Tool${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Project:${NC} $PROJECT_NAME"
    echo -e "${YELLOW}Server:${NC} $SSH_USER@$SERVER_IP"
    echo -e "${YELLOW}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Deployment Options:${NC}"
    echo -e "  ${GREEN}0)${NC} ⚙️  Configure server settings"
    echo -e "  ${GREEN}1)${NC} 🔄 Deploy with Git & preserve data (Site & API update)"
    echo -e "  ${GREEN}2)${NC} 🚀 Deploy only (skip git operations)"
    echo -e "  ${GREEN}3)${NC} 🧹 Server cleanup & container fix"
    echo -e "  ${GREEN}4)${NC} 📊 Check server status"
    echo -e "  ${GREEN}5)${NC} 🔧 Fresh deploy (clean env + copy env.local)"
    echo -e "  ${GREEN}6)${NC} 🛠️  Deploy specific services"
    echo -e "  ${RED}q)${NC} 👋 Quit"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
}

# Function for enhanced git operations
git_commit() {
    progress "Starting git operations..."
    
    # Check if there are changes to commit
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "📝 Staging all changes..."
        git add . || error "Failed to stage changes"
        
        echo -e "${YELLOW}Enter commit message (or press Enter for auto-generated):${NC}"
        read -p "💬 " commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="Auto-update $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        progress "Committing with message: '$commit_message'"
        git commit -m "$commit_message" || error "Failed to commit changes"
        
        progress "Pushing to remote repository..."
        git push || error "Failed to push to git repository"
        
        success "Git operations completed successfully"
    else
        warning "No changes detected in git repository"
        info "Repository is up to date"
    fi
}

# Function to check server status
check_server_status() {
    progress "Checking server connection..."
    
    if ssh -o ConnectTimeout=10 "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" >/dev/null 2>&1; then
        success "Server connection established"
        
        progress "Checking Docker status on server..."
        ssh "$SSH_USER@$SERVER_IP" "
            echo '=== Docker Info ==='
            docker --version
            echo ''
            echo '=== Running Containers ==='
            docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            echo ''
            echo '=== System Resources ==='
            df -h / | tail -1 | awk '{print \"Disk Usage: \" \$5 \" of \" \$2}'
            free -h | grep '^Mem:' | awk '{print \"Memory Usage: \" \$3 \"/\" \$2}'
            echo ''
            echo '=== Project Status ==='
            if [ -d '/opt/$PROJECT_NAME' ]; then
                echo 'Project directory exists: ✅'
                cd /opt/$PROJECT_NAME
                if [ -f 'docker-compose.yml' ]; then
                    echo 'Docker compose file exists: ✅'
                    docker compose ps
                else
                    echo 'Docker compose file missing: ❌'
                fi
            else
                echo 'Project directory missing: ❌'
            fi
        "
    else
        error "Cannot connect to server. Please check connection."
    fi
}

# Function for enhanced deployment
deploy_to_server() {
    progress "Initializing deployment process..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing project files for transfer..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env, *.md, *.sh"
    
    # Copy all project files to temp directory
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🌐 Transferring files to remote server..."
    rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Configuring environment on remote server..."
    ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && if [ -f .env.prod ]; then mv .env.prod .env && echo 'Environment file configured'; else echo 'No .env.prod found'; fi" || error "Failed to configure environment"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    server_cleanup
    deploy_application
}

# Function for fresh deployment with env cleanup
fresh_deploy_to_server() {
    progress "Initializing fresh deployment process..."
    
    # Check if env.local exists locally
    if [ ! -f ".env.prod" ]; then
        error ".env.prod file not found in current directory"
    fi
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing project files for fresh deployment..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env*, *.md, *.sh"
    
    # Copy all project files to temp directory (excluding all env files)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env*' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Copy env.local to temp directory as .env
    cp .env.prod "$TEMP_DIR/.env" || error "Failed to copy .env.prod file"
    success "Environment file prepared from .env.prod"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🗑️ Cleaning old environment files on server..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || true
        rm -f .env .env.* 2>/dev/null || true
        echo 'Old environment files removed'
    " || warning "Could not clean old environment files (directory may not exist)"

    progress "🌐 Transferring files to remote server..."
    rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Verifying new environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        if [ -f .env ]; then
            echo '✅ New environment file is in place'
            echo 'Environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
        else
            echo '❌ Environment file missing after transfer'
            exit 1
        fi
    " || error "Failed to verify environment configuration"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    # server_cleanup
    # deploy_application
}

# Combined function: Git commit + Update Site & API only (preserves data services)
git_commit_and_update_preserve_data() {
    # First, handle git operations
    git_commit
    
    progress "🔄 Initializing Site & API update process with data preservation..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing project files for Site & API update..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env, *.md, *.sh"
    
    # Copy all project files to temp directory
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🌐 Transferring updated files to remote server..."
    rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Preserving existing environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        if [ -f .env.prod ]; then
            cp .env.prod .env && echo 'Environment file configured from .env.prod'
        elif [ -f .env ]; then
            echo 'Keeping existing .env file'
        else
            echo 'Warning: No environment file found'
        fi
    " || warning "Could not configure environment file"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    progress "🔄 Updating Site & API services without affecting data services..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '📋 Current directory: \$(pwd)'
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🛑 Stopping only Site & API containers...'
            # Stop only site and api services
            docker compose stop site api 2>/dev/null || true
            docker compose rm -f site api 2>/dev/null || true
            
            # Also handle containers with project prefix
            docker stop \"$PROJECT_NAME-site\" \"$PROJECT_NAME-api\" 2>/dev/null || true
            docker rm -f \"$PROJECT_NAME-site\" \"$PROJECT_NAME-api\" 2>/dev/null || true
            
            echo '📊 Data services status (should remain running):'
            docker compose ps postgres redis minio pgadmin 2>/dev/null || docker ps --filter name=\"$PROJECT_NAME\"
            
            echo '🚀 Rebuilding and starting Site & API services...'
            docker compose up -d --build --force-recreate site api
            
            echo '⏳ Waiting for Site & API services to start...'
            sleep 10
            
            echo '📊 Updated services status:'
            docker compose ps site api
            
            echo '🔍 Checking Site & API health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                site_status=\$(docker compose ps site --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                api_status=\$(docker compose ps api --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                echo \"Site: \$site_status\"
                echo \"API: \$api_status\"
                sleep 3
            done
            
            echo '📋 Recent logs for updated services:'
            echo '--- Site Service Logs ---'
            docker compose logs --tail=15 site 2>/dev/null || echo 'No logs available for site'
            echo '--- API Service Logs ---'
            docker compose logs --tail=15 api 2>/dev/null || echo 'No logs available for api'
            
            echo '✅ All services overview:'
            docker compose ps
        else
            echo '❌ docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to update Site & API services"

    success "🎉 Git commit and Site & API update completed successfully!"
    info "Site and API services have been updated while preserving all data services (PostgreSQL, Redis, MinIO, pgAdmin)"
    warning "Database, cache, and file storage data remain unchanged"
}

# Combined server cleanup and container fix function
server_cleanup_and_container_fix() {
    progress "🧹🚨 Starting comprehensive server cleanup and container fix..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        echo '🛑 Emergency container cleanup and fix...'
        cd /opt/$PROJECT_NAME/ 2>/dev/null || true
        
        # Force stop and remove all containers with project prefix
        echo 'Force stopping containers with $PROJECT_NAME prefix...'
        docker ps -aq --filter name='$PROJECT_NAME-*' | xargs -r docker stop 2>/dev/null || true
        docker ps -aq --filter name='$PROJECT_NAME-*' | xargs -r docker rm -f 2>/dev/null || true
        
        # Also try generic cleanup for common container names
        for container in postgres redis minio pgadmin api site; do
            docker stop \"$PROJECT_NAME-\$container\" 2>/dev/null || true
            docker rm -f \"$PROJECT_NAME-\$container\" 2>/dev/null || true
            # Also try without project prefix in case they exist
            docker stop \"\$container\" 2>/dev/null || true
            docker rm -f \"\$container\" 2>/dev/null || true
        done
        
        # Use docker compose down if docker-compose.yml exists
        if [ -f docker-compose.yml ]; then
            echo 'Running docker compose down...'
            docker compose down --remove-orphans --volumes 2>/dev/null || true
        fi
        
        echo '🗑️  Cleaning Docker system...'
        echo 'Before cleanup:'
        docker system df
        
        # Clean up dangling resources
        docker container prune -f
        docker image prune -f
        docker volume prune -f
        docker network prune -f
        docker system prune -af --volumes
        docker builder prune -af
        
        echo 'After cleanup:'
        docker system df
        
        echo '💾 Clearing system caches...'
        sync && echo 3 > /proc/sys/vm/drop_caches
        
        echo '🗂️  Cleaning temporary files...'
        rm -rf /tmp/* 2>/dev/null || true
        
        echo '📋 Cleaning old logs...'
        find /var/log -name '*.log' -type f -mtime +7 -delete 2>/dev/null || true
        
        echo '📦 Cleaning package cache...'
        apt-get clean 2>/dev/null || yum clean all 2>/dev/null || true
        
        echo '✅ Server cleanup and container fix completed'
        echo 'Current running containers:'
        docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    " || error "Failed to cleanup server and fix containers"

    success "Comprehensive server cleanup and container fix completed successfully"
}

# Enhanced deployment function with service selection
deploy_application() {
    progress "🚀 Deploying application..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '📋 Current directory: \$(pwd)'
        echo '📄 Available files:'
        ls -la
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🛑 Ensuring clean state before deployment...'
            # Force stop and remove any existing containers
            docker ps -a --filter name='$PROJECT_NAME-*' --format '{{.Names}}' | xargs -r docker stop 2>/dev/null || true
            docker ps -a --filter name='$PROJECT_NAME-*' --format '{{.Names}}' | xargs -r docker rm -f 2>/dev/null || true
            
            # Also cleanup by service names
            for container in postgres redis minio pgadmin api site; do
                docker stop \"$PROJECT_NAME-\$container\" 2>/dev/null || true
                docker rm -f \"$PROJECT_NAME-\$container\" 2>/dev/null || true
            done
            
            echo '🐳 Starting Docker Compose deployment...'
            docker compose -f 'docker-compose.yml' down --remove-orphans --volumes 2>/dev/null || true
            docker compose -f 'docker-compose.yml' up -d --build --force-recreate
            
            echo '⏳ Waiting for containers to start...'
            sleep 15
            
            echo '📊 Container status:'
            docker compose ps
            
            echo '🔍 Checking container health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'
                sleep 3
            done
            
            echo '📋 Container logs (last 20 lines):'
            docker compose logs --tail=20
        else
            echo '❌ docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to deploy application"

    success "🎉 Deployment completed successfully!"
    info "Your application should now be running on the server"
}

# Function to deploy specific services
deploy_selected_services() {
    select_services
    
    if [ -z "$SELECTED_SERVICES" ]; then
        error "No services selected"
    fi
    
    progress "🚀 Deploying selected services: $SELECTED_SERVICES"
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '📋 Current directory: \$(pwd)'
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🛑 Cleaning up existing containers...'
            # Force stop and remove any existing containers
            docker ps -a --filter name='$PROJECT_NAME-*' --format '{{.Names}}' | xargs -r docker stop 2>/dev/null || true
            docker ps -a --filter name='$PROJECT_NAME-*' --format '{{.Names}}' | xargs -r docker rm -f 2>/dev/null || true
            
            # Also cleanup by service names
            for container in postgres redis minio pgadmin api site; do
                docker stop \"$PROJECT_NAME-\$container\" 2>/dev/null || true
                docker rm -f \"$PROJECT_NAME-\$container\" 2>/dev/null || true
            done
            
            echo '🛑 Stopping existing containers with compose...'
            docker compose down --remove-orphans --volumes 2>/dev/null || true
            
            echo '🐳 Starting selected services: $SELECTED_SERVICES'
            docker compose up -d --build --force-recreate $SELECTED_SERVICES
            
            echo '⏳ Waiting for containers to start...'
            sleep 15
            
            echo '📊 Container status:'
            docker compose ps
            
            echo '🔍 Checking selected services health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                for service in $SELECTED_SERVICES; do
                    status=\$(docker compose ps \$service --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                    echo \"\$service: \$status\"
                done
                sleep 3
            done
            
            echo '📋 Container logs for selected services:'
            for service in $SELECTED_SERVICES; do
                echo '--- Logs for \$service ---'
                docker compose logs --tail=10 \$service 2>/dev/null || echo 'No logs available for \$service'
            done
        else
            echo '❌ docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to deploy selected services"

    success "🎉 Selected services deployment completed!"
    info "Selected services ($SELECTED_SERVICES) are now running on the server"
}

# Initialize configuration
get_server_config

# Main script with enhanced menu handling
while true; do
    show_menu
    echo -ne "${YELLOW}Enter your choice: ${NC}"
    read choice
    echo ""
    
    case $choice in
        0)
            log "Option 0 selected: Configure server settings"
            get_server_config
            ;;
        1)
            log "Option 1 selected: Deploy with Git & preserve data"
            warning "This will commit git changes and update only Site & API services, preserving all data services"
            echo -e "${YELLOW}Are you sure you want to proceed? (y/N):${NC}"
            read -p "❓ " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                git_commit_and_update_preserve_data
            else
                warning "Deployment cancelled"
            fi
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        2)
            log "Option 2 selected: Deploy only"
            warning "Skipping git operations..."
            deploy_to_server
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        3)
            log "Option 3 selected: Server cleanup & container fix"
            warning "This will perform comprehensive cleanup and fix container conflicts"
            echo -e "${YELLOW}Are you sure you want to proceed? (y/N):${NC}"
            read -p "❓ " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                server_cleanup_and_container_fix
            else
                warning "Cleanup cancelled"
            fi
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        4)
            log "Option 4 selected: Check server status"
            check_server_status
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        5)
            log "Option 5 selected: Fresh deploy with new environment"
            warning "This will remove all old .env files and use .env.prod as new environment"
            echo -e "${YELLOW}Are you sure you want to proceed? (y/N):${NC}"
            read -p "❓ " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                fresh_deploy_to_server
            else
                warning "Fresh deployment cancelled"
            fi
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        6)
            log "Option 6 selected: Deploy specific services"
            deploy_selected_services
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        q|Q)
            echo -e "${GREEN}👋 Thank you for using Tazav1 Deployment Tool!${NC}"
            echo -e "${CYAN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            error "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done
