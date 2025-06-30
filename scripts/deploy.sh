#!/bin/bash

# KataCore Docker Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🚀 Starting KataCore deployment..."

# Setup Bun PATH - source the helper script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/bun-setup.sh"

# Setup Bun for current session
if ! setup_bun_for_session; then
    exit 1
fi

# Environment selection
ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [[ "$ENVIRONMENT" == "dev" || "$ENVIRONMENT" == "development" ]]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "📦 Deploying in DEVELOPMENT mode..."
else
    echo "🏭 Deploying in PRODUCTION mode..."
fi

# Check if Docker is installed and install if needed
if ! command -v docker &> /dev/null; then
    echo "🐳 Docker not found. Installing Docker automatically..."
    if ./scripts/install-docker.sh install; then
        echo "✅ Docker installed successfully"
        echo "⚠️  You may need to restart your terminal session for full Docker access"
        echo "   Continuing with deployment using sudo for Docker commands..."
    else
        echo "❌ Failed to install Docker automatically."
        echo "   Please install Docker manually and try again."
        exit 1
    fi
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "🐳 Docker Compose not found. Installing..."
    if ./scripts/install-docker.sh install; then
        echo "✅ Docker Compose installed successfully"
    else
        echo "❌ Failed to install Docker Compose automatically."
        exit 1
    fi
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "🔄 Docker is not running. Attempting to start..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker || echo "⚠️  Please start Docker manually: sudo systemctl start docker"
    elif command -v service &> /dev/null; then
        sudo service docker start || echo "⚠️  Please start Docker manually: sudo service docker start"
    else
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Wait a moment and check again
    sleep 3
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker failed to start. Please start Docker manually and try again."
        exit 1
    fi
    echo "✅ Docker started successfully"
fi

# Build and install dependencies first
echo "📦 Installing dependencies..."
bun run install:all

# Run build and tests
echo "🔨 Building and testing applications..."
if ./test-build.sh; then
    echo "✅ Build and tests successful"
else
    echo "❌ Build or tests failed. Deployment aborted."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Remove old images (optional)
if [[ "$2" == "--clean" ]]; then
    echo "🧹 Cleaning old Docker images..."
    docker system prune -f
    docker-compose -f $COMPOSE_FILE build --no-cache
else
    # Build images
    echo "🏗️ Building Docker images..."
    docker-compose -f $COMPOSE_FILE build
fi

# Start services
echo "🚀 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
services=("postgres" "redis" "minio" "api" "site" "nginx")

for service in "${services[@]}"; do
    if docker-compose -f $COMPOSE_FILE ps $service | grep -q "Up (healthy)"; then
        echo "✅ $service is healthy"
    else
        echo "⚠️ $service might not be fully ready yet"
    fi
done

# Show running services
echo "📊 Running services:"
docker-compose -f $COMPOSE_FILE ps

# Display access information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Access URLs:"
if [[ "$ENVIRONMENT" == "dev" || "$ENVIRONMENT" == "development" ]]; then
    echo "  🌐 Frontend:     http://localhost:3000"
    echo "  🔌 API:          http://localhost:3001"
    echo "  🗄️  Database:     localhost:5433"
    echo "  💾 Redis:        localhost:6380"
    echo "  📦 MinIO:        http://localhost:9002"
    echo "  📊 MinIO Console: http://localhost:9003"
    echo "  🛠️  pgAdmin:      http://localhost:8081"
else
    echo "  🌐 Frontend:     http://localhost:3000"
    echo "  🔌 API:          http://localhost:3001"
    echo "  🌍 Nginx:        http://localhost:80"
    echo "  🗄️  Database:     localhost:5432"
    echo "  💾 Redis:        localhost:6379"
    echo "  📦 MinIO:        http://localhost:9000"
    echo "  📊 MinIO Console: http://localhost:9001"
    echo "  🛠️  pgAdmin:      http://localhost:8080"
fi
echo ""
echo "🔐 Default Credentials:"
echo "  Database: postgres/postgres123"
echo "  Redis: redis123"
echo "  MinIO: minioadmin/minioadmin123"
echo "  pgAdmin: admin@katacore.com/admin123"
echo ""
echo "📝 To view logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
echo "🛑 To stop: docker-compose -f $COMPOSE_FILE down"
echo ""
