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
DOCKER_COMPOSE_FILE="docker-compose.yml"
NGINX_API=false
NGINX_PGADMIN=false
NGINX_MINIO=false

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
    --key PATH         SSH private key path (default: ~/.ssh/default)
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
            --nginxapi)
                NGINX_API=true
                shift
                ;;
            --nginxpgadmin)
                NGINX_PGADMIN=true
                shift
                ;;
            --nginxminio)
                NGINX_MINIO=true
                shift
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
        SSH_KEY_PATH="$HOME/.ssh/default"
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
    log "[CHECK] Validating Docker Compose configuration..."
    
    # Check Docker Compose version - try both docker-compose and docker compose
    local compose_cmd=""
    if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
        compose_cmd="docker compose"
    elif command -v docker-compose &> /dev/null; then
        compose_cmd="docker-compose"
    else
        error "Docker Compose not found. Please install Docker Compose."
    fi
    
    # Validate compose file syntax
    log "Testing Docker Compose configuration with command: $compose_cmd"
    if eval "$compose_cmd -f \"$DOCKER_COMPOSE_FILE\" --env-file .env.prod config --quiet" > /dev/null 2>&1; then
        log "Docker Compose configuration is valid"
    else
        error "Invalid Docker Compose file: $DOCKER_COMPOSE_FILE"
    fi
    
    # Check required services
    local required_services=("api" "site" "postgres" "redis" "minio")
    for service in "${required_services[@]}"; do
        if ! eval "$compose_cmd -f \"$DOCKER_COMPOSE_FILE\" --env-file .env.prod config --services" | grep -q "^$service$"; then
            warning "Service '$service' not found in Docker Compose file"
        fi
    done
    
    # Check for build contexts
    local build_contexts=$(eval "$compose_cmd -f \"$DOCKER_COMPOSE_FILE\" --env-file .env.prod config" | grep -E "context:" | awk '{print $2}')
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
        echo "Available options:"
        echo "1. Create a new SSH key: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
        echo "2. Use existing key: ./deploy-remote.sh --key /path/to/your/key IP DOMAIN"
        echo "3. Use password authentication (not recommended for production)"
        exit 1
    fi
    
    success "SSH key found at $SSH_KEY_PATH"
    
    # Check if docker-compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    fi
    
    # Validate Docker Compose file syntax
    if ! docker compose -f "$DOCKER_COMPOSE_FILE" config --quiet; then
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
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$temp_dir/"
    
    # Remove any existing .env.prod to force regeneration if requested
    if [[ "$FORCE_REGEN" == "true" ]]; then
        rm -f "$temp_dir/.env.prod"
    fi
    
    # Transfer files to remote server using rsync for better performance
    # Sử dụng rsync để truyền file từ thư mục tạm đến server từ xa
    # -a: chế độ archive (bảo toàn quyền, thời gian, liên kết tượng trưng)
    # -v: hiển thị chi tiết quá trình truyền file
    # -z: nén dữ liệu trong quá trình truyền để tăng tốc độ
    # -e: chỉ định lệnh SSH với key riêng tư
    # Truyền từ thư mục tạm đến thư mục project trên server
    rsync -avz -e "ssh -i $SSH_KEY_PATH" "$temp_dir/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Project files transferred successfully"
}

# Generate environment configuration
generate_environment() {
    log "🔧 Generating environment configuration..."
    
    # Validate required environment variables
    if [[ -z "$PROJECT_NAME" || -z "$SERVER_IP" || -z "$DOMAIN" || -z "$DEPLOY_TYPE" ]]; then
        log "❌ Error: Required environment variables (PROJECT_NAME, SERVER_IP, DOMAIN, DEPLOY_TYPE) are not set."
        exit 1
    fi

    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOSSH
        set -e
        export PROJECT_NAME="$PROJECT_NAME"
        export SERVER_IP="$SERVER_IP"
        export DOMAIN="$DOMAIN"
        export DEPLOY_TYPE="$DEPLOY_TYPE"
        export FORCE_REGEN="$FORCE_REGEN"
        
        cd /opt/\$PROJECT_NAME
        
        # Create .env.prod file if it doesn't exist
        if [[ ! -f .env.prod ]] || [[ "\$FORCE_REGEN" == "true" ]]; then
            echo "🔐 Generating environment variables..."
            
            # Generate random passwords and keys
            DB_PASSWORD=\$(openssl rand -hex 16)
            REDIS_PASSWORD=\$(openssl rand -hex 16)
            JWT_SECRET=\$(openssl rand -hex 32)
            ENCRYPTION_KEY=\$(openssl rand -hex 16)
            MINIO_ROOT_PASSWORD=\$(openssl rand -hex 16)
            PGADMIN_PASSWORD=\$(openssl rand -hex 12)
            GRAFANA_ADMIN_PASSWORD=\$(openssl rand -hex 12)
           
            # Create .env.prod file
            cat > .env.prod << EOF
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
POSTGRES_DB=\$PROJECT_NAME
POSTGRES_USER=\$PROJECT_NAME
POSTGRES_PASSWORD=\$DB_PASSWORD
DATABASE_URL=postgresql://\$PROJECT_NAME:\$DB_PASSWORD@postgres:5432/\$PROJECT_NAME

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
SERVER_IP=\$SERVER_IP
DOMAIN=\$DOMAIN
DEPLOY_TYPE=\$DEPLOY_TYPE

# ===== SSL Configuration (for full deployment) =====
SSL_EMAIL=admin@\$DOMAIN
EOF

            # Append deployment-specific configuration
            if [[ "\$DEPLOY_TYPE" == "simple" ]]; then
                cat >> .env.prod << EOF

# ===== CORS Configuration =====
CORS_ORIGIN=http://\$SERVER_IP:3000
NEXT_PUBLIC_API_URL=http://\$SERVER_IP:3001
NEXT_PUBLIC_APP_URL=http://\$SERVER_IP:3000
NEXT_PUBLIC_MINIO_ENDPOINT=http://\$SERVER_IP:9000
PGADMIN_DEFAULT_EMAIL=admin@\$SERVER_IP
EOF
            else
                cat >> .env.prod << EOF

# ===== CORS Configuration =====
CORS_ORIGIN=https://\$DOMAIN,http://\$SERVER_IP:3000
NEXT_PUBLIC_API_URL=https://api.\$DOMAIN
NEXT_PUBLIC_APP_URL=https://\$DOMAIN
NEXT_PUBLIC_MINIO_ENDPOINT=https://minio.\$DOMAIN
PGADMIN_DEFAULT_EMAIL=admin@\$DOMAIN
EOF
            fi
            
            echo "✅ .env.prod file created successfully!"

            # Print credentials instead of saving to a file
            echo "✅ Environment file generated with the following credentials (SAVE SECURELY):"
            echo "   🔐 Database Password: \$DB_PASSWORD"
            echo "   🔐 Redis Password: \$REDIS_PASSWORD"
            echo "   🔐 JWT Secret: \$JWT_SECRET"
            echo "   🔐 Encryption Key: \$ENCRYPTION_KEY"
            echo "   🔐 MinIO Root Password: \$MINIO_ROOT_PASSWORD"
            echo "   🔐 pgAdmin Password: \$PGADMIN_PASSWORD"
            echo "   🔐 Grafana Admin Password: \$GRAFANA_ADMIN_PASSWORD"

        else
            echo "📋 Using existing .env.prod file"
        fi

        # Check if a system restart is required
        if [ -f /var/run/reboot-required ]; then
            echo "⚠️ System restart required. Please run 'sudo reboot' manually when ready."
        fi
EOSSH
    
    success "Environment configuration completed"
}

# Build and run Docker Compose
run_docker_compose() {
    log "🚀 Building and running Docker Compose..."
    
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" << EOF
        set -e
        cd /opt/$PROJECT_NAME
        
        echo "🧹 Cleaning up existing containers..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down --remove-orphans 2>/dev/null || true
        
        echo "🗑️  Cleaning up Docker system..."
        docker system prune -f
        
        echo "🔍 Checking Docker Compose file..."
        if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
            echo "❌ Docker Compose file not found: $DOCKER_COMPOSE_FILE"
            exit 1
        fi
        
        echo "📋 Validating Docker Compose configuration..."
        docker compose -f $DOCKER_COMPOSE_FILE --env-file .env.prod config --quiet
        
        echo "🔨 Building Docker images..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod build --no-cache --parallel
        
        echo "🚀 Starting services..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod up -d
        
        echo "⏳ Waiting for services to start..."
        sleep 30
        
        echo "🔍 Checking service health..."
        # Check if services are running
        for i in {1..10}; do
            if docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps | grep -q "Up"; then
                echo "✅ Services are starting up..."
                break
            fi
            echo "⏳ Waiting for services... (\$i/10)"
            sleep 3
        done
        
        echo "📊 Checking service status..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps
        
        echo "📋 Checking service logs for errors..."
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod logs --tail=50
        
        echo "✅ Docker Compose deployment completed!"
EOF
    
    success "Docker Compose services are running"
}

# Configure SSL (for full deployment)
configure_ssl() {
    if [[ "$DEPLOY_TYPE" == "full" ]]; then
        log "🔒 Configuring SSL certificates..."

        # Build Nginx config blocks based on flags
        local nginx_conf=""
        nginx_conf+="server {
    listen 80;
    server_name \$DOMAIN www.\$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        if [[ "$NGINX_API" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name api.\$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi
        if [[ "$NGINX_PGADMIN" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name pgadmin.\$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5050;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi
        if [[ "$NGINX_MINIO" == "true" ]]; then
            nginx_conf+="
server {
    listen 80;
    server_name minio.\$DOMAIN;
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
"
        fi

        # Prepare certbot domains
        local certbot_domains="-d $DOMAIN -d www.$DOMAIN"
        [[ "$NGINX_API" == "true" ]] && certbot_domains+=" -d api.$DOMAIN"
        [[ "$NGINX_PGADMIN" == "true" ]] && certbot_domains+=" -d pgadmin.$DOMAIN"
        [[ "$NGINX_MINIO" == "true" ]] && certbot_domains+=" -d minio.$DOMAIN"
        ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" bash -s <<EOF
set -e
DOMAIN="$DOMAIN"
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/\$DOMAIN <<'NGINXEOF'
$nginx_conf
NGINXEOF

ln -sf /etc/nginx/sites-available/\$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "🔒 Obtaining SSL certificate..."
certbot --nginx $certbot_domains --non-interactive --agree-tos --expand --email admin@\$DOMAIN || {
    echo "⚠️  Certbot could not install the certificate automatically. Attempting manual installation..."
    # Find the actual certbot certificate name
    CERT_NAME=\$(certbot certificates | grep "Certificate Name:" | grep "\$DOMAIN" | head -n1 | awk '{print \$3}')
    if [[ -n "\$CERT_NAME" ]]; then
        certbot install --cert-name "\$CERT_NAME" --nginx --non-interactive --agree-tos --email admin@\$DOMAIN || true
    else
        echo "❌ Could not determine certificate name for manual installation."
    fi
}

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
        docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps
        
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
        if docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod exec -T postgres pg_isready -U $PROJECT_NAME > /dev/null 2>&1; then
            echo "✅ PostgreSQL: Connection healthy"
        else
            echo "❌ PostgreSQL: Connection failed"
        fi
        
        # Check Redis connection
        if docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod exec -T redis redis-cli ping > /dev/null 2>&1; then
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
    ssh -i "$SSH_KEY_PATH" "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod ps"
    echo ""
    
    echo -e "${CYAN}🔗 Service URLs:${NC}"
    if [[ "$DEPLOY_TYPE" == "simple" ]]; then
        echo -e "   🌐 Main App:      http://$SERVER_IP:3000"
        echo -e "   🚀 API:          http://$SERVER_IP:3001"
        echo -e "   📦 MinIO:        http://$SERVER_IP:9000"
        echo -e "   🗄️  MinIO Console: http://$SERVER_IP:9001"
        echo -e "   🗄️  pgAdmin:      http://$SERVER_IP:5050"
        echo -e "   🗄️  Database:     $SERVER_IP:5432"
        echo -e "   🗄️  Redis:        $SERVER_IP:6379"
    else
        echo -e "   🌐 Main App:      https://$DOMAIN"
        echo -e "   🚀 API:          https://api.$DOMAIN"
        echo -e "   📦 MinIO:        https://minio.$DOMAIN"
        echo -e "   🗄️  MinIO Console: https://minio.$DOMAIN"
        echo -e "   🗄️  pgAdmin:      https://pgadmin.$DOMAIN"
        echo -e "   🗄️  Database:     $DOMAIN:5432"
        echo -e "   🗄️  Redis:        $DOMAIN:6379"
    fi
    echo ""
    
    echo -e "${CYAN}📋 Management Commands:${NC}"
    echo -e "   🔍 Check logs:    ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod logs'"
    echo -e "   🔄 Restart:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod restart'"
    echo -e "   ⏹️  Stop:         ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod stop'"
    echo -e "   🗑️  Remove:       ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/$PROJECT_NAME && docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down'"
    echo ""
    
    echo -e "${YELLOW}🔐 Important: Check .env.prod file on server for generated passwords${NC}"
    echo -e "   ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cat /opt/$PROJECT_NAME/.env.prod'"
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
        SSH_KEY_PATH="$HOME/.ssh/default"
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
                docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down --remove-orphans -v || true
                
                echo "🗑️  Removing Docker images..."
                docker compose -f $DOCKER_COMPOSE_FILE -p $PROJECT_NAME --env-file .env.prod down --rmi all || true
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