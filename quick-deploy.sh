#!/bin/bash

# 🚀 KataCore Quick Deploy Script
# One-command deployment to any server

set -euo pipefail

# Default values
SERVER_IP=""
DOMAIN=""
SSH_USER="root"
DEPLOY_TYPE="simple"

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Show banner
echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚀 KataCore Quick Deploy                               ║
║                                                                              ║
║    One-command deployment - automatically handles SSH keys                  ║
║    Perfect for first-time deployments to new servers                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Show help
show_help() {
    cat << 'EOF'
🚀 KataCore Quick Deploy - One-Command Deployment

USAGE:
    ./quick-deploy.sh [OPTIONS] SERVER_IP [DOMAIN]

ARGUMENTS:
    SERVER_IP           Server IP address (required)
    DOMAIN             Domain name (optional, enables SSL)

OPTIONS:
    --user USER         SSH user (default: root)
    --simple            Force simple deployment (no SSL)
    --help              Show this help

EXAMPLES:
    # Simple deployment (IP only, no SSL)
    ./quick-deploy.sh 116.118.85.41

    # Full deployment with domain and SSL
    ./quick-deploy.sh 116.118.85.41 mydomain.com

    # Deploy with custom SSH user
    ./quick-deploy.sh --user ubuntu 116.118.85.41 mydomain.com

WHAT THIS SCRIPT DOES:
    1. ✅ Checks prerequisites
    2. 🔑 Generates SSH keys if needed
    3. 🚀 Deploys SSH key to server (password prompt)
    4. 🐳 Runs full KataCore deployment
    5. 🎉 Shows access URLs

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --user)
            SSH_USER="$2"
            shift 2
            ;;
        --simple)
            DEPLOY_TYPE="simple"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        -*)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
        *)
            if [[ -z "$SERVER_IP" ]]; then
                SERVER_IP="$1"
            elif [[ -z "$DOMAIN" ]]; then
                DOMAIN="$1"
                DEPLOY_TYPE="full"
            else
                echo -e "${RED}❌ Too many arguments${NC}"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate required arguments
if [[ -z "$SERVER_IP" ]]; then
    echo -e "${RED}❌ Server IP is required${NC}"
    show_help
    exit 1
fi

# Set domain to IP for simple deployment
if [[ "$DEPLOY_TYPE" == "simple" || -z "$DOMAIN" ]]; then
    DOMAIN="$SERVER_IP"
    DEPLOY_TYPE="simple"
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   📍 Server IP: $SERVER_IP"
echo -e "   🌍 Domain: $DOMAIN"
echo -e "   👤 SSH User: $SSH_USER"
echo -e "   🚀 Deploy Type: $DEPLOY_TYPE"
echo ""

# Step 1: Generate SSH key and deploy
echo -e "${YELLOW}Step 1: Setting up SSH key...${NC}"

# Check if SSH key already exists and is working
SSH_KEY_NAME="katacore-deploy"
SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"

if [[ -f "$SSH_KEY_PATH" ]]; then
    echo -e "${BLUE}🔍 Testing existing SSH key...${NC}"
    if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'SSH test successful'" &>/dev/null; then
        echo -e "${GREEN}✅ Existing SSH key works, skipping generation${NC}"
    else
        echo -e "${YELLOW}⚠️  Existing SSH key not working, regenerating...${NC}"
        if ! ./auto-ssh-deploy.sh --auto-deploy --user "$SSH_USER" --force "$SERVER_IP"; then
            echo -e "${RED}❌ Failed to setup SSH key${NC}"
            echo -e "${YELLOW}💡 Try manual SSH key setup:${NC}"
            echo "   ssh-copy-id -i ~/.ssh/katacore-deploy.pub $SSH_USER@$SERVER_IP"
            exit 1
        fi
    fi
else
    echo -e "${BLUE}🔑 Generating new SSH key...${NC}"
    if ! ./auto-ssh-deploy.sh --auto-deploy --user "$SSH_USER" --force "$SERVER_IP"; then
        echo -e "${RED}❌ Failed to setup SSH key${NC}"
        echo -e "${YELLOW}💡 Try manual SSH key setup:${NC}"
        echo "   ./ssh-keygen-setup.sh --server $SERVER_IP --user $SSH_USER"
        echo "   ssh-copy-id -i ~/.ssh/katacore-deploy.pub $SSH_USER@$SERVER_IP"
        exit 1
    fi
fi

echo -e "${GREEN}✅ SSH key setup completed${NC}"
echo ""

# Step 2: Deploy KataCore
echo -e "${YELLOW}Step 2: Deploying KataCore...${NC}"

# Find the generated SSH key
SSH_KEY_NAME="katacore-deploy"
SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"

# Check if key exists
if [[ ! -f "$SSH_KEY_PATH" ]]; then
    echo -e "${RED}❌ SSH key not found at $SSH_KEY_PATH${NC}"
    exit 1
fi

# Run deployment
if [[ "$DEPLOY_TYPE" == "simple" ]]; then
    if ! ./deploy-remote.sh --simple --key "$SSH_KEY_PATH" --user "$SSH_USER" "$SERVER_IP" "$DOMAIN"; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
else
    if ! ./deploy-remote.sh --key "$SSH_KEY_PATH" --user "$SSH_USER" "$SERVER_IP" "$DOMAIN"; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
fi

# Step 3: Show success message
echo -e "${GREEN}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🎉 DEPLOYMENT SUCCESSFUL!                         ║
║                                                                              ║
║    KataCore has been deployed successfully to your server                   ║
║    Password-less SSH is now configured                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}🔗 Access Your Application:${NC}"
if [[ "$DEPLOY_TYPE" == "simple" ]]; then
    echo -e "   🌐 Main App:      http://$SERVER_IP:3000"
    echo -e "   🚀 API:          http://$SERVER_IP:3001"
    echo -e "   📦 MinIO:        http://$SERVER_IP:9000"
    echo -e "   🗄️  pgAdmin:      http://$SERVER_IP:5050"
else
    echo -e "   🌐 Main App:      https://$DOMAIN"
    echo -e "   🚀 API:          https://$DOMAIN/api"
    echo -e "   📦 MinIO:        https://$DOMAIN:9000"
    echo -e "   🗄️  pgAdmin:      https://$DOMAIN/pgadmin"
fi
echo ""

echo -e "${BLUE}🔐 SSH Access:${NC}"
echo -e "   ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP"
echo -e "   # Or using config alias:"
echo -e "   ssh katacore-$SERVER_IP"
echo ""

echo -e "${BLUE}📋 Management Commands:${NC}"
echo -e "   Check status:     ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/katacore && docker-compose ps'"
echo -e "   View logs:        ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/katacore && docker-compose logs'"
echo -e "   Restart services: ssh -i $SSH_KEY_PATH $SSH_USER@$SERVER_IP 'cd /opt/katacore && docker-compose restart'"
echo ""

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Save this information for future server management${NC}"
