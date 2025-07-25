#!/bin/bash

# Quick Deploy with Bug Fixes
set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting deployment with bug fixes...${NC}"

# Use optimized Dockerfile
if [ -f "site/Dockerfile.optimized" ]; then
    echo "Using optimized Dockerfile..."
    cp site/Dockerfile.optimized site/Dockerfile
fi

# Run verification
if [ -f "scripts/verify-deployment.sh" ]; then
    echo "Running deployment verification..."
    ./scripts/verify-deployment.sh
fi

# Build and deploy
echo "Building and deploying with Docker Compose..."
docker compose down || true
docker compose build --no-cache
docker compose up -d

echo -e "${GREEN}✅ Deployment completed with bug fixes applied!${NC}"
