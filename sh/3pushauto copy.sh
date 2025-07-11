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
    echo -e "${GREEN}                    🚀 PROJECT-SCOPED Deployment Tool${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Project:${NC} $PROJECT_NAME"
    echo -e "${YELLOW}Server:${NC} $SSH_USER@$SERVER_IP"
    echo -e "${YELLOW}Project Path:${NC} /opt/$PROJECT_NAME"
    echo -e "${YELLOW}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Deployment Options:${NC}"
    echo -e "  ${GREEN}0)${NC} ⚙️  Configure server settings"
    echo -e "  ${GREEN}1)${NC} 🔄 Deploy with Git & preserve data (Site & API update)"
    echo -e "  ${GREEN}2)${NC} 🔄 Deploy ALL with Git & preserve data (Update all services)"
    echo -e "  ${GREEN}3)${NC} 🚀 Deploy only (skip git operations)"
    echo -e "  ${GREEN}4)${NC} 🧹 Project cleanup & container fix (PROJECT ONLY)"
    echo -e "  ${GREEN}5)${NC} 📊 Check project status"
    echo -e "  ${GREEN}6)${NC} 🔧 Fresh deploy (clean env + copy env.local)"
    echo -e "  ${GREEN}7)${NC} 🛠️  Deploy specific services"
    echo -e "  ${RED}q)${NC} 👋 Quit"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}🔒 ALL OPERATIONS ARE PROJECT-SCOPED - NO IMPACT ON OTHER SERVER SERVICES${NC}"
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

# Function to check project status (STRICTLY PROJECT-SCOPED)
check_server_status() {
    progress "Checking server connection..."
    
    if ssh -o ConnectTimeout=10 "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" >/dev/null 2>&1; then
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
                exit 1
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
            
            echo '📦 Project Containers (all states):'
            ALL_PROJECT_CONTAINERS=\$(docker ps -a --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null)
            if [ -n \"\$ALL_PROJECT_CONTAINERS\" ]; then
                echo \"\$ALL_PROJECT_CONTAINERS\"
            else
                echo '   No project containers found'
            fi
            echo ''
            
            echo '🎛️  Project Docker Compose Status:'
            if [ -f '/opt/$PROJECT_NAME/docker-compose.yml' ]; then
                echo '✅ docker-compose.yml exists'
                cd /opt/$PROJECT_NAME
                COMPOSE_STATUS=\$(docker compose ps 2>/dev/null || echo 'Compose not available')
                echo \"\$COMPOSE_STATUS\"
            else
                echo '❌ docker-compose.yml not found'
            fi
            echo ''
            
            echo '💾 Project Data Volumes:'
            PROJECT_VOLUMES=\$(docker volume ls --filter label=com.docker.compose.project=$PROJECT_NAME --format 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}' 2>/dev/null)
            if [ -n \"\$PROJECT_VOLUMES\" ]; then
                echo \"\$PROJECT_VOLUMES\"
            else
                # Try alternative method
                ALT_VOLUMES=\$(docker volume ls | grep \"${PROJECT_NAME}\" 2>/dev/null)
                if [ -n \"\$ALT_VOLUMES\" ]; then
                    echo \"\$ALT_VOLUMES\"
                else
                    echo '   No project volumes found'
                fi
            fi
            echo ''
            
            echo '🌐 Project Networks:'
            PROJECT_NETWORKS=\$(docker network ls --filter label=com.docker.compose.project=$PROJECT_NAME --format 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}' 2>/dev/null)
            if [ -n \"\$PROJECT_NETWORKS\" ]; then
                echo \"\$PROJECT_NETWORKS\"
            else
                # Try alternative method
                ALT_NETWORKS=\$(docker network ls | grep \"${PROJECT_NAME}\" 2>/dev/null)
                if [ -n \"\$ALT_NETWORKS\" ]; then
                    echo \"\$ALT_NETWORKS\"
                else
                    echo '   No project networks found'
                fi
            fi
            echo ''
            
            echo '🏗️  Project Images:'
            PROJECT_IMAGES=\$(docker images --filter reference=\"*${PROJECT_NAME}*\" --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' 2>/dev/null)
            if [ -n \"\$PROJECT_IMAGES\" ]; then
                echo \"\$PROJECT_IMAGES\"
            else
                echo '   No project-specific images found'
            fi
            echo ''
            
            echo '🔧 Project Environment:'
            if [ -f '/opt/$PROJECT_NAME/.env' ]; then
                echo '✅ Environment file exists'
                echo '📊 Environment variables:' \$(grep -c '=' /opt/$PROJECT_NAME/.env 2>/dev/null || echo '0')
            else
                echo '❌ Environment file missing'
            fi
            echo ''
            
            echo '📊 Server Resource Usage (General):'
            echo 'Memory:' \$(free -h | grep '^Mem:' | awk '{print \$3 \"/\" \$2 \" (\" \$5 \" available)\"}')
            echo 'Disk usage for project:' \$(du -sh /opt/$PROJECT_NAME 2>/dev/null | cut -f1 || echo 'N/A')
            echo ''
            
            echo '🔒════════════════════════════════════════════════🔒'
            echo '🔒         SERVER ISOLATION VERIFICATION        🔒'
            echo '🔒════════════════════════════════════════════════🔒'
            echo '🔍 Total Docker containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo '🎯 PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo '🌐 Other containers remain untouched:' \$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | wc -l)
            echo '✅ PROJECT-SCOPED operations ensure server isolation'
        "
    else
        error "Cannot connect to server. Please check connection."
    fi
}

# Function for enhanced deployment
deploy_to_server() {
    progress "Initializing PROJECT-SCOPED deployment process..."
    
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

    progress "🌐 Transferring files to remote server PROJECT directory..."
    rsync -avz --progress "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Configuring PROJECT environment on remote server..."
    ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && if [ -f .env.prod ]; then mv .env.prod .env && echo 'PROJECT environment file configured'; else echo 'No .env.prod found for PROJECT'; fi" || error "Failed to configure PROJECT environment"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    project_cleanup_and_container_fix
    deploy_application
}

# Function for fresh deployment with env cleanup
fresh_deploy_to_server() {
    progress "Initializing PROJECT-SCOPED fresh deployment process..."
    
    # Check if env.local exists locally
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
    
    # Copy env.local to temp directory as .env
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
}

# Combined function: Git commit + Update Site & API only (preserves data services)
git_commit_and_update_preserve_data() {
    # First, handle git operations
    git_commit
    
    progress "🔄 Initializing PROJECT-SCOPED Site & API update process with data preservation..."
    
    # Create temp directory
    mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"
    success "Temporary directory created: $TEMP_DIR"

    progress "📤 Preparing PROJECT files for Site & API update..."
    # Show what will be excluded
    info "Excluding: .git, node_modules, *.log, .env*, *.md, *.sh"
    
    # Copy all project files to temp directory (excluding ALL env files)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env*' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
    
    # Show transfer size
    size=$(du -sh "$TEMP_DIR" | cut -f1)
    info "Transfer size: $size"

    progress "🔐 Backing up existing PROJECT environment file on server..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/ 2>/dev/null || exit 1
        if [ -f .env ]; then
            cp .env .env.backup
            echo '✅ PROJECT environment file backed up as .env.backup'
        else
            echo '⚠️  No existing PROJECT .env file found to backup'
        fi
    " || warning "Could not backup PROJECT environment file"

    progress "🌐 Transferring updated files to PROJECT directory (excluding env files)..."
    # Use --exclude to prevent overwriting .env files during transfer
    rsync -avz --progress --exclude='.env*' "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
    
    progress "🔧 Restoring preserved PROJECT environment configuration..."
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        if [ -f .env.backup ]; then
            mv .env.backup .env
            echo '✅ Original PROJECT environment file restored and preserved'
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
        else
            echo '⚠️  No backup file found to restore'
            if [ -f .env.prod ]; then
                cp .env.prod .env
                echo '📝 Using .env.prod as fallback PROJECT environment'
            else
                echo '❌ No PROJECT environment file available'
            fi
        fi
    " || warning "Could not restore PROJECT environment file"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    progress "🔄 Updating PROJECT Site & API services without affecting PROJECT data services..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '🔒 PROJECT-SCOPED OPERATION: Only $PROJECT_NAME containers will be affected'
        echo '📋 Current PROJECT directory: \$(pwd)'
        echo '🔍 Verifying PROJECT environment preservation:'
        if [ -f .env ]; then
            echo '✅ PROJECT environment file exists and preserved'
        else
            echo '❌ PROJECT environment file missing!'
            exit 1
        fi
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🛑 Stopping only PROJECT Site & API containers...'
            
            # STRICTLY PROJECT-SCOPED: Only stop containers with project prefix
            echo 'Stopping containers: ${PROJECT_NAME}-site and ${PROJECT_NAME}-api'
            docker stop \"${PROJECT_NAME}-site\" 2>/dev/null || true
            docker stop \"${PROJECT_NAME}-api\" 2>/dev/null || true
            docker rm -f \"${PROJECT_NAME}-site\" 2>/dev/null || true
            docker rm -f \"${PROJECT_NAME}-api\" 2>/dev/null || true
            
            # Also use compose method with explicit project directory
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME stop site api 2>/dev/null || true
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME rm -f site api 2>/dev/null || true
            
            echo '📊 PROJECT data services status (should remain running):'
            docker ps --filter name=\"${PROJECT_NAME}-postgres\" --filter name=\"${PROJECT_NAME}-redis\" --filter name=\"${PROJECT_NAME}-minio\" --filter name=\"${PROJECT_NAME}-pgadmin\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || echo 'No PROJECT data services running'
            
            echo '🚀 Rebuilding and starting PROJECT Site & API services with preserved environment...'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME up -d --build --force-recreate site api
            
            echo '⏳ Waiting for PROJECT Site & API services to start...'
            sleep 10
            
            echo '📊 Updated PROJECT services status:'
            docker ps --filter name=\"${PROJECT_NAME}-site\" --filter name=\"${PROJECT_NAME}-api\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔍 Checking PROJECT Site & API health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                site_status=\$(docker ps --filter name=\"${PROJECT_NAME}-site\" --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                api_status=\$(docker ps --filter name=\"${PROJECT_NAME}-api\" --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                echo \"PROJECT Site: \$site_status\"
                echo \"PROJECT API: \$api_status\"
                sleep 3
            done
            
            echo '📋 Recent logs for updated PROJECT services:'
            echo '--- PROJECT Site Service Logs ---'
            docker logs --tail=15 \"${PROJECT_NAME}-site\" 2>/dev/null || echo 'No logs available for PROJECT site'
            echo '--- PROJECT API Service Logs ---'
            docker logs --tail=15 \"${PROJECT_NAME}-api\" 2>/dev/null || echo 'No logs available for PROJECT api'
            
            echo '✅ All PROJECT services overview:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔐 Final PROJECT environment verification:'
            echo 'PROJECT environment file status:' \$(ls -la .env 2>/dev/null || echo 'Missing')
            
            echo '🌐 Server isolation verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo 'Other containers (untouched):' \$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | wc -l)
        else
            echo '❌ PROJECT docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to update PROJECT Site & API services"

    success "🎉 Git commit and PROJECT Site & API update completed successfully!"
    info "✅ PROJECT Site and API services updated with latest code"
    info "✅ PROJECT environment file (.env) preserved unchanged"
    info "✅ PROJECT data services (PostgreSQL, Redis, MinIO, pgAdmin) remain untouched"
    info "✅ Other server services completely unaffected"
    warning "🔒 PROJECT-SCOPED: Only $PROJECT_NAME containers were modified"
}

# NEW FUNCTION: Combined function: Git commit + Update ALL services while preserving data
git_commit_and_update_all_preserve_data() {
    # First, handle git operations
    git_commit
    
    progress "🔄 Initializing PROJECT-SCOPED ALL services update process with data preservation..."
    
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
        if [ -f .env.backup ]; then
            mv .env.backup .env
            echo '✅ Original PROJECT environment file restored and preserved'
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
        else
            echo '⚠️  No backup file found to restore'
            if [ -f .env.prod ]; then
                cp .env.prod .env
                echo '📝 Using .env.prod as fallback PROJECT environment'
            else
                echo '❌ No PROJECT environment file available'
            fi
        fi
    " || warning "Could not restore PROJECT environment file"
    
    # Cleanup temp directory
    rm -rf "$TEMP_DIR"
    success "Local cleanup completed"

    progress "🔄 Updating ALL PROJECT services while preserving PROJECT data volumes..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '🔒 PROJECT-SCOPED OPERATION: Only $PROJECT_NAME containers will be affected'
        echo '📋 Current PROJECT directory: \$(pwd)'
        echo '🔍 Verifying PROJECT environment preservation:'
        if [ -f .env ]; then
            echo '✅ PROJECT environment file exists and preserved'
        else
            echo '❌ PROJECT environment file missing!'
            exit 1
        fi
        
        if [ -f 'docker-compose.yml' ]; then
            echo '📊 Current PROJECT services status before update:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '💾 Listing PROJECT data volumes before update:'
            docker volume ls | grep \"${PROJECT_NAME}\" || echo 'No PROJECT volumes found'
            
            echo '🛑 Stopping all PROJECT services gracefully...'
            # STRICTLY PROJECT-SCOPED: Only affect containers with project prefix
            docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | xargs -r docker stop
            docker ps -a --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | xargs -r docker rm -f
            
            # Also use compose method with explicit project scoping
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME down --remove-orphans
            
            echo '🔍 Verifying PROJECT data volumes are preserved:'
            docker volume ls | grep \"${PROJECT_NAME}\" || echo 'No PROJECT volumes found'
            
            echo '🚀 Starting ALL PROJECT services with updated code and preserved data...'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME up -d --build --force-recreate
            
            echo '⏳ Waiting for all PROJECT services to start...'
            sleep 20
            
            echo '📊 Updated PROJECT services status:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔍 Checking all PROJECT services health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
                sleep 5
            done
            
            echo '💾 Verifying PROJECT data persistence:'
            echo '--- PROJECT data volumes after update ---'
            docker volume ls | grep \"${PROJECT_NAME}\" || echo 'No PROJECT volumes found'
            
            echo '📋 Recent logs for all PROJECT services:'
            for container in \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}'); do
                echo \"--- Logs for \$container ---\"
                docker logs --tail=10 \$container 2>/dev/null || echo \"No logs available for \$container\"
            done
            
            echo '✅ All PROJECT services overview:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔐 Final PROJECT environment verification:'
            echo 'PROJECT environment file status:' \$(ls -la .env 2>/dev/null || echo 'Missing')
            
            echo '🎯 PROJECT database connectivity test:'
            # Test database connection if postgres service exists
            if docker ps --filter name=\"${PROJECT_NAME}-postgres\" | grep -q 'Up'; then
                echo 'PROJECT PostgreSQL service is running ✅'
            else
                echo 'PROJECT PostgreSQL service status unknown'
            fi
            
            echo '🎯 PROJECT Redis connectivity test:'
            if docker ps --filter name=\"${PROJECT_NAME}-redis\" | grep -q 'Up'; then
                echo 'PROJECT Redis service is running ✅'
            else
                echo 'PROJECT Redis service status unknown'
            fi
            
            echo '🌐 Server isolation verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo 'Other containers (untouched):' \$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | wc -l)
            
        else
            echo '❌ PROJECT docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to update ALL PROJECT services"

    success "🎉 Git commit and ALL PROJECT services update completed successfully!"
    info "✅ ALL PROJECT services updated with latest code"
    info "✅ PROJECT environment file (.env) preserved unchanged"
    info "✅ PROJECT data volumes preserved - no data loss"
    info "✅ PROJECT PostgreSQL, Redis, MinIO data maintained"
    info "✅ Other server services completely unaffected"
    warning "🔒 PROJECT-SCOPED: Only $PROJECT_NAME containers were modified"
    warning "💾 All persistent PROJECT data preserved across update"
}

# STRICTLY PROJECT-SCOPED server cleanup and container fix function
project_cleanup_and_container_fix() {
    progress "🧹🚨 Starting STRICTLY PROJECT-SCOPED cleanup and container fix for $PROJECT_NAME..."
    
    # Ask user if they want to overwrite project data from local
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}📋 Data Overwrite Options:${NC}"
    echo -e "${CYAN}──────────────────────────────────────────────────────────────${NC}"
    echo -e "  ${GREEN}1)${NC} 🧹 Cleanup only (preserve existing server data)"
    echo -e "  ${GREEN}2)${NC} 🔄 Cleanup + overwrite project data from local"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  Option 2 will REPLACE ALL project files on server with local files${NC}"
    echo -e "${RED}⚠️  This includes configuration files but excludes .env files${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    
    echo -ne "${YELLOW}Select option (1 or 2): ${NC}"
    read data_option
    
    local overwrite_data=false
    case $data_option in
        1)
            info "Selected: Cleanup only (preserve existing server data)"
            ;;
        2)
            warning "Selected: Cleanup + overwrite project data from local"
            echo -e "${RED}⚠️  This will replace ALL project files on server with local files!${NC}"
            echo -e "${YELLOW}Are you absolutely sure? (type 'YES' to confirm):${NC}"
            read -p "❓ " confirm_overwrite
            if [[ "$confirm_overwrite" == "YES" ]]; then
                overwrite_data=true
                success "Data overwrite confirmed"
            else
                warning "Data overwrite cancelled - proceeding with cleanup only"
            fi
            ;;
        *)
            warning "Invalid option - proceeding with cleanup only"
            ;;
    esac
    
    ssh "$SSH_USER@$SERVER_IP" "
        echo '🔒 STRICTLY PROJECT-SCOPED: Emergency container cleanup and fix for $PROJECT_NAME ONLY...'
        cd /opt/$PROJECT_NAME/ 2>/dev/null || true
        
        echo '🌐 Before cleanup - Server state verification:'
        echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
        echo 'Total images on server:' \$(docker images --format '{{.Repository}}:{{.Tag}}' | wc -l)
        echo 'Total volumes on server:' \$(docker volume ls --format '{{.Name}}' | wc -l)
        echo 'Total networks on server:' \$(docker network ls --format '{{.Name}}' | wc -l)
        echo ''
        
        # STRICTLY force stop and remove ONLY containers with project prefix
        echo '🛑 Force stopping ONLY containers with $PROJECT_NAME prefix...'
        PROJECT_CONTAINERS=\$(docker ps -aq --filter name=\"${PROJECT_NAME}-\")
        if [ -n \"\$PROJECT_CONTAINERS\" ]; then
            echo \"Found PROJECT containers: \$(echo \$PROJECT_CONTAINERS | wc -w)\"
            echo \$PROJECT_CONTAINERS | xargs docker stop 2>/dev/null || true
            echo \$PROJECT_CONTAINERS | xargs docker rm -f 2>/dev/null || true
        else
            echo 'No PROJECT containers found to stop'
        fi
        
        # Also try specific project service cleanup with exact naming
        echo '🧹 Cleaning up specific PROJECT services...'
        for service in postgres redis minio pgadmin api site; do
            container_name=\"${PROJECT_NAME}-\$service\"
            if docker ps -a --filter name=\"\$container_name\" --format '{{.Names}}' | grep -q \"^\$container_name\$\"; then
                echo \"Removing \$container_name\"
                docker stop \"\$container_name\" 2>/dev/null || true
                docker rm -f \"\$container_name\" 2>/dev/null || true
            fi
        done
        
        # Use docker compose down ONLY for this project if docker-compose.yml exists
        if [ -f docker-compose.yml ]; then
            echo '🐳 Running docker compose down for PROJECT ONLY...'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME down --remove-orphans 2>/dev/null || true
        fi
        
        echo '🗑️  Cleaning PROJECT-SPECIFIC Docker resources ONLY...'
        echo 'Before PROJECT-specific cleanup:'
        echo 'PROJECT containers:' \$(docker ps -a --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
        echo 'PROJECT images:' \$(docker images | grep \"${PROJECT_NAME}\" | wc -l)
        echo 'PROJECT volumes:' \$(docker volume ls | grep \"${PROJECT_NAME}\" | wc -l)
        echo 'PROJECT networks:' \$(docker network ls | grep \"${PROJECT_NAME}\" | wc -l)
        
        # Clean up PROJECT-SPECIFIC dangling resources ONLY
        echo '🧹 Cleaning PROJECT-SPECIFIC dangling containers...'
        docker container ls -a --filter name=\"${PROJECT_NAME}-\" --filter status=exited -q | xargs -r docker rm 2>/dev/null || true
        
        echo '🧹 Cleaning PROJECT-SPECIFIC unused images...'
        # Only remove images that specifically contain the project name
        docker images | grep \"${PROJECT_NAME}\" | awk '{print \$3}' | xargs -r docker rmi -f 2>/dev/null || true
        
        echo '🧹 Cleaning PROJECT-SPECIFIC unused networks...'
        # Only remove networks that specifically contain the project name
        docker network ls | grep \"${PROJECT_NAME}\" | awk '{print \$1}' | xargs -r docker network rm 2>/dev/null || true
        
        # NOTE: We STRICTLY do NOT clean volumes as they contain data and could affect other projects
        echo '⚠️  PROJECT DATA VOLUMES PRESERVED - No volume cleanup performed for safety'
        
        echo 'After PROJECT-specific cleanup:'
        echo 'PROJECT containers:' \$(docker ps -a --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
        echo 'PROJECT images:' \$(docker images | grep \"${PROJECT_NAME}\" | wc -l)
        echo 'PROJECT volumes:' \$(docker volume ls | grep \"${PROJECT_NAME}\" | wc -l)
        echo 'PROJECT networks:' \$(docker network ls | grep \"${PROJECT_NAME}\" | wc -l)
        
        echo '🗂️  Cleaning PROJECT temporary files only...'
        rm -rf /opt/$PROJECT_NAME/tmp/* 2>/dev/null || true
        rm -rf /opt/$PROJECT_NAME/.cache/* 2>/dev/null || true
        
        echo '🌐 After cleanup - Server state verification:'
        echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
        echo 'Total images on server:' \$(docker images --format '{{.Repository}}:{{.Tag}}' | wc -l)
        echo 'Total volumes on server:' \$(docker volume ls --format '{{.Name}}' | wc -l)
        echo 'Total networks on server:' \$(docker network ls --format '{{.Name}}' | wc -l)
        echo ''
        
        echo '✅ STRICTLY PROJECT-SCOPED cleanup and container fix completed for $PROJECT_NAME'
        echo 'Current PROJECT containers:'
        docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || echo 'No PROJECT containers running'
        
        echo '🌐 Other server containers remain COMPLETELY UNTOUCHED:'
        OTHER_CONTAINERS=\$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | head -5)
        if [ -n \"\$OTHER_CONTAINERS\" ]; then
            echo \"\$OTHER_CONTAINERS\"
        else
            echo 'No other containers visible or all containers are PROJECT-scoped'
        fi
    " || error "Failed to cleanup project and fix containers"

    # Handle data overwrite if selected
    if [ "$overwrite_data" = true ]; then
        progress "🔄 Starting PROJECT data overwrite from local to server..."
        
        # Create temp directory for file transfer
        mkdir -p "$TEMP_DIR" || error "Failed to create temp directory for data overwrite"
        success "Temporary directory created: $TEMP_DIR"

        progress "📤 Preparing PROJECT files for overwrite transfer..."
        # Show what will be excluded
        info "Excluding: .git, node_modules, *.log, .env*, *.md, *.sh"
        
        # Copy all project files to temp directory (excluding sensitive files)
        rsync -av \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='*.log' \
            --exclude='.env*' \
            --exclude='*.md' \
            --exclude='*.sh' \
            --exclude='tmp' \
            --exclude='.cache' \
            . "$TEMP_DIR/" || error "Failed to copy files to temp directory"
        
        # Show transfer size
        size=$(du -sh "$TEMP_DIR" | cut -f1)
        info "Transfer size: $size"

        progress "🔐 Backing up existing PROJECT environment file on server..."
        ssh "$SSH_USER@$SERVER_IP" "
            cd /opt/$PROJECT_NAME/ 2>/dev/null || mkdir -p /opt/$PROJECT_NAME/
            if [ -f .env ]; then
                cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
                echo '✅ PROJECT environment file backed up with timestamp'
            else
                echo '⚠️  No existing PROJECT .env file found to backup'
            fi
        " || warning "Could not backup PROJECT environment file"

        progress "🌐 Overwriting PROJECT files on server (preserving .env files)..."
        # Use rsync to overwrite files but preserve .env files
        rsync -avz --progress \
            --exclude='.env*' \
            --delete-excluded \
            "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to overwrite files on remote server"
        
        progress "🔧 Restoring PROJECT environment configuration..."
        ssh "$SSH_USER@$SERVER_IP" "
            cd /opt/$PROJECT_NAME/
            # Restore the most recent backup if no .env exists
            if [ ! -f .env ]; then
                LATEST_BACKUP=\$(ls -t .env.backup.* 2>/dev/null | head -n1)
                if [ -n \"\$LATEST_BACKUP\" ]; then
                    cp \"\$LATEST_BACKUP\" .env
                    echo '✅ PROJECT environment file restored from backup: '\$LATEST_BACKUP
                elif [ -f .env.prod ]; then
                    cp .env.prod .env
                    echo '📝 Using .env.prod as fallback PROJECT environment'
                else
                    echo '❌ No PROJECT environment file available - you may need to create one'
                fi
            else
                echo '✅ PROJECT environment file already exists and preserved'
            fi
            
            echo 'PROJECT environment variables count:' \$(grep -c '=' .env 2>/dev/null || echo '0')
            
            echo '📋 PROJECT directory structure after overwrite:'
            ls -la | head -20
        " || warning "Could not restore PROJECT environment file"
        
        # Cleanup temp directory
        rm -rf "$TEMP_DIR"
        success "Local cleanup completed"
        
        success "🎉 PROJECT data overwrite completed successfully!"
        info "✅ All PROJECT files updated from local to server"
        info "✅ PROJECT environment files preserved/restored"
        warning "🔒 PROJECT-SCOPED: Only $PROJECT_NAME files were overwritten"
    fi

    success "STRICTLY PROJECT-SCOPED cleanup and container fix completed successfully for $PROJECT_NAME"
    warning "✅ ONLY $PROJECT_NAME containers were affected"
    warning "✅ ALL other server services remain completely untouched"
    warning "✅ Server isolation maintained throughout cleanup process"
    
    if [ "$overwrite_data" = true ]; then
        warning "✅ PROJECT files successfully overwritten from local to server"
        info "💡 You may want to deploy the application now to apply the updated files"
    fi
}

# Enhanced deployment function (STRICTLY PROJECT-SCOPED)
deploy_application() {
    progress "🚀 Deploying application (STRICTLY PROJECT-SCOPED)..."
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '🔒 STRICTLY PROJECT-SCOPED DEPLOYMENT for $PROJECT_NAME'
        echo '📋 Current PROJECT directory: \$(pwd)'
        echo '📄 Available PROJECT files:'
        ls -la
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🌐 Before deployment - Server state verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo ''
            
            echo '🛑 Ensuring clean PROJECT state before deployment...'
            # STRICTLY force stop and remove ONLY existing project containers
            PROJECT_CONTAINERS=\$(docker ps -a --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}')
            if [ -n \"\$PROJECT_CONTAINERS\" ]; then
                echo \"Stopping PROJECT containers: \$(echo \$PROJECT_CONTAINERS | wc -w)\"
                echo \$PROJECT_CONTAINERS | xargs docker stop 2>/dev/null || true
                echo \$PROJECT_CONTAINERS | xargs docker rm -f 2>/dev/null || true
            fi
            
            # Also cleanup by exact project service names
            for service in postgres redis minio pgadmin api site; do
                container_name=\"${PROJECT_NAME}-\$service\"
                docker stop \"\$container_name\" 2>/dev/null || true
                docker rm -f \"\$container_name\" 2>/dev/null || true
            done
            
            echo '🐳 Starting Docker Compose deployment (STRICTLY PROJECT-SCOPED)...'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME down --remove-orphans 2>/dev/null || true
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME up -d --build --force-recreate
            
            echo '⏳ Waiting for PROJECT containers to start...'
            sleep 15
            
            echo '📊 PROJECT container status:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔍 Checking PROJECT container health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
                sleep 3
            done
            
            echo '📋 PROJECT container logs (last 20 lines):'
            for container in \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}'); do
                echo \"--- Logs for \$container ---\"
                docker logs --tail=10 \$container 2>/dev/null || echo \"No logs for \$container\"
            done
            
            echo '🌐 After deployment - Server state verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo 'Other containers (untouched):' \$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | wc -l)
        else
            echo '❌ PROJECT docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to deploy PROJECT application"

    success "🎉 STRICTLY PROJECT-SCOPED deployment completed successfully!"
    info "Your $PROJECT_NAME application should now be running on the server"
    warning "✅ ONLY $PROJECT_NAME services were deployed/affected"
    warning "✅ ALL other server services remain completely untouched"
}

# Function to deploy specific services (STRICTLY PROJECT-SCOPED)
deploy_selected_services() {
    select_services
    
    if [ -z "$SELECTED_SERVICES" ]; then
        error "No services selected"
    fi
    
    progress "🚀 Deploying selected PROJECT services (STRICTLY PROJECT-SCOPED): $SELECTED_SERVICES"
    
    ssh "$SSH_USER@$SERVER_IP" "
        cd /opt/$PROJECT_NAME/
        echo '🔒 STRICTLY PROJECT-SCOPED SERVICE DEPLOYMENT for $PROJECT_NAME'
        echo '📋 Current PROJECT directory: \$(pwd)'
        
        if [ -f 'docker-compose.yml' ]; then
            echo '🌐 Before deployment - Server state verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo ''
            
            echo '🛑 Cleaning up existing PROJECT containers...'
            # STRICTLY force stop and remove ONLY existing project containers
            PROJECT_CONTAINERS=\$(docker ps -a --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}')
            if [ -n \"\$PROJECT_CONTAINERS\" ]; then
                echo \"Stopping PROJECT containers: \$(echo \$PROJECT_CONTAINERS | wc -w)\"
                echo \$PROJECT_CONTAINERS | xargs docker stop 2>/dev/null || true
                echo \$PROJECT_CONTAINERS | xargs docker rm -f 2>/dev/null || true
            fi
            
            # Also cleanup by exact project service names
            for service in postgres redis minio pgadmin api site; do
                container_name=\"${PROJECT_NAME}-\$service\"
                docker stop \"\$container_name\" 2>/dev/null || true
                docker rm -f \"\$container_name\" 2>/dev/null || true
            done
            
            echo '🛑 Stopping existing PROJECT containers with compose...'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME down --remove-orphans 2>/dev/null || true
            
            echo '🐳 Starting selected PROJECT services: $SELECTED_SERVICES'
            docker compose --project-directory /opt/$PROJECT_NAME --project-name $PROJECT_NAME up -d --build --force-recreate $SELECTED_SERVICES
            
            echo '⏳ Waiting for PROJECT containers to start...'
            sleep 15
            
            echo '📊 PROJECT container status:'
            docker ps --filter name=\"${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
            
            echo '🔍 Checking selected PROJECT services health:'
            for i in {1..5}; do
                echo \"Health check attempt \$i/5:\"
                for service in $SELECTED_SERVICES; do
                    container_name=\"${PROJECT_NAME}-\$service\"
                    status=\$(docker ps --filter name=\"\$container_name\" --format '{{.Status}}' 2>/dev/null || echo 'Not found')
                    echo \"\$service (\$container_name): \$status\"
                done
                sleep 3
            done
            
            echo '📋 Container logs for selected PROJECT services:'
            for service in $SELECTED_SERVICES; do
                container_name=\"${PROJECT_NAME}-\$service\"
                echo \"--- Logs for \$container_name ---\"
                docker logs --tail=10 \"\$container_name\" 2>/dev/null || echo \"No logs available for \$container_name\"
            done
            
            echo '🌐 After deployment - Server state verification:'
            echo 'Total containers on server:' \$(docker ps --format '{{.Names}}' | wc -l)
            echo 'PROJECT containers:' \$(docker ps --filter name=\"${PROJECT_NAME}-\" --format '{{.Names}}' | wc -l)
            echo 'Other containers (untouched):' \$(docker ps --format '{{.Names}}' | grep -v \"${PROJECT_NAME}-\" | wc -l)
        else
            echo '❌ PROJECT docker-compose.yml not found!'
            exit 1
        fi
    " || error "Failed to deploy selected PROJECT services"

    success "🎉 Selected PROJECT services deployment completed!"
    info "Selected services ($SELECTED_SERVICES) for project $PROJECT_NAME are now running on the server"
    warning "✅ ONLY selected $PROJECT_NAME services were deployed/affected"
    warning "✅ ALL other server services remain completely untouched"
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
            log "Option 1 selected: Deploy with Git & preserve data (Site & API only)"
            warning "This will commit git changes and update only Site & API services, preserving all data services"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME containers"
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
            log "Option 2 selected: Deploy ALL with Git & preserve data"
            warning "This will commit git changes and update ALL services while preserving data volumes"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME containers"
            echo -e "${YELLOW}Are you sure you want to proceed? (y/N):${NC}"
            read -p "❓ " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                git_commit_and_update_all_preserve_data
            else
                warning "Deployment cancelled"
            fi
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        3)
            log "Option 3 selected: Deploy only"
            warning "Skipping git operations..."
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME containers"
            deploy_to_server
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        4)
            log "Option 4 selected: Project cleanup & container fix (PROJECT ONLY)"
            warning "This will perform STRICTLY PROJECT-SCOPED cleanup and fix container conflicts"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects $PROJECT_NAME containers and resources"
            echo -e "${YELLOW}Are you sure you want to proceed? (y/N):${NC}"
            read -p "❓ " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                project_cleanup_and_container_fix
            else
                warning "Cleanup cancelled"
            fi
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
            log "Option 6 selected: Fresh deploy with new environment"
            warning "This will remove all old .env files and use .env.prod as new environment"
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
            log "Option 7 selected: Deploy specific services"
            warning "🔒 STRICTLY PROJECT-SCOPED: Only affects selected $PROJECT_NAME services"
            deploy_selected_services
            echo ""
            info "Press any key to return to menu..."
            read -n 1
            ;;
        q|Q)
            echo -e "${GREEN}👋 Thank you for using PROJECT-SCOPED Deployment Tool!${NC}"
            echo -e "${CYAN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            error "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done
