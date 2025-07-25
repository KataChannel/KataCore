#!/bin/bash

# Fix build issues and deploy
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 TazaCore Build Fix & Deploy${NC}"

# Step 1: Clean everything
echo -e "${YELLOW}🧹 Cleaning build artifacts...${NC}"
cd site
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
cd ..

# Step 2: Check disk space
echo -e "${YELLOW}💾 Checking disk space...${NC}"
df -h . | head -2

# Step 3: Ensure Prisma is properly set up
echo -e "${YELLOW}🗄️ Setting up Prisma...${NC}"
cd site
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Prisma schema not found!${NC}"
    exit 1
fi

# Generate Prisma client locally first
bun run db:generate
echo -e "${GREEN}✅ Prisma client generated locally${NC}"
cd ..

# Step 4: Test build locally first
echo -e "${YELLOW}🏗️ Testing local build...${NC}"
cd site
NODE_OPTIONS="--max-old-space-size=4096" bun run build:fast
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    exit 1
fi
cd ..

# Step 5: Run deployment
echo -e "${YELLOW}🚀 Starting deployment...${NC}"
./deploy.sh

echo -e "${GREEN}✅ Build fix and deployment completed!${NC}"
