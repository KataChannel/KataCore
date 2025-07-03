#!/bin/bash

# 🚀 KataCore Remote Deployment Helper
# Quick deployment script for remote servers

set -euo pipefail

# Configuration - Dynamic parameters
SERVER_IP=""
DOMAIN=""
SSH_USER="root"
SSH_KEY_PATH=""
DEPLOY_TYPE="full"
FORCE_REGEN=false
CLEANUP_MODE=false
PROJECT_NAME="katacore"
DOCKER_COMPOSE_FILE="docker-compose.startkitv1.yml"

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

show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🚀 KataCore Remote Deploy                            ║
║                                                                              ║
║    Deploy to any server with dynamic IP and domain configuration           ║
║    Supports both simple (IP only) and full (domain + SSL) deployments     ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    if [[ -n "$SERVER_IP" && -n "$DOMAIN" ]]; then
        echo -e "${CYAN}📋 Deployment Details:${NC}"
        echo -e "   📍 Server IP: $SERVER_IP"
        echo -e "   🌍 Domain: $DOMAIN"
        echo -e "   👤 SSH User: $SSH_USER"
        echo -e "   🔐 SSH Key: ${SSH_KEY_PATH:-'default'}"
        echo -e "   🚀 Deploy Type: $DEPLOY_TYPE"
        echo -e "   🐳 Docker Compose: $DOCKER_COMPOSE_FILE"
        echo ""
    fi
}

# Show help
show_help() {
    cat << 'EOF'
🚀 KataCore Remote Deployment Script

USAGE:
    ./deploy-remote.sh [OPTIONS] IP DOMAIN

ARGUMENTS:
    IP                  Server IP address (e.g., 116.118.85.41)
    DOMAIN             Domain name (e.g., innerbright.vn)

OPTIONS:
    --user USER        SSH user (default: root)
    --key PATH         SSH private key path (default: ~/.ssh/id_rsa)
    --simple           Simple deployment (no SSL/domain config)
    --force-regen      Force regenerate environment files
    --compose FILE     Docker compose file (default: docker-compose.startkitv1.yml)
                       Available files:
                       - docker-compose.startkitv1.yml (full stack)
    --project NAME     Project name (default: katacore)
    --cleanup          Cleanup deployment on remote server
    --help             Show this help

EXAMPLES:
    # Full deployment with domain and SSL
    ./deploy-remote.sh 116.118.85.41 innerbright.vn

    # Simple deployment (IP only, no SSL)
    ./deploy-remote.sh --simple 116.118.85.41 innerbright.vn

    # Custom SSH user and key
    ./deploy-remote.sh --user ubuntu --key ~/.ssh/my-key.pem 116.118.85.41 innerbright.vn

    # Custom docker-compose file
    ./deploy-remote.sh --compose docker-compose.startkitv1.yml 116.118.85.41 innerbright.vn

    # With force regeneration
    ./deploy-remote.sh --force-regen 116.118.85.41 innerbright.vn

    # Cleanup remote deployment
    ./deploy-remote.sh --cleanup 116.118.85.41

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
            --key)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            --simple)
                DEPLOY_TYPE="simple"
                shift
                ;;
            --force-regen)
                FORCE_REGEN=true
                shift
                ;;
            --cleanup)
                CLEANUP_MODE=true
                shift
                ;;
            --compose)
                DOCKER_COMPOSE_FILE="$2"
                shift 2
                ;;
            --project)
                PROJECT_NAME="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                if [[ -z "$SERVER_IP" ]]; then
                    SERVER_IP="$1"
                elif [[ -z "$DOMAIN" ]]; then
                    DOMAIN="$1"
                else
                    error "Too many arguments"
                fi
                shift
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required. Use --help for usage."
    fi
    
    if [[ "$DEPLOY_TYPE" == "full" && -z "$DOMAIN" ]]; then
        error "Domain is required for full deployment. Use --simple for IP-only deployment."
    fi
    
    # Set default SSH key if not provided
    if [[ -z "$SSH_KEY_PATH" ]]; then
        SSH_KEY_PATH="$HOME/.ssh/id_rsa"
    fi
    
    # For simple deployment, use IP as domain
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        DOMAIN="$SERVER_IP"
    fi
}

# Validate inputs
validate_inputs() {
    # Validate IP
    if [[ ! $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        error "Invalid IP address: $SERVER_IP"
    fi
    
    # Validate domain (only for full deployment)
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        if [[ ! $DOMAIN =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$ ]]; then
            error "Invalid domain: $DOMAIN"
        fi
    fi
    
    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
}

# Select Docker Compose file
select_docker_compose_file() {
    log "🐳 Selecting Docker Compose file..."
    
    # Available compose files
    local compose_files=(
        "docker-compose.startkitv1.yml"
    )
    
    # If compose file not specified, use default
    if [[ -z "$DOCKER_COMPOSE_FILE" ]]; then
        DOCKER_COMPOSE_FILE="${compose_files[0]}"
    fi
    
    # Validate selected file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        info "Available files:"
        for file in "${compose_files[@]}"; do
            if [[ -f "$file" ]]; then
                info "  ✅ $file"
            else
                info "  ❌ $file (not found)"
            fi
        done
        exit 1
    fi
    
    success "Using Docker Compose file: $DOCKER_COMPOSE_FILE"
}

# Enhanced Docker Compose validation
validate_docker_compose() {
    log "🔍 Validating Docker Compose configuration..."
    
    # Check Docker Compose version
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose not found. Please install Docker Compose."
    fi
    
    # Validate compose file syntax
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config --quiet 2>/dev/null; then
        error "Invalid Docker Compose file: $DOCKER_COMPOSE_FILE"
    fi
    
    # Check required services
    local required_services=("api" "site" "postgres" "redis" "minio")
    for service in "${required_services[@]}"; do
        if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config --services | grep -q "^$service$"; then
            warning "Service '$service' not found in Docker Compose file"
        fi
    done
    
    # Check for build contexts
    local build_contexts=$(docker-compose -f "$DOCKER_COMPOSE_FILE" config | grep -E "context:" | awk '{print $2}')
    for context in $build_contexts; do
        if [[ ! -d "$context" ]]; then
            error "Build context directory not found: $context"
        fi
    done
    
    success "Docker Compose configuration is valid"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if SSH key exists
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        warning "SSH key not found at $SSH_KEY_PATH"
        
        # Try to auto-generate SSH key
        if [[ -f "./ssh-keygen-setup.sh" ]]; then
            warning "Attempting to auto-generate SSH key..."
            
            # Extract IP from SERVER_IP for key generation
            local key_name="katacore-deploy-${SERVER_IP//\./-}"
            
            info "Generating SSH key for $SERVER_IP..."
            ./ssh-keygen-setup.sh --name "$key_name" --server "$SERVER_IP" --user "$SSH_USER" --force
            
            # Update SSH_KEY_PATH to the newly generated key
            SSH_KEY_PATH="$HOME/.ssh/$key_name"
            
            if [[ -f "$SSH_KEY_PATH" ]]; then
                success "SSH key auto-generated: $SSH_KEY_PATH"
            else
                error "Failed to auto-generate SSH key"
            fi
        else
            echo "Available options:"
            echo "1. Generate SSH key automatically: ./auto-ssh-deploy.sh --auto-deploy $SERVER_IP"
            echo "2. Generate SSH key manually: ./ssh-keygen-setup.sh --server $SERVER_IP --user $SSH_USER"
            echo "3. Use existing key: ./deploy-remote.sh --key /path/to/your/key $SERVER_IP DOMAIN"
            echo "4. Create SSH key manually: ssh-keygen -t ed25519 -f ~/.ssh/katacore-deploy -C 'KataCore-deploy'"
            exit 1
        fi
    else
        success "SSH key found at $SSH_KEY_PATH"
    fi
    
    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    # Validate Docker Compose file syntax
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config --quiet; then
        error "Invalid Docker Compose file: $DOCKER_COMPOSE_FILE"
    fi
    
    success "Docker Compose file found and validated: $DOCKER_COMPOSE_FILE"
    
    # Check if required build contexts exist
    if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
        # Check if api directory exists
        if [[ ! -d "api" ]]; then
            error "API directory not found. Make sure you're in the KataCore root directory."
        fi
        
        # Check if site directory exists
        if [[ ! -d "site" ]]; then
            error "Site directory not found. Make sure you're in the KataCore root directory."
        fi
        
        # Check if Dockerfiles exist
        if [[ ! -f "api/Dockerfile" ]]; then
            error "API Dockerfile not found at api/Dockerfile"
        fi
        
        if [[ ! -f "site/Dockerfile" ]]; then
            error "Site Dockerfile not found at site/Dockerfile"
        fi
        
        success "Build contexts validated"
    fi
}

# Check SSH connection
check_ssh_connection() {
    log "🔗 Testing SSH connection to $SSH_USER@$SERVER_IP..."
    
    local ssh_cmd="ssh -i $SSH_KEY_PATH -o ConnectTimeout=10 -o BatchMode=yes"
    
    if $ssh_cmd "$SSH_USER@$SERVER_IP" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        success "SSH connection successful"
        return 0
    else
        error "Cannot connect to $SSH_USER@$SERVER_IP. Please check your SSH key and server access."
    fi
}

# Prepare remote server
prepare_remote_server() {
    log "🛠️  Preparing remote server..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << 'EOF'
        set -e
        
        echo "🔄 Updating system..."
        apt update && apt upgrade -y
        
        echo "🐳 Installing Docker..."
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl enable docker
            systemctl start docker
            rm get-docker.sh
        fi
        
        echo "🔧 Installing Docker Compose..."
        if ! command -v docker-compose &> /dev/null; then
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        echo "📦 Installing required packages..."
        apt install -y curl wget git nginx certbot python3-certbot-nginx openssl ufw
        
        echo "🔥 Configuring firewall..."
        ufw --force enable
        ufw allow OpenSSH
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp
        ufw allow 3001/tcp
        ufw allow 9000/tcp
        ufw allow 9001/tcp
        ufw allow 5050/tcp
        ufw allow 5432/tcp
        ufw allow 6379/tcp
        
        echo "✅ Remote server preparation completed"
EOF
    
    success "Remote server prepared successfully"
}

# Transfer project files to remote server
transfer_project() {
    log "📤 Transferring project files to remote server..."
    
    # Create deployment directory on remote server
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" "mkdir -p /opt/$PROJECT_NAME"
    
    # Create a temporary directory for deployment files
    local temp_dir=$(mktemp -d)
    
    # Copy all project files to temp directory (excluding .git, node_modules, etc.)
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' . "$temp_dir/"
    
    # Remove any existing .env to force regeneration if requested
    if [[ "$FORCE_REGEN" == "true" ]]; then
        rm -f "$temp_dir/.env"
    fi
    
    # Transfer files to remote server using rsync for better performance
    rsync -avz -e "ssh -i $SSH_KEY_PATH" "$temp_dir/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Project files transferred successfully"
}

# Generate environment configuration
generate_environment() {
    log "🔧 Generating environment configuration..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        cd /opt/$PROJECT_NAME
        
        # Create .env file if it doesn't exist
        if [[ ! -f .env ]] || [[ "$FORCE_REGEN" == "true" ]]; then
            echo "🔐 Generating environment variables..."
            
            # Generate random passwords and keys
            DB_PASSWORD=\$(openssl rand -base64 32)
            REDIS_PASSWORD=\$(openssl rand -base64 32)
            JWT_SECRET=\$(openssl rand -base64 64)
            ENCRYPTION_KEY=\$(openssl rand -base64 32)
            MINIO_ROOT_PASSWORD=\$(openssl rand -base64 32)
            PGADMIN_PASSWORD=\$(openssl rand -base64 16)
            
            # Create .env file
            cat > .env << 'ENVEOF'
# Generated on \$(date)
# KataCore Production Environment Configuration

# ===== Application Configuration =====
NODE_ENV=production
API_VERSION=latest
SITE_VERSION=latest
RESTART_POLICY=unless-stopped

# ===== Port Configuration =====
PORT=3000
SITE_PORT=3000
API_PORT=3001

# ===== Database Configuration =====
POSTGRES_DB=$PROJECT_NAME
POSTGRES_USER=$PROJECT_NAME
POSTGRES_PASSWORD=\$DB_PASSWORD
DATABASE_URL=postgresql://\$PROJECT_NAME:\$DB_PASSWORD@postgres:5432/$PROJECT_NAME

# ===== Redis Configuration =====
REDIS_PASSWORD=\$REDIS_PASSWORD
REDIS_URL=redis://:\$REDIS_PASSWORD@redis:6379

# ===== Authentication & Security =====
JWT_SECRET=\$JWT_SECRET
ENCRYPTION_KEY=\$ENCRYPTION_KEY
LOG_LEVEL=info

# ===== MinIO Configuration =====
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=\$MINIO_ROOT_PASSWORD
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=\$MINIO_ROOT_PASSWORD
MINIO_USE_SSL=false

# ===== PgAdmin Configuration =====
PGADMIN_PORT=5050
PGADMIN_DEFAULT_PASSWORD=\$PGADMIN_PASSWORD

# ===== Internal Services =====
INTERNAL_API_URL=http://api:3001

# ===== Server Configuration =====
SERVER_IP=$SERVER_IP
DOMAIN=$DOMAIN
DEPLOY_TYPE=$DEPLOY_TYPE

# ===== SSL Configuration (for full deployment) =====
SSL_EMAIL=admin@$DOMAIN
ENVEOF

            # Append deployment-specific configuration
            if [[ "$DEPLOY_TYPE" == "simple" ]]; then
                cat >> .env << 'ENVEOF'

# ===== CORS Configuration =====
CORS_ORIGIN=http://$SERVER_IP:3000
NEXT_PUBLIC_API_URL=http://$SERVER_IP:3001
NEXT_PUBLIC_APP_URL=http://$SERVER_IP:3000
NEXT_PUBLIC_MINIO_ENDPOINT=http://$SERVER_IP:9000
PGADMIN_DEFAULT_EMAIL=admin@$SERVER_IP
ENVEOF
            else
                cat >> .env << 'ENVEOF'

# ===== CORS Configuration =====
CORS_ORIGIN=https://$DOMAIN,http://$SERVER_IP:3000
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_MINIO_ENDPOINT=https://$DOMAIN:9000
PGADMIN_DEFAULT_EMAIL=admin@$DOMAIN
ENVEOF
            fi
            
            echo "✅ Environment file generated"
        else
            echo "📋 Using existing .env file"
        fi
EOF
    
    success "Environment configuration completed"
}

# Build and run Docker Compose
run_docker_compose() {
    log "🚀 Building and running Docker Compose..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        cd /opt/$PROJECT_NAME
        
        echo "🧹 Cleaning up existing containers..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans 2>/dev/null || true
        
        echo "🗑️  Cleaning up Docker system..."
        docker system prune -f
        
        echo "🔍 Checking Docker Compose file..."
        if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
            echo "❌ Docker Compose file not found: $DOCKER_COMPOSE_FILE"
            exit 1
        fi
        
        echo "📋 Validating Docker Compose configuration..."
        docker-compose -f $DOCKER_COMPOSE_FILE config --quiet
        
        echo "🔨 Building Docker images..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME build --no-cache --parallel
        
        echo "🚀 Starting services..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME up -d
        
        echo "⏳ Waiting for services to start..."
        sleep 30
        
        echo "🔍 Checking service health..."
        # Check if services are running
        for i in {1..10}; do
            if docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps | grep -q "Up"; then
                echo "✅ Services are starting up..."
                break
            fi
            echo "⏳ Waiting for services... (\$i/10)"
            sleep 3
        done
        
        echo "📊 Checking service status..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps
        
        echo "📋 Checking service logs for errors..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME logs --tail=50
        
        echo "✅ Docker Compose deployment completed!"
EOF
    
    success "Docker Compose services are running"
}

# Configure SSL (for full deployment)
configure_ssl() {
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        log "🔒 Configuring SSL certificates..."
        
        ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
            set -e
            
            echo "🌐 Configuring Nginx..."
            cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Client max body size
    client_max_body_size 50M;
    
    # Main site
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # MinIO Console
    location /minio {
        proxy_pass http://localhost:9001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # pgAdmin
    location /pgadmin {
        proxy_pass http://localhost:5050;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_http_version 1.1;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF
            
            ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
            rm -f /etc/nginx/sites-enabled/default
            nginx -t && systemctl reload nginx
            
            echo "🔒 Obtaining SSL certificate..."
            certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
            
            echo "✅ SSL configuration completed"
EOF
        
        success "SSL certificates configured"
    fi
}

# Check service health
check_service_health() {
    log "🔍 Checking service health..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        cd /opt/$PROJECT_NAME
        
        echo "🔍 Checking Docker container status..."
        docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps
        
        echo ""
        echo "🔍 Checking service health..."
        
        # Check main app
        if curl -sf http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Main App (port 3000): Healthy"
        else
            echo "❌ Main App (port 3000): Not responding"
        fi
        
        # Check API
        if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
            echo "✅ API (port 3001): Healthy"
        else
            echo "❌ API (port 3001): Not responding"
        fi
        
        # Check MinIO
        if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
            echo "✅ MinIO (port 9000): Healthy"
        else
            echo "❌ MinIO (port 9000): Not responding"
        fi
        
        # Check pgAdmin
        if curl -sf http://localhost:5050/misc/ping > /dev/null 2>&1; then
            echo "✅ pgAdmin (port 5050): Healthy"
        else
            echo "❌ pgAdmin (port 5050): Not responding"
        fi
        
        # Check database connection
        if docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME exec -T postgres pg_isready -U $PROJECT_NAME > /dev/null 2>&1; then
            echo "✅ PostgreSQL: Connection healthy"
        else
            echo "❌ PostgreSQL: Connection failed"
        fi
        
        # Check Redis connection
        if docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME exec -T redis redis-cli ping > /dev/null 2>&1; then
            echo "✅ Redis: Connection healthy"
        else
            echo "❌ Redis: Connection failed"
        fi
        
        echo ""
        echo "📊 Docker container resource usage:"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
EOF
    
    success "Health check completed"
}

# Show deployment summary
show_deployment_summary() {
    local protocol="https"
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        protocol="http"
    fi
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                         🎉 DEPLOYMENT SUCCESSFUL!                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}🌐 Server Information:${NC}"
    echo -e "   📍 IP Address:    $SERVER_IP"
    echo -e "   🌍 Domain:        $DOMAIN"
    echo -e "   👤 User:          $SSH_USER"
    echo -e "   🔐 SSH Key:       $SSH_KEY_PATH"
    echo -e "   🐳 Docker File:   $DOCKER_COMPOSE_FILE"
    echo -e "   📦 Project:       $PROJECT_NAME"
    echo ""
    
    echo -e "${CYAN}📊 Services Status:${NC}"
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME && docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME ps"
    echo ""
    
    echo -e "${CYAN}🔗 Service URLs:${NC}"
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        echo -e "   🌐 Main App:      http://$SERVER_IP:3000"
        echo -e "   🚀 API:          http://$SERVER_IP:3001"
        echo -e "   📦 MinIO:        http://$SERVER_IP:9000"
        echo -e "   🗄️  Database:     $SERVER_IP:5432"
    else
        echo -e "   🌐 Main App:      https://$DOMAIN"
        echo -e "   🚀 API:          https://$DOMAIN/api"
        echo -e "   📦 MinIO:        https://$DOMAIN:9000"
        echo -e "   🗄️  Database:     $DOMAIN:5432"
    fi
    echo ""
    
    echo -e "${CYAN}📋 Management Commands:${NC}"
    echo -e "   🔍 Check logs:    ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME logs'"
    echo -e "   🔄 Restart:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME restart'"
    echo -e "   ⏹️  Stop:         ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME stop'"
    echo -e "   🗑️  Remove:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down'"
    echo ""
    
    echo -e "${YELLOW}🔐 Important: Check .env file on server for generated passwords${NC}"
    echo -e "   ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cat /opt/$PROJECT_NAME/.env'"
}

# Main deployment function
deploy() {
    show_banner
    validate_inputs
    
    # Select and validate Docker Compose file
    select_docker_compose_file
    validate_docker_compose
    
    check_prerequisites
    
    log "🚀 Starting remote deployment..."
    
    # Check SSH connection
    check_ssh_connection
    
    # Prepare remote server
    prepare_remote_server
    
    # Transfer project files
    transfer_project
    
    # Generate environment configuration
    generate_environment
    
    # Run Docker Compose
    run_docker_compose
    
    # Configure SSL if full deployment
    configure_ssl
    
    # Check service health
    check_service_health
    
    # Show summary
    show_deployment_summary
    
    success "🎉 Remote deployment completed successfully!"
}

# Cleanup deployment function
cleanup_deployment() {
    show_banner
    
    if [[ -z "$SERVER_IP" ]]; then
        error "Server IP is required for cleanup. Usage: ./deploy-remote.sh --cleanup SERVER_IP"
    fi
    
    log "🧹 Starting cleanup of remote deployment..."
    
    # Set default SSH key if not provided
    if [[ -z "$SSH_KEY_PATH" ]]; then
        SSH_KEY_PATH="$HOME/.ssh/id_rsa"
    fi
    
    # Check SSH connection
    check_ssh_connection
    
    # Cleanup deployment
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        
        echo "🧹 Cleaning up KataCore deployment..."
        
        # Stop and remove Docker containers
        if [[ -d "/opt/$PROJECT_NAME" ]]; then
            cd /opt/$PROJECT_NAME
            
            if [[ -f "$DOCKER_COMPOSE_FILE" ]]; then
                echo "🛑 Stopping Docker containers..."
                docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans -v || true
                
                echo "🗑️  Removing Docker images..."
                docker-compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME down --rmi all || true
            fi
            
            echo "🧹 Removing project directory..."
            cd /
            rm -rf /opt/$PROJECT_NAME
        fi
        
        # Remove Nginx configuration (if exists)
        if [[ -f "/etc/nginx/sites-available/$PROJECT_NAME" ]]; then
            echo "🌐 Removing Nginx configuration..."
            rm -f /etc/nginx/sites-available/$PROJECT_NAME
            rm -f /etc/nginx/sites-enabled/$PROJECT_NAME
            nginx -t && systemctl reload nginx || true
        fi
        
        # Clean up SSL certificates (if exists)
        if command -v certbot &> /dev/null; then
            echo "🔒 Removing SSL certificates..."
            certbot delete --cert-name $DOMAIN --non-interactive || true
        fi
        
        # Clean up Docker system
        echo "🧹 Cleaning Docker system..."
        docker system prune -af || true
        docker volume prune -f || true
        
        # Remove firewall rules (optional)
        echo "🔥 Removing specific firewall rules..."
        ufw delete allow 3000/tcp || true
        ufw delete allow 3001/tcp || true
        ufw delete allow 9000/tcp || true
        ufw delete allow 9001/tcp || true
        ufw delete allow 5050/tcp || true
        
        echo "✅ Cleanup completed successfully!"
EOF
    
    success "🎉 Remote deployment cleanup completed!"
    
    echo ""
    echo -e "${CYAN}📋 Cleanup Summary:${NC}"
    echo -e "   🛑 Docker containers stopped and removed"
    echo -e "   🗑️  Project files deleted from /opt/$PROJECT_NAME"
    echo -e "   🌐 Nginx configuration removed"
    echo -e "   🔒 SSL certificates removed"
    echo -e "   🧹 Docker system cleaned"
    echo -e "   🔥 Firewall rules cleaned"
    echo ""
}

# Test SSH connection function
test_connection() {
    show_banner
    validate_inputs
    
    log "🧪 Testing SSH connection..."
    
    if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 "$SSH_USER@$SERVER_IP" "echo 'SSH connection test successful!'"; then
        success "SSH connection works perfectly!"
    else
        error "SSH connection failed"
    fi
}

# Main function
main() {
    # Parse arguments first
    parse_arguments "$@"
    
    # If no arguments provided, show help
    if [[ -z "$SERVER_IP" ]]; then
        show_help
        exit 0
    fi
    
    # Execute based on mode
    if [[ "$CLEANUP_MODE" == "true" ]]; then
        cleanup_deployment
    else
        deploy
    fi
}

# Run main function
main "$@"
