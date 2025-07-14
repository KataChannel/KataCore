#!/bin/bash

# Set default variables
SSH_USER="root"
DEFAULT_SERVER_IP="116.118.49.243"
DEFAULT_PROJECT_NAME="tazacore"
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

# Function to check service health
check_service_health() {
    local service_name="$1"
    local container_name="${PROJECT_NAME}-${service_name}"
    local max_attempts=10
    local attempt=1
    
    progress "🔍 Checking health of $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        local status=$(ssh "$SSH_USER@$SERVER_IP" "docker inspect --format='{{.State.Status}}' '$container_name' 2>/dev/null || echo 'not_found'")
        
        if [ "$status" = "running" ]; then
            # Additional health checks based on service type
            case $service_name in
                "postgres")
                    local health_check=$(ssh "$SSH_USER@$SERVER_IP" "docker exec '$container_name' pg_isready -U postgres 2>/dev/null && echo 'healthy' || echo 'unhealthy'")
                    ;;
                "redis")
                    local health_check=$(ssh "$SSH_USER@$SERVER_IP" "docker exec '$container_name' redis-cli --no-auth-warning -a \$REDIS_PASSWORD ping 2>/dev/null | grep -q PONG && echo 'healthy' || echo 'unhealthy'")
                    ;;
                "api"|"site")
                    # Check if the service is responding on its port
                    local health_check=$(ssh "$SSH_USER@$SERVER_IP" "docker logs '$container_name' --tail 20 2>/dev/null | grep -i 'error\\|failed\\|exception' >/dev/null && echo 'unhealthy' || echo 'healthy'")
                    ;;
                "minio")
                    local health_check=$(ssh "$SSH_USER@$SERVER_IP" "docker exec '$container_name' curl -f http://localhost:9000/minio/health/live 2>/dev/null && echo 'healthy' || echo 'unhealthy'")
                    ;;
                *)
                    local health_check="healthy"
                    ;;
            esac
            
            if [ "$health_check" = "healthy" ]; then
                success "✅ $service_name is running and healthy"
                return 0
            else
                warning "⚠️  $service_name is running but not healthy (attempt $attempt/$max_attempts)"
            fi
        else
            warning "⚠️  $service_name status: $status (attempt $attempt/$max_attempts)"
        fi
        
        attempt=$((attempt + 1))
        sleep 3
    done
    
    error "❌ $service_name failed health check after $max_attempts attempts"
    return 1
}

# Function to stop only failed services
stop_failed_services() {
    local services_to_check="$1"
    local failed_services=""
    local healthy_services=""
    
    progress "🔍 Analyzing service health status..." >&2
    
    for service in $services_to_check; do
        local container_name="${PROJECT_NAME}-${service}"
        local status=$(ssh "$SSH_USER@$SERVER_IP" "docker inspect --format='{{.State.Status}}' '$container_name' 2>/dev/null || echo 'not_found'")
        
        if [ "$status" = "running" ]; then
            # Check if service is actually healthy
            if check_service_health "$service" >/dev/null 2>&1; then
                healthy_services="$healthy_services $service"
                success "✅ $service is healthy - keeping it running" >&2
            else
                failed_services="$failed_services $service"
                warning "⚠️  $service has issues - will be restarted" >&2
            fi
        else
            failed_services="$failed_services $service"
            warning "⚠️  $service is not running - will be started" >&2
        fi
    done
    
    # Only stop failed services
    if [ -n "$failed_services" ]; then
        progress "🛑 Stopping only failed services: $failed_services" >&2
        ssh "$SSH_USER@$SERVER_IP" "
            cd /opt/$PROJECT_NAME/
            for service in $failed_services; do
                container_name=\"\${PROJECT_NAME}-\$service\"
                echo \"Stopping failed service: \$service\"
                docker stop \"\$container_name\" 2>/dev/null || true
                docker rm -f \"\$container_name\" 2>/dev/null || true
            done
        " >&2
    else
        success "🎉 All services are healthy - no services need to be stopped" >&2
    fi
    
    if [ -n "$healthy_services" ]; then
        info "🟢 Healthy services that will continue running: $healthy_services" >&2
    fi
    
    # Only output the failed services list to stdout (for capture by command substitution)
    echo "$failed_services"
}

# Function to deploy specific services smartly
smart_deploy_services() {
    local services_to_deploy="$1"
    local deployment_mode="$2" # "selective" or "all"
    
    progress "🧠 Smart deployment mode: analyzing current service states..."
    
    # Get list of failed services
    local failed_services
    if [ "$deployment_mode" = "selective" ]; then
        failed_services=$(stop_failed_services "$services_to_deploy" | tr -s ' ' | sed 's/^ *//;s/ *$//')
    else
        failed_services="$services_to_deploy"
    fi
    
    if [ -n "$failed_services" ]; then
        progress "🚀 Starting deployment for services: $failed_services"
        ssh "$SSH_USER@$SERVER_IP" "
            cd /opt/$PROJECT_NAME/
            echo 'SMART PROJECT-SCOPED DEPLOYMENT for $PROJECT_NAME'
            echo 'Services to deploy: $failed_services'
            
            if [ -f 'docker-compose.yml' ]; then
                echo 'Starting selective Docker Compose deployment...'
                
                # Build images first for services that need building
                echo 'Building updated images for services: $failed_services'
                for service in $failed_services; do
                    echo \"Building service: \$service\"
                    COMPOSE_PROJECT_NAME=$PROJECT_NAME docker compose build --no-cache \$service 2>/dev/null || echo \"Note: \$service may not need building\"
                done
                
                # Start only the failed/missing services
                echo 'Starting services: $failed_services'
                COMPOSE_PROJECT_NAME=$PROJECT_NAME docker compose up -d --force-recreate $failed_services
                
                # Wait for services to stabilize
                echo 'Waiting for services to stabilize...'
                sleep 20
                
                # Check each service status
                for service in $failed_services; do
                    container_name=\"\${PROJECT_NAME}-\$service\"
                    status=\$(docker inspect --format='{{.State.Status}}' \"\$container_name\" 2>/dev/null || echo 'not_found')
                    if [ \"\$status\" = \"running\" ]; then
                        echo \"✅ Service \$service: \$status\"
                    else
                        echo \"❌ Service \$service: \$status\"
                    fi
                done
                
                echo ''
                echo 'Final deployment status:'
                docker ps --filter name=\"\${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
                
            else
                echo 'PROJECT docker-compose.yml not found!'
                exit 1
            fi
        " || error "Failed to deploy services"
        
        # Verify deployment success
        progress "🔍 Verifying deployment success..."
        local deployment_success=true
        for service in $failed_services; do
            if check_service_health "$service"; then
                success "✅ $service deployed successfully"
            else
                error "❌ $service deployment failed"
                deployment_success=false
            fi
        done
        
        if [ "$deployment_success" = true ]; then
            success "🎉 Smart deployment completed successfully!"
        else
            error "❌ Some services failed to deploy properly"
        fi
    else
        success "🎉 All services are already running and healthy - no deployment needed!"
    fi
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
    echo -e "${YELLOW}Project Path:${NC} /opt/$PROJECT_NAME"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    
    echo -e "${YELLOW}Is this configuration correct? (Y/n):${NC}"
    read -p "❓ " confirm
    if [[ $confirm =~ ^[Nn]$ ]]; then
        get_server_config  # Recursive call to re-enter configuration
    fi
    
    success "Server configuration completed"
}

# Function to show enhanced menu
show_menu() {
    clear
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    🚀 SMART PROJECT-SCOPED Deployment Tool${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Project:${NC} $PROJECT_NAME"
    echo -e "${YELLOW}Server:${NC} $SSH_USER@$SERVER_IP"
    echo -e "${YELLOW}Project Path:${NC} /opt/$PROJECT_NAME"
    echo -e "${YELLOW}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Smart Deployment Options:${NC}"
    echo -e "  ${GREEN}0)${NC} ⚙️  Configure server settings"
    echo -e "  ${GREEN}1)${NC} 🧠 Smart Deploy with Git (Site & API) - preserves healthy services"
    echo -e "  ${GREEN}2)${NC} 🧠 Smart Deploy ALL with Git - preserves healthy services"
    echo -e "  ${GREEN}3)${NC} 🚀 Deploy only (skip git operations) - smart mode"
    echo -e "  ${GREEN}4)${NC} 🧹 Project cleanup & container fix (PROJECT ONLY)"
    echo -e "  ${GREEN}5)${NC} 📊 Check project status"
    echo -e "  ${GREEN}6)${NC} 🔧 Fresh deploy (clean env + copy env.local)"
    echo -e "  ${GREEN}7)${NC} 🛠️  Smart deploy specific services"
    echo -e "  ${GREEN}8)${NC} 🔍 Debug deployment status"
    echo -e "  ${RED}q)${NC} 👋 Quit"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🧠 SMART MODE: Only restarts failed services, keeps healthy services running${NC}"
    echo -e "${RED}🔒 ALL OPERATIONS ARE PROJECT-SCOPED - NO IMPACT ON OTHER SERVER SERVICES${NC}"
}

# Enhanced git commit and update function with improved error handling
git_commit_and_update_preserve_data() {
    progress "🔍 Checking git repository status..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository. Please initialize git first."
    fi
    
    # Check current branch
    current_branch=$(git branch --show-current)
    progress "Current branch: $current_branch"
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        warning "No changes detected in git repository"
        echo -e "${YELLOW}Continue with deployment anyway? (y/N):${NC}"
        read -p "❓ " continue_anyway
        if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
            info "Deployment cancelled - no git changes to deploy"
            return 0
        fi
    else
        progress "📝 Staging all changes..."
        git add . || error "Failed to stage changes"
        
        # Show what's being committed
        echo -e "${BLUE}Files to be committed:${NC}"
        git diff --cached --name-only | head -20
        
        echo -e "${YELLOW}Enter commit message (or press Enter for auto-generated):${NC}"
        read -p "💬 " commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="Auto-update $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        progress "Committing with message: '$commit_message'"
        git commit -m "$commit_message" || error "Failed to commit changes"
        
        progress "Pushing to remote repository..."
        if ! git push; then
            warning "Failed to push to remote. Trying to set upstream..."
            git push --set-upstream origin "$current_branch" || error "Failed to push to git repository"
        fi
        
        success "Git operations completed successfully"
    fi
    
    progress "🧠 Initializing SMART PROJECT-SCOPED Site & API update process..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing PROJECT files for Site & API update..."
    # More selective exclusion - keep important config files
    info "Excluding: .git, node_modules, *.log, .env.local, .env.development, README.md, *.sh"
    
    # Copy project files with better exclusion pattern
    if command -v rsync >/dev/null 2>&1; then
        rsync -av \
            --exclude='.git/' \
            --exclude='node_modules/' \
            --exclude='*.log' \
            --exclude='.env.local' \
            --exclude='.env.development' \
            --exclude='README.md' \
            --exclude='*.sh' \
            --exclude='tmp/' \
            --exclude='.cache/' \
            --exclude='coverage/' \
            --exclude='.next/' \
            --exclude='dist/' \
            --exclude='build/' \
            . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    else
        # Fallback to find/cp
        find . -type f \
            ! -path './.git/*' \
            ! -path './node_modules/*' \
            ! -name '*.log' \
            ! -name '.env.local' \
            ! -name '.env.development' \
            ! -name 'README.md' \
            ! -name '*.sh' \
            ! -path './tmp/*' \
            ! -path './.cache/*' \
            ! -path './coverage/*' \
            ! -path './.next/*' \
            ! -path './dist/*' \
            ! -path './build/*' \
            -exec cp --parents {} "$TEMP_DIR/" \; || error "Failed to copy files to temp directory"
    fi
    
    # Show what's actually being transferred
    echo -e "${BLUE}Files being transferred:${NC}"
    find "$TEMP_DIR" -type f | head -20
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🔐 Backing up existing PROJECT environment file on server..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || exit 1
        if [ -f .env ]; then
            cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
            echo '✅ PROJECT environment file backed up with timestamp'
        else
            echo '⚠️  No existing PROJECT .env file found to backup'
        fi
    " || warning "Could not backup PROJECT environment file"

    progress "🌐 Transferring updated files to PROJECT directory..."
    # Use rsync WITHOUT delete to avoid removing important files
    if command -v rsync >/dev/null 2>&1; then
        rsync -avz --progress \
            --exclude='.env' \
            --exclude='.env.*' \
            "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    else
        # Fallback - copy new files without deleting existing ones
        scp -r "$TEMP_DIR/"* "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    fi
    
    progress "🔧 Restoring preserved PROJECT environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        
        # Restore from timestamped backup first
        LATEST_BACKUP=\$(ls -t .env.backup.* 2>/dev/null | head -n1)
        if [ -n \"\$LATEST_BACKUP\" ] && [ ! -f .env ]; then
            cp \"\$LATEST_BACKUP\" .env
            echo '✅ PROJECT environment file restored from backup: '\$LATEST_BACKUP
        elif [ -f .env.temp.backup ]; then
            cp .env.temp.backup .env
            rm .env.temp.backup
            echo '✅ PROJECT environment file restored from temp backup'
        elif [ -f .env.prod ]; then
            cp .env.prod .env
            echo '📝 Using .env.prod as fallback PROJECT environment'
        else
            echo '❌ No PROJECT environment file available'
        fi
        
        # Verify environment file
        if [ -f .env ]; then
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
            echo '✅ Environment file verified'
        else
            echo '❌ No environment file found after restoration'
        fi
        
        # Show updated files
        echo '📋 Updated PROJECT files:'
        ls -la | grep -E '\.(js|ts|json|yml|yaml)$' | head -10
    " || warning "Could not restore PROJECT environment file"
    
    # Verify file transfer
    verify_file_transfer
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    # Force rebuild and deploy Site & API with new code
    progress "🔥 Force rebuilding Site & API services to ensure new code is deployed..."
    force_rebuild_and_deploy "site api"
    
    success "🎉 Git commit and SMART PROJECT Site & API update completed successfully!"
    info "✅ PROJECT Site and API services FORCE REBUILT with latest code"
    info "✅ PROJECT environment file (.env) preserved unchanged"
    info "✅ Database and other services continue running without interruption"
    warning "🔥 FORCE REBUILD: New code is guaranteed to be deployed"
}

# Debug function to check what's actually happening
debug_deployment_status() {
    progress "🔍 Debugging deployment status..."
    
    echo -e "${BLUE}Local git status:${NC}"
    git status --short | head -10
    
    echo -e "${BLUE}Local files in current directory:${NC}"
    ls -la | head -10
    
    echo -e "${BLUE}Remote server status:${NC}"
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || echo 'Directory not found'
        echo 'Files in project directory:'
        ls -la | head -10
        echo ''
        echo 'Environment file status:'
        if [ -f .env ]; then
            echo 'Environment file exists with' \$(wc -l < .env) 'lines'
            echo 'Sample env vars:'
            head -5 .env | grep -v 'PASSWORD\|SECRET\|KEY' || echo 'No safe env vars to show'
        else
            echo 'No environment file found'
        fi
        echo ''
        echo 'Docker compose file:'
        if [ -f docker-compose.yml ]; then
            echo 'docker-compose.yml exists'
        else
            echo 'docker-compose.yml missing'
        fi
        echo ''
        echo 'Container status:'
        docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    "
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
            log "Option 1 selected: Smart Deploy with Git (Site & API)"
            warning "🧠 SMART MODE: Only unhealthy Site & API services will be restarted"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME Site & API"
            git_commit_and_update_preserve_data
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        2)
            log "Option 2 selected: Smart Deploy ALL with Git"
            warning "🧠 SMART MODE: Only unhealthy services will be restarted"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME services"
            git_commit_and_update_all_preserve_data
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        3)
            log "Option 3 selected: Deploy only (skip git operations)"
            warning "🧠 SMART MODE: Only unhealthy services will be restarted"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME services"
            deploy_to_server
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        5)
            log "Option 5 selected: Check project status"
            check_server_status
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        6)
            log "Option 6 selected: Fresh deploy"
            warning "🔧 FRESH DEPLOY: Will replace environment file with local .env.prod"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME containers"
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
        7)
            log "Option 7 selected: Smart deploy specific services"
            warning "🧠 SMART MODE: Only unhealthy selected services will be restarted"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects selected $PROJECT_NAME services"
            deploy_selected_services
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        8)
            log "Option 8 selected: Debug deployment status"
            debug_deployment_status
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        q|Q)
            echo -e "${GREEN}👋 Thank you for using SMART PROJECT-SCOPED Deployment Tool!${NC}"
            echo -e "${CYAN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            error "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done

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

# Function for enhanced git operations
git_commit() {
    progress "Starting git operations..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository. Please initialize git first."
    fi
    
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

# Function to check project status (STRICTLY PROJECT-SCOPED)
check_server_status() {
    progress "Checking server connection..."
    
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" >/dev/null 2>&1; then
        success "Server connection established"
        
        progress "Checking PROJECT-ONLY status on server..."
        ssh "$SSH_USER@$SERVER_IP" "
            echo '🔒════════════════════════════════════════════════🔒'
            echo '🔒          PROJECT-SCOPED STATUS REPORT         🔒'
            echo '🔒                PROJECT: $PROJECT_NAME          🔒'
            echo '🔒════════════════════════════════════════════════🔒'
            echo ''
            
            echo '📋 Project Directory Information:'
            if [ -d '/opt/$PROJECT_NAME' ]; then
                echo '✅ Project directory exists: /opt/$PROJECT_NAME'
                echo '📂 Directory size:' \$(du -sh /opt/$PROJECT_NAME 2>/dev/null | cut -f1)
                cd /opt/$PROJECT_NAME
                echo '📄 Main files:'
                ls -la | grep -E '(docker-compose|\.env|Dockerfile)' || echo '   No main config files found'
            else
                echo '❌ Project directory missing: /opt/$PROJECT_NAME'
                echo 'Creating project directory...'
                mkdir -p /opt/$PROJECT_NAME
                echo '✅ Project directory created'
            fi
            echo ''
            
            echo '🐳 PROJECT-SPECIFIC Docker Resources:'
            echo '───────────────────────────────────────────'
            echo '📦 Project Containers (running):'
            PROJECT_CONTAINERS=\$(docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null)
            if [ -n \"\$PROJECT_CONTAINERS\" ]; then
                echo \"\$PROJECT_CONTAINERS\"
            else
                echo '   No project containers running'
            fi
            echo ''
            
            echo '🔍 Service Health Analysis:'
            for service in api site postgres redis minio pgadmin; do
                container_name=\"${PROJECT_NAME}-\$service\"
                if docker ps --filter name=\"\$container_name\" --format '{{.Names}}' 2>/dev/null | grep -q \"^\$container_name\$\"; then
                    status=\$(docker inspect --format='{{.State.Status}}' \"\$container_name\" 2>/dev/null)
                    echo \"  \$service: \$status ✅\"
                else
                    echo \"  \$service: not running ❌\"
                fi
            done
            echo ''
            
            echo '✅ PROJECT-SCOPED operations ensure server isolation'
        "
    else
        error "Cannot connect to server. Please check connection and SSH key authentication."
    fi
}

# Function for enhanced deployment
deploy_to_server() {
    progress "Initializing SMART PROJECT-SCOPED deployment process..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing project files for transfer..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env, *.md, *.sh"
    
    # Copy all project files to temp directory
    if command -v rsync >/dev/null 2>&1; then
        rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    else
        # Fallback to cp if rsync is not available
        find . -type f \
            ! -path './.git/*' \
            ! -path './node_modules/*' \
            ! -name '*.log' \
            ! -name '.env*' \
            ! -name '*.md' \
            ! -name '*.sh' \
            -exec cp --parents {} "$TEMP_DIR/" \; || error "Failed to copy files to temp directory"
    fi
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🌐 Transferring files to remote server PROJECT directory..."
    if command -v rsync >/dev/null 2>&1; then
        rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    else
        scp -r "$TEMP_DIR/"* "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    fi
    
    progress "🔧 Configuring PROJECT environment on remote server..."
    ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && if [ -f .env.prod ]; then cp .env.prod .env && echo 'PROJECT environment file configured'; else echo 'No .env.prod found for PROJECT'; fi" || error "Failed to configure PROJECT environment"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    # Use smart deployment
    smart_deploy_services "api site postgres redis minio pgadmin" "selective"
}

# Function for fresh deployment with env cleanup
fresh_deploy_to_server() {
    progress "Initializing PROJECT-SCOPED fresh deployment process..."
    
    # Check if env.prod exists locally
    if [ ! -f ".env.prod" ]; then
        error ".env.prod file not found in current directory"
    fi
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing project files for PROJECT fresh deployment..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env*, *.md, *.sh"
    
    # Copy all project files to temp directory (excluding all env files)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env*' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Copy env.prod to temp directory as .env
    cp .env.prod "$TEMP_DIR/.env" || error "Failed to copy .env.prod file"
    success "PROJECT environment file prepared from .env.prod"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🗑️ Cleaning old PROJECT environment files on server..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || true
        rm -f .env .env.* 2>/dev/null || true
        echo 'Old PROJECT environment files removed'
    " || warning "Could not clean old PROJECT environment files (directory may not exist)"

    progress "🌐 Transferring files to PROJECT directory on remote server..."
    rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Verifying new PROJECT environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        if [ -f .env ]; then
            echo '✅ New PROJECT environment file is in place'
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
        else
            echo '❌ PROJECT environment file missing after transfer'
            exit 1
        fi
    " || error "Failed to verify PROJECT environment configuration"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"
    
    # Use smart deployment for fresh deploy
    smart_deploy_services "api site postgres redis minio pgadmin" "all"
}

# NEW FUNCTION: Combined function: Git commit + Update ALL services while preserving data - SMART MODE
git_commit_and_update_all_preserve_data() {
    # First, handle git operations
    git_commit
    
    progress "🧠 Initializing SMART PROJECT-SCOPED ALL services update process..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing PROJECT files for ALL services update..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env*, *.md, *.sh"
    
    # Copy all project files to temp directory (excluding ALL env files)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env*' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🔐 Backing up existing PROJECT environment file and data volumes on server..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || exit 1
        if [ -f .env ]; then
            cp .env .env.backup
            echo '✅ PROJECT environment file backed up as .env.backup'
        else
            echo '⚠️  No existing PROJECT .env file found to backup'
        fi
        
        # Create data backup info (STRICTLY PROJECT-SCOPED)
        echo '📋 Current PROJECT data volumes:'
        docker volume ls | grep \"${PROJECT_NAME}\" 2>/dev/null || echo 'No PROJECT volumes found'
    " || warning "Could not backup PROJECT environment file"

    progress "🌐 Transferring updated files to PROJECT directory (excluding env files)..."
    # Use --exclude to prevent overwriting .env files during transfer
    rsync -avz --progress --exclude='.env*' "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Restoring preserved PROJECT environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        
        # Restore from timestamped backup first
        LATEST_BACKUP=\$(ls -t .env.backup.* 2>/dev/null | head -n1)
        if [ -n \"\$LATEST_BACKUP\" ] && [ ! -f .env ]; then
            cp \"\$LATEST_BACKUP\" .env
            echo '✅ PROJECT environment file restored from backup: '\$LATEST_BACKUP
        elif [ -f .env.temp.backup ]; then
            cp .env.temp.backup .env
            rm .env.temp.backup
            echo '✅ PROJECT environment file restored from temp backup'
        elif [ -f .env.prod ]; then
            cp .env.prod .env
            echo '📝 Using .env.prod as fallback PROJECT environment'
        else
            echo '❌ No PROJECT environment file available'
        fi
        
        # Verify environment file
        if [ -f .env ]; then
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
            echo '✅ Environment file verified'
        else
            echo '❌ No environment file found after restoration'
        fi
        
        # Show updated files
        echo '📋 Updated PROJECT files:'
        ls -la | grep -E '\.(js|ts|json|yml|yaml)$' | head -10
    " || warning "Could not restore PROJECT environment file"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    # Force rebuild and deploy ALL services with new code
    progress "🔥 Force rebuilding ALL services to ensure new code is deployed..."
    force_rebuild_and_deploy "api site postgres redis minio pgadmin"
    
    success "🎉 Git commit and SMART PROJECT ALL services update completed successfully!"
    info "✅ PROJECT services FORCE REBUILT with latest code"
    info "✅ PROJECT environment file (.env) preserved unchanged"
    info "✅ Database and other services continue running without interruption"
    warning "🔥 FORCE REBUILD: New code is guaranteed to be deployed"
}

# Function to verify file transfer and important files
verify_file_transfer() {
    progress "🔍 Verifying file transfer and important files..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        
        echo '📋 Checking for important project files:'
        
        # Check for package.json files
        if [ -f 'site/package.json' ]; then
            echo '✅ site/package.json found'
        else
            echo '❌ site/package.json missing'
        fi
        
        if [ -f 'api/package.json' ]; then
            echo '✅ api/package.json found'
        else
            echo '❌ api/package.json missing'
        fi
        
        # Check for docker-compose file
        if [ -f 'docker-compose.yml' ]; then
            echo '✅ docker-compose.yml found'
        else
            echo '❌ docker-compose.yml missing'
        fi
        
        # Check for Dockerfiles
        if [ -f 'site/Dockerfile' ]; then
            echo '✅ site/Dockerfile found'
        else
            echo '⚠️  site/Dockerfile missing'
        fi
        
        if [ -f 'api/Dockerfile' ]; then
            echo '✅ api/Dockerfile found'
        else
            echo '⚠️  api/Dockerfile missing'
        fi
        
        # Show recent file modification times to verify update
        echo ''
        echo '📅 Recent file modifications (to verify update):'
        find . -maxdepth 2 -name '*.json' -o -name '*.js' -o -name '*.ts' -o -name 'Dockerfile' 2>/dev/null | head -10 | xargs ls -la 2>/dev/null | head -5
        
        echo ''
        echo '📊 Project directory size:'
        du -sh . 2>/dev/null || echo 'Cannot calculate size'
    " || warning "Could not verify file transfer"
}

# Function to test option 1 deployment
test_option1_deployment() {
    progress "🧪 Testing Option 1 - Smart Deploy with Git (Site & API)..."
    
    echo -e "${YELLOW}This will test the full deployment process. Continue? (y/N):${NC}"
    read -p "❓ " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        info "Test cancelled"
        return 0
    fi
    
    # Show what will happen
    info "📋 Test Process:"
    info "1. Check git status and commit changes"
    info "2. Prepare and transfer files"
    info "3. Verify file transfer"
    info "4. Force rebuild Docker images"
    info "5. Deploy services"
    info "6. Verify deployment"
    
    echo -e "${YELLOW}Proceed with test? (y/N):${NC}"
    read -p "❓ " final_confirm
    if [[ ! $final_confirm =~ ^[Yy]$ ]]; then
        info "Test cancelled"
        return 0
    fi
    
    # Execute option 1
    git_commit_and_update_preserve_data
    
    success "🧪 Test completed! Check the results above."
}
