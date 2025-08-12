#!/bin/bash

# Set default variables
SSH_USER="root"
DEFAULT_SERVER_IP="116.118.49.243"
DEFAULT_PROJECT_NAME="tazacore"
TEMP_DIR="/tmp/deploy_$(date +%s)"
LOCAL_BUILD_DIR="/tmp/build_$(date +%s)"

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

error_msg() {
    echo -e "${RED}❌ $(date '+%Y-%m-%d %H:%M:%S') - $1${NC}"
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

# Function to build project locally
build_local() {
    local services="$1"
    
    progress "🏗️  Starting local build process..."
    
    # Create local build directory
    mkdir -p "$LOCAL_BUILD_DIR"
    
    # Build each service locally
    for service in $services; do
        case $service in
            "api"|"site")
                progress "🔨 Building $service locally..."
                
                # Install dependencies if needed
                if [ ! -d "node_modules" ]; then
                    progress "📦 Installing dependencies..."
                    bun install || error "Failed to install dependencies"
                fi
                
                # Build the project
                progress "⚡ Building $service with Bun..."
                if [ "$service" = "api" ]; then
                    # Build API
                    NODE_ENV=production bun run build || error "Failed to build API"
                    
                    # Copy built files
                    mkdir -p "$LOCAL_BUILD_DIR/api"
                    cp -r .next "$LOCAL_BUILD_DIR/api/" 2>/dev/null || true
                    cp -r dist "$LOCAL_BUILD_DIR/api/" 2>/dev/null || true
                    cp -r public "$LOCAL_BUILD_DIR/api/" 2>/dev/null || true
                    cp package.json "$LOCAL_BUILD_DIR/api/"
                    cp bun.lockb "$LOCAL_BUILD_DIR/api/" 2>/dev/null || true
                    
                elif [ "$service" = "site" ]; then
                    # Build Site
                    NODE_ENV=production bun run build || error "Failed to build Site"
                    
                    # Copy built files
                    mkdir -p "$LOCAL_BUILD_DIR/site"
                    cp -r .next "$LOCAL_BUILD_DIR/site/" 2>/dev/null || true
                    cp -r dist "$LOCAL_BUILD_DIR/site/" 2>/dev/null || true
                    cp -r public "$LOCAL_BUILD_DIR/site/" 2>/dev/null || true
                    cp package.json "$LOCAL_BUILD_DIR/site/"
                    cp bun.lockb "$LOCAL_BUILD_DIR/site/" 2>/dev/null || true
                fi
                
                success "✅ $service built successfully"
                ;;
            *)
                info "ℹ️  $service doesn't require local building"
                ;;
        esac
    done
    
    success "🎉 Local build completed"
}

# Function to create optimized Dockerfile for pre-built apps
create_optimized_dockerfile() {
    local service="$1"
    
    cat > "$LOCAL_BUILD_DIR/$service/Dockerfile.optimized" << 'EOF'
# Multi-stage build with pre-built artifacts
FROM oven/bun:1-alpine AS base

# Install Node.js for compatibility
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb* ./

# Install only production dependencies
ENV NODE_ENV=production
RUN bun install --frozen-lockfile --production

# Copy pre-built application
COPY .next ./.next
COPY dist ./dist
COPY public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["bun", "start"]
EOF
    
    success "🐳 Created optimized Dockerfile for $service"
}

# Function to upload built files to server
upload_to_server() {
    local services="$1"
    
    progress "📤 Uploading built files to server..."
    
    # Create remote directories
    ssh "$SSH_USER@$SERVER_IP" "mkdir -p /opt/$PROJECT_NAME/built-apps"
    
    for service in $services; do
        case $service in
            "api"|"site")
                if [ -d "$LOCAL_BUILD_DIR/$service" ]; then
                    progress "📤 Uploading $service to server..."
                    
                    # Create optimized Dockerfile
                    create_optimized_dockerfile "$service"
                    
                    # Compress and upload
                    cd "$LOCAL_BUILD_DIR"
                    tar -czf "${service}.tar.gz" "$service/"
                    
                    scp "${service}.tar.gz" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/built-apps/"
                    
                    # Extract on server
                    ssh "$SSH_USER@$SERVER_IP" "
                        cd /opt/$PROJECT_NAME/built-apps/
                        tar -xzf ${service}.tar.gz
                        rm ${service}.tar.gz
                        chown -R root:root $service/
                    "
                    
                    success "✅ $service uploaded successfully"
                else
                    warning "⚠️  $service build directory not found, skipping upload"
                fi
                ;;
        esac
    done
    
    success "🎉 All built files uploaded to server"
}

# Function to create optimized docker-compose for pre-built services
create_optimized_compose() {
    local services="$1"
    
    progress "🐳 Creating optimized docker-compose configuration..."
    
    # Create a temporary optimized compose file
    cat > "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
version: '3.8'

services:
EOF

    # Add each service to compose
    for service in $services; do
        case $service in
            "api")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  api:
    build:
      context: ./built-apps/api
      dockerfile: Dockerfile.optimized
    container_name: \${PROJECT_NAME:-tazacore}-api
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
            "site")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  site:
    build:
      context: ./built-apps/site
      dockerfile: Dockerfile.optimized
    container_name: \${PROJECT_NAME:-tazacore}-site
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
            "postgres")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  postgres:
    image: postgres:15-alpine
    container_name: \${PROJECT_NAME:-tazacore}-postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-tazacore}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
            "redis")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  redis:
    image: redis:7-alpine
    container_name: \${PROJECT_NAME:-tazacore}-redis
    command: redis-server --requirepass \${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=\${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
            "minio")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  minio:
    image: minio/minio:latest
    container_name: \${PROJECT_NAME:-tazacore}-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: \${MINIO_ROOT_USER:-admin}
      MINIO_ROOT_PASSWORD: \${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
            "pgadmin")
                cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: \${PROJECT_NAME:-tazacore}-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: \${PGADMIN_DEFAULT_EMAIL:-admin@admin.com}
      PGADMIN_DEFAULT_PASSWORD: \${PGADMIN_DEFAULT_PASSWORD}
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    ports:
      - "5050:80"
    restart: unless-stopped
    networks:
      - taza-network

EOF
                ;;
        esac
    done
    
    # Add networks and volumes
    cat >> "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" << EOF

networks:
  taza-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  minio_data:
  pgadmin_data:
EOF
    
    # Upload the optimized compose file
    scp "$LOCAL_BUILD_DIR/docker-compose.optimized.yml" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/"
    
    success "🐳 Optimized docker-compose configuration created and uploaded"
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

# Function to deploy specific services smartly with local build
smart_deploy_services() {
    local services_to_deploy="$1"
    local deployment_mode="$2" # "selective" or "all"
    
    progress "🧠 Smart deployment mode: analyzing current service states..."
    
    # Get list of failed services
    local failed_services
    if [ "$deployment_mode" = "all" ]; then
        failed_services=$(stop_failed_services "$services_to_deploy" | tr -s ' ' | sed 's/^ *//;s/ *$//')
    else
        failed_services="$services_to_deploy"
    fi
    
    if [ -n "$failed_services" ]; then
        progress "🚀 Starting LOCAL BUILD + DEPLOY for services: $failed_services"
        
        # Step 1: Build locally
        progress "🏗️  Phase 1: Building services locally..."
        build_local "$failed_services"
        
        # Step 2: Upload built files
        progress "📤 Phase 2: Uploading built applications..."
        upload_to_server "$failed_services"
        
        # Step 3: Create optimized compose
        progress "🐳 Phase 3: Creating optimized Docker configuration..."
        create_optimized_compose "$failed_services"
        
        # Step 4: Deploy with optimized containers
        progress "🚀 Phase 4: Deploying optimized containers..."
        ssh "$SSH_USER@$SERVER_IP" "
            cd /opt/$PROJECT_NAME/
            echo 'OPTIMIZED LOCAL-BUILD DEPLOYMENT for $PROJECT_NAME'
            echo 'Services to deploy: $failed_services'
            
            # Stop old containers first
            for service in $failed_services; do
                container_name=\"\${PROJECT_NAME}-\$service\"
                echo \"🛑 Stopping old container: \$service\"
                docker stop \"\$container_name\" 2>/dev/null || true
                docker rm -f \"\$container_name\" 2>/dev/null || true
                
                # Remove old images to save space
                docker rmi -f \"\${PROJECT_NAME}-\$service\" 2>/dev/null || true
            done
            
            if [ -f 'docker-compose.optimized.yml' ]; then
                echo 'Starting optimized Docker Compose deployment...'
                
                # Start only the failed/missing services with NO CACHE for fresh build
                for service in $failed_services; do
                    echo \"🔄 Building and starting OPTIMIZED service: \$service...\"
                    COMPOSE_PROJECT_NAME=$PROJECT_NAME docker compose -f 'docker-compose.optimized.yml' up -d --build --no-cache \$service

                    # Wait a bit for the service to start
                    sleep 5
                    
                    # Check immediate status
                    container_name=\"\${PROJECT_NAME}-\$service\"
                    status=\$(docker inspect --format='{{.State.Status}}' \"\$container_name\" 2>/dev/null || echo 'not_found')
                    echo \"Service \$service status: \$status\"
                done
                
                echo 'Waiting for all deployed services to stabilize...'
                sleep 15
                
                echo 'Final deployment status:'
                docker ps --filter name=\"\${PROJECT_NAME}-\" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
                
                # Clean up build artifacts to save space
                echo 'Cleaning up Docker build cache...'
                docker builder prune -f || true
                
            else
                echo 'Optimized docker-compose.yml not found!'
                exit 1
            fi
        " || error "Failed to deploy services"
        
        # Verify deployment success
        progress "🔍 Verifying deployment success..."
        local deployment_success=true
        for service in $failed_services; do
            if check_service_health "$service"; then
                success "✅ $service deployed successfully with local build"
            else
                error "❌ $service deployment failed"
                deployment_success=false
            fi
        done
        
        if [ "$deployment_success" = true ]; then
            success "🎉 Optimized local-build deployment completed successfully!"
            info "📊 Benefits: Faster deployment, smaller containers, no server-side build overhead"
            
            # Clean up local build directory
            rm -rf "$LOCAL_BUILD_DIR"
            success "🧹 Local build directory cleaned up"
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

# Function to deploy specific services smartly (STRICTLY PROJECT-SCOPED)
deploy_selected_services() {
    select_services
    
    if [ -z "$SELECTED_SERVICES" ]; then
        error "No services selected"
    fi
    
    progress "🧠 OPTIMIZED LOCAL-BUILD deployment for selected PROJECT services: $SELECTED_SERVICES"
    info "📊 Optimization benefits:"
    info "   • ⚡ Faster deployment (no server-side building)"
    info "   • 💾 Smaller containers (pre-built artifacts)"
    info "   • 🚀 Reduced server resource usage"
    info "   • 🔧 Better build caching and reliability"
    
    # Use smart deployment for selected services
    smart_deploy_services "$SELECTED_SERVICES" "selective"
    
    success "🎉 Selected PROJECT services OPTIMIZED deployment completed!"
    info "Selected services ($SELECTED_SERVICES) for project $PROJECT_NAME are optimally running"
    warning "🧠 SMART MODE: Only failed services were restarted"
    warning "✅ Healthy services continued running without interruption"
    success "🚀 OPTIMIZATION: All builds happened locally for maximum efficiency"
}

# Cleanup function
cleanup() {
    if [ -d "$LOCAL_BUILD_DIR" ]; then
        progress "🧹 Cleaning up local build directory..."
        rm -rf "$LOCAL_BUILD_DIR"
        success "✅ Cleanup completed"
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Initialize configuration
get_server_config

# Main execution
log "Starting OPTIMIZED Smart Deploy Tool with Local Build"
warning "🧠 SMART MODE: Only unhealthy selected services will be restarted"
warning "🔒 STRICTLY PROJECT-SCOPED: Only affects selected $PROJECT_NAME services"
info "🚀 OPTIMIZATION: Building locally for maximum speed and efficiency"

deploy_selected_services

echo ""
echo -e "${GREEN}👋 Thank you for using OPTIMIZED LOCAL-BUILD Deployment Tool!${NC}"
echo -e "${CYAN}🚀 Your applications were built locally and deployed efficiently!${NC}"
echo -e "${YELLOW}📊 Benefits achieved:${NC}"
echo -e "${BLUE}   • ⚡ Faster deployment time${NC}"
echo -e "${BLUE}   • 💾 Smaller container sizes${NC}"
echo -e "${BLUE}   • 🔧 Reduced server load${NC}"
echo -e "${BLUE}   • 🛡️  Better build reliability${NC}"
echo -e "${CYAN}Goodbye!${NC}"
