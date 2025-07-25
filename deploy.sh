#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting optimized deployment process...${NC}"

# Git operations
echo -e "${GREEN}Adding files to git...${NC}"
git add .

echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Update deployment scripts and configurations - $(date)" || {
    echo -e "${YELLOW}No changes to commit${NC}"
}

echo -e "${GREEN}Pushing to remote...${NC}"
git push

# Check if remote server is accessible
echo -e "${GREEN}Testing server connection...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@116.118.49.243 exit; then
    echo -e "${RED}Failed to connect to server. Check connection and try again.${NC}"
    exit 1
fi

# SSH and deploy with optimizations
echo -e "${GREEN}Connecting to server and deploying...${NC}"
ssh root@116.118.49.243 << 'EOF'
    set -e
    cd /opt/taza_prod
    
    echo "Pulling latest changes..."
    git pull
    
    echo "Checking system resources..."
    df -h / | tail -1
    free -h
    
    echo "Cleaning Docker resources (aggressive)..."
    # Stop containers first
    docker compose down || true
    
    # Clean up more aggressively
    docker builder prune -af
    docker image prune -a -f
    docker volume prune -f
    docker network prune -f
    docker system prune -af
    
    # Remove old unused images
    docker images --filter "dangling=true" -q | xargs -r docker rmi
    
    echo "Building with optimized settings..."
    # Build with resource limits and better caching
    DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose -f 'docker-compose.yml' build \
        --no-cache \
        --pull \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        site
    
    echo "Starting services..."
    docker compose -f 'docker-compose.yml' up -d site
    
    echo "Waiting for service to be ready..."
    sleep 30
    
    echo "Checking container health..."
    docker compose ps
    docker compose logs --tail=20 site
    
    echo "Deployment completed successfully!"
EOF

echo -e "${GREEN}Deployment finished successfully!${NC}"
echo -e "${GREEN}Checking service status...${NC}"

# Quick health check
if curl -f -s -o /dev/null "http://116.118.49.243:3000/api/health" 2>/dev/null; then
    echo -e "${GREEN}✅ Service is healthy and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Service might still be starting up. Check manually if needed.${NC}"
fi
