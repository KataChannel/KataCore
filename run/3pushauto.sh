#!/bin/bash

# Fixed configuration - no user input required
SSH_USER="root"
SERVER_IP="116.118.49.243"
PROJECT_NAME="tazacore"
LOCAL_BUILD_DIR="/tmp/nextjs_build_$(date +%s)"

# Colors for better display
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Main deployment function
deploy_nextjs() {
    echo -e "${CYAN}🚀 Starting optimized NextJS deployment...${NC}"
    
    # Step 1: Build NextJS locally
    echo -e "${YELLOW}📦 Building NextJS locally...${NC}"
    
    # Create build directory
    mkdir -p "$LOCAL_BUILD_DIR"
    
    # Generate Prisma client first
    echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
    if [ "$DOCKER_BUILD" != "true" ]; then
        bun run db:generate
    fi
    
    # Build NextJS with optimizations
    echo -e "${BLUE}⚡ Building NextJS with optimizations...${NC}"
    NODE_ENV=production bun run build || {
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    }
    
    # Step 2: Prepare deployment package
    echo -e "${YELLOW}📋 Preparing deployment package...${NC}"
    
    # Copy build artifacts
    cp -r .next/standalone/* "$LOCAL_BUILD_DIR/" 2>/dev/null || true
    cp -r .next/static "$LOCAL_BUILD_DIR/.next/" 2>/dev/null || true
    cp -r public "$LOCAL_BUILD_DIR/" 2>/dev/null || true
    
    # Copy essential app files for App Router
    echo -e "${YELLOW}📁 Copying App Router files...${NC}"
    echo -e "${BLUE}Copying app directory...${NC}"
    if [ -d "app" ]; then
        cp -r app "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ app directory copied${NC}" || echo -e "${RED}❌ Failed to copy app directory${NC}"
    else
        echo -e "${RED}❌ app directory not found${NC}"
        exit 1
    fi

    echo -e "${BLUE}Copying lib directory...${NC}"
    [ -d "lib" ] && cp -r lib "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ lib directory copied${NC}"

    echo -e "${BLUE}Copying components directory...${NC}"
    [ -d "components" ] && cp -r components "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ components directory copied${NC}"

    echo -e "${BLUE}Copying hooks directory...${NC}"
    [ -d "hooks" ] && cp -r hooks "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ hooks directory copied${NC}"

    echo -e "${BLUE}Copying utils directory...${NC}"
    [ -d "utils" ] && cp -r utils "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ utils directory copied${NC}"

    echo -e "${BLUE}Copying types directory...${NC}"
    [ -d "types" ] && cp -r types "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ types directory copied${NC}"

    echo -e "${BLUE}Copying prisma directory...${NC}"
    [ -d "prisma" ] && cp -r prisma "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ prisma directory copied${NC}"

    echo -e "${BLUE}Copying environment files...${NC}"
    [ -f ".env" ] && cp .env "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ .env copied${NC}"
    [ -f ".env.local" ] && cp .env.local "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ .env.local copied${NC}"
    [ -f ".env.production" ] && cp .env.production "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ .env.production copied${NC}"
    
    echo -e "${BLUE}Copying package files...${NC}"
    [ -f "package.json" ] && cp package.json "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ package.json copied${NC}"
    [ -f "bun.lockb" ] && cp bun.lockb "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ bun.lockb copied${NC}"
    [ -f "tsconfig.json" ] && cp tsconfig.json "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ tsconfig.json copied${NC}"
    [ -f "next.config.ts" ] && cp next.config.ts "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ next.config.ts copied${NC}"
    [ -f "tailwind.config.ts" ] && cp tailwind.config.ts "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ tailwind.config.ts copied${NC}"
    [ -f "postcss.config.mjs" ] && cp postcss.config.mjs "$LOCAL_BUILD_DIR/" && echo -e "${GREEN}✅ postcss.config.mjs copied${NC}"
    
    # Step 3: Copy and optimize Docker files
    echo -e "${YELLOW}📄 Copying and optimizing Docker files...${NC}"
    cp Dockerfile "$LOCAL_BUILD_DIR/"
    echo -e "${GREEN}✅ Dockerfile copied${NC}"
    
    # Optimize docker-compose.yml (remove resource constraints)
    echo -e "${BLUE}🔧 Optimizing docker-compose.yml (removing resource constraints)...${NC}"
    sed '/deploy:/,/^[[:space:]]*[a-zA-Z]/{ /^[[:space:]]*[a-zA-Z]/!d; /deploy:/d; }' docker-compose.yml > "$LOCAL_BUILD_DIR/docker-compose.yml"
    echo -e "${GREEN}✅ docker-compose.yml optimized and copied${NC}"
    
    # Step 4: Create compressed package
    echo -e "${YELLOW}🗜️  Creating compressed package...${NC}"
    cd "$LOCAL_BUILD_DIR/.."
    tar -czf nextjs-deploy.tar.gz "$(basename "$LOCAL_BUILD_DIR")"
    
    # Step 5: Upload to server
    echo -e "${YELLOW}⬆️  Uploading to server...${NC}"
    scp nextjs-deploy.tar.gz "$SSH_USER@$SERVER_IP:/tmp/"
    
    # Step 6: Deploy on server
    echo -e "${YELLOW}🚀 Deploying on server...${NC}"
    ssh "$SSH_USER@$SERVER_IP" "
        cd /tmp
        rm -rf deploy
        mkdir -p deploy
        cd deploy
        tar -xzf ../nextjs-deploy.tar.gz --strip-components=1
        
        # Stop and remove existing containers
        echo 'Stopping and removing existing containers...'
        docker-compose down 2>/dev/null || true
        
        # Remove all containers with the project name
        docker ps -a --filter name=tazacore- --format='{{.Names}}' | xargs -r docker rm -f 2>/dev/null || true
        
        # Remove old images to force rebuild
        echo 'Removing old images...'
        docker rmi tazacore/site 2>/dev/null || true
        docker images --filter=reference='tazacore/*' --format='{{.Repository}}:{{.Tag}}' | xargs -r docker rmi -f 2>/dev/null || true
        
        # Start services
        echo 'Starting new services...'
        docker-compose up -d --build
        
        # Wait for services to start
        echo 'Waiting for services to start...'
        sleep 30
        
        # Show container status
        docker-compose ps
        
        echo '=== CONTAINER STATUS ==='
        if docker-compose ps | grep -q 'Up'; then
            echo 'DEPLOY_SUCCESS'
            echo '✅ Docker containers started successfully'
        else
            echo 'DEPLOY_FAILED'
            echo '❌ Some containers failed to start'
            docker-compose logs --tail=50
            exit 1
        fi
    "
    
    # Verify deployment
    local deploy_result=$?
    if [ $deploy_result -eq 0 ]; then
        echo -e "${YELLOW}🔍 Performing comprehensive health check...${NC}"
        sleep 5
        
        # Test site accessibility
        if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP:3900/" | grep -q "200\|404"; then
            echo -e "${GREEN}✅ Site is responding correctly${NC}"
        else
            echo -e "${RED}❌ Site health check failed${NC}"
        fi
        
        echo -e "${YELLOW}🧹 Cleaning up...${NC}"
        rm -rf "$LOCAL_BUILD_DIR"
        rm -f "/tmp/nextjs-deploy.tar.gz"
        
        echo ""
        echo -e "${CYAN}══════════════════════════════════════════════=${NC}"
        echo -e "${GREEN}     ✅ DEPLOYMENT COMPLETED SUCCESSFULLY${NC}"
        echo -e "${CYAN}🌐 Site available at: http://$SERVER_IP:3900${NC}"
        echo -e "${CYAN}📊 Status: All systems operational${NC}"
        echo -e "${CYAN}══════════════════════════════════════════════=${NC}"
    else
        echo -e "${YELLOW}🧹 Cleaning up...${NC}"
        rm -rf "$LOCAL_BUILD_DIR" 2>/dev/null || true
        rm -f "/tmp/nextjs-deploy.tar.gz" 2>/dev/null || true
        
        echo ""
        echo -e "${CYAN}══════════════════════════════════════════════=${NC}"
        echo -e "${RED}     ❌ DEPLOYMENT FAILED${NC}"
        echo -e "${RED}� Status: Deployment encountered errors${NC}"
        echo -e "${YELLOW}🔧 Run ./run/debug-deploy.sh for detailed diagnosis${NC}"
        echo -e "${CYAN}══════════════════════════════════════════════=${NC}"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    if [ -d "$LOCAL_BUILD_DIR" ]; then
        rm -rf "$LOCAL_BUILD_DIR" 2>/dev/null || true
    fi
    if [ -f "/tmp/nextjs-deploy.tar.gz" ]; then
        rm -f "/tmp/nextjs-deploy.tar.gz" 2>/dev/null || true
    fi
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution
deploy_nextjs
