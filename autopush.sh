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

# Deploy on remote server
log "🚀 Deploying application..."
ssh "$SSH_USER@$SERVER_IP" "cd /opt/$PROJECT_NAME/ && docker compose -f 'docker-compose.yml' up -d --build" || error "Failed to deploy application"

success "Deployment completed successfully"