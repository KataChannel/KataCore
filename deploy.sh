#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# Git operations
echo -e "${GREEN}Adding files to git...${NC}"
git add .

echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Update deployment scripts and configurations" || {
    echo -e "${RED}No changes to commit${NC}"
}

echo -e "${GREEN}Pushing to remote...${NC}"
git push

# SSH and deploy
echo -e "${GREEN}Connecting to server and deploying...${NC}"
ssh root@116.118.49.243 << 'EOF'
    set -e
    cd /opt/taza_prod
    
    echo "Pulling latest changes..."
    git pull
    
    echo "Cleaning Docker resources..."
    docker builder prune -af
    docker image prune -a -f
    docker volume prune -a -f
    
    echo "Building and starting containers..."
    docker compose -f 'docker-compose.yml' up -d --build 'site'
    
    echo "Deployment completed!"
EOF

echo -e "${GREEN}Deployment finished successfully!${NC}"
