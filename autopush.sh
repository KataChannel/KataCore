#!/bin/bash

# Set variables
SSH_USER="root"
SERVER_IP="116.118.48.143"
PROJECT_NAME="katacore"
TEMP_DIR="/tmp/deploy_$(date +%s)"

# Function for logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

success() {
    echo "✅ $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

error() {
    echo "❌ $(date '+%Y-%m-%d %H:%M:%S') - $1"
    exit 1
}

# Git operations
log "📝 Committing changes..."
git add .
git commit -m "update $(date '+%Y-%m-%d %H:%M:%S')"
git push || error "Failed to push to git repository"

# Create temp directory
mkdir -p "$TEMP_DIR" || error "Failed to create temp directory"

log "📤 Transferring project files to remote server..."
# Copy all project files to temp directory (excluding unnecessary files)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='*.log' --exclude='.env' --exclude='*.md' --exclude='*.sh' . "$TEMP_DIR/" || error "Failed to copy files to temp directory"

# Transfer files to remote server
rsync -avz "$TEMP_DIR/" "$SSH_USER@$SERVER_IP:/opt/$PROJECT_NAME/" || error "Failed to transfer files to remote server"
# Update .env.prod to .env on remote server
ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && if [ -f .env.prod ]; then mv .env.prod .env; fi" || error "Failed to rename .env.prod to .env"
# Cleanup temp directory
rm -rf "$TEMP_DIR"
success "Project files transferred successfully"

# Server cleanup and optimization
log "🧹 Cleaning up and optimizing server..."
ssh "$SSH_USER@$SERVER_IP" "
    # Stop containers gracefully
    cd /opt/$PROJECT_NAME/ && docker compose down --remove-orphans

    # Clean up Docker system
    docker system prune -af --volumes
    docker builder prune -af

    # Clean up unused images and containers
    docker image prune -af
    docker container prune -f
    docker volume prune -f
    docker network prune -f

    # Clear system caches
    sync && echo 3 > /proc/sys/vm/drop_caches

    # Clean up temporary files
    rm -rf /tmp/* 2>/dev/null || true
    
    # Clean up log files older than 7 days
    find /var/log -name '*.log' -type f -mtime +7 -delete 2>/dev/null || true
    
    # Clean up package manager cache
    apt-get clean 2>/dev/null || yum clean all 2>/dev/null || true
" || error "Failed to cleanup server"

success "Server cleanup completed"

# Deploy on remote server
log "🚀 Deploying application..."
ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && docker compose -f 'docker-compose.yml' up -d --build" || error "Failed to deploy application"

success "Deployment completed successfully"