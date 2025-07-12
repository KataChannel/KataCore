#!/bin/bash

# Enhanced Deployment Script with Shared Prisma Support
# This script includes pre-deployment Prisma setup and deployment optimization

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Banner
show_banner() {
    echo ""
    echo "🚀 TazaCore Enhanced Deployment with Shared Prisma"
    echo "=================================================="
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install Docker Compose."
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -f "docker-compose.yml" ]]; then
        error "Please run this script from the TazaCore root directory"
    fi
    
    success "Prerequisites checked"
}

# Setup shared Prisma
setup_shared_prisma() {
    log "Setting up shared Prisma configuration..."
    
    # Run the pre-deployment Prisma setup
    if [[ -f "pre-deploy-prisma.sh" ]]; then
        chmod +x pre-deploy-prisma.sh
        ./pre-deploy-prisma.sh
    else
        # Run basic setup if pre-deploy script doesn't exist
        if [[ ! -d "shared" ]] || [[ ! -f "shared/package.json" ]]; then
            log "Running shared Prisma setup..."
            if [[ -f "setup-shared-prisma.sh" ]]; then
                chmod +x setup-shared-prisma.sh
                ./setup-shared-prisma.sh
            else
                error "Shared Prisma setup files not found. Please ensure setup-shared-prisma.sh exists."
            fi
        else
            log "Installing shared dependencies..."
            cd shared
            npm install --production
            npx prisma generate
            cd ..
        fi
    fi
    
    success "Shared Prisma setup completed"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    if [[ ! -f ".env.prod" ]]; then
        error ".env.prod file not found. Please create environment configuration first."
    fi
    
    # Check required environment variables
    required_vars=("DATABASE_URL" "JWT_SECRET" "POSTGRES_PASSWORD" "REDIS_PASSWORD")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env.prod; then
            error "Required environment variable $var not found in .env.prod"
        fi
    done
    
    success "Environment configuration validated"
}

# Build Docker images
build_images() {
    log "Building Docker images with shared Prisma support..."
    
    # Create .dockerignore if it doesn't exist
    if [[ ! -f ".dockerignore" ]]; then
        log "Creating .dockerignore file..."
        cat > .dockerignore << 'EOF'
node_modules
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.next
dist
.vscode
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
Thumbs.db
EOF
    fi
    
    # Build images with better caching
    log "Building API image..."
    docker-compose -f docker-compose.yml --env-file .env.prod build api --no-cache
    
    log "Building Site image..."
    docker-compose -f docker-compose.yml --env-file .env.prod build site --no-cache
    
    success "Docker images built successfully"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.yml --env-file .env.prod down --remove-orphans || true
    
    # Clean up Docker system
    log "Cleaning up Docker system..."
    docker system prune -f || true
    
    # Start infrastructure services first
    log "Starting infrastructure services..."
    docker-compose -f docker-compose.yml --env-file .env.prod up -d postgres redis minio
    
    # Wait for infrastructure to be ready
    log "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Check infrastructure health
    for i in {1..10}; do
        if docker-compose -f docker-compose.yml --env-file .env.prod ps | grep -E "(postgres|redis|minio)" | grep -q "Up"; then
            success "Infrastructure services are ready"
            break
        fi
        log "Waiting for infrastructure services... ($i/10)"
        sleep 5
    done
    
    # Start application services
    log "Starting application services..."
    docker-compose -f docker-compose.yml --env-file .env.prod up -d api
    
    # Wait for API to be ready
    log "Waiting for API to be ready..."
    sleep 45
    
    # Start frontend
    docker-compose -f docker-compose.yml --env-file .env.prod up -d site
    
    success "Services deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 60
    
    # Check API health
    for i in {1..15}; do
        if curl -sf http://localhost:3001/health >/dev/null 2>&1 || curl -sf http://localhost:3001 >/dev/null 2>&1; then
            success "API is healthy"
            break
        fi
        log "Waiting for API to be healthy... ($i/15)"
        sleep 10
    done
    
    # Check Site health
    for i in {1..15}; do
        if curl -sf http://localhost:3000 >/dev/null 2>&1; then
            success "Site is healthy"
            break
        fi
        log "Waiting for Site to be healthy... ($i/15)"
        sleep 10
    done
    
    # Show final status
    log "Final service status:"
    docker-compose -f docker-compose.yml --env-file .env.prod ps
}

# Show deployment summary
show_summary() {
    echo ""
    echo "🎉 Deployment Completed Successfully!"
    echo "====================================="
    echo ""
    echo "📱 Application URLs:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • API: http://localhost:3001"
    echo "   • MinIO Console: http://localhost:9001"
    echo "   • pgAdmin: http://localhost:5050 (if enabled)"
    echo ""
    echo "🔧 Management Commands:"
    echo "   • View logs: docker-compose -f docker-compose.yml --env-file .env.prod logs -f"
    echo "   • Restart services: docker-compose -f docker-compose.yml --env-file .env.prod restart"
    echo "   • Stop services: docker-compose -f docker-compose.yml --env-file .env.prod down"
    echo ""
    echo "🗄️ Database Management:"
    echo "   • Run migrations: cd shared && npx prisma migrate deploy"
    echo "   • Seed database: cd shared && npm run db:seed"
    echo "   • Open Prisma Studio: cd shared && npx prisma studio"
    echo ""
    echo "📊 Monitoring:"
    echo "   • Check service health: ./verify-deployment.sh"
    echo "   • View resource usage: docker stats"
    echo ""
}

# Main deployment function
main() {
    show_banner
    
    check_prerequisites
    setup_shared_prisma
    validate_environment
    build_images
    deploy_services
    health_check
    show_summary
    
    success "🚀 TazaCore deployment with shared Prisma completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "clean")
        log "Cleaning up deployment..."
        docker-compose -f docker-compose.yml --env-file .env.prod down --volumes --remove-orphans
        docker system prune -af
        success "Cleanup completed"
        ;;
    "logs")
        docker-compose -f docker-compose.yml --env-file .env.prod logs -f "${2:-}"
        ;;
    "restart")
        docker-compose -f docker-compose.yml --env-file .env.prod restart "${2:-}"
        ;;
    "status")
        docker-compose -f docker-compose.yml --env-file .env.prod ps
        ;;
    *)
        main
        ;;
esac
