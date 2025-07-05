#!/bin/bash

# 🔧 Quick Deploy Script - Fixed Version
# This script fixes the main issues and runs deployment

set -euo pipefail

echo "🔧 KataCore Quick Deploy - Bug Fixed Version"
echo "============================================="

# Color codes
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Check if we're in the right directory
if [[ ! -f "deploy-remote.sh" ]]; then
    echo -e "${RED}❌ Please run this script from the KataCore root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking for fixed dependencies...${NC}"

# Check if jsonwebtoken was added to site/package.json
if grep -q '"jsonwebtoken"' site/package.json; then
    echo -e "${GREEN}✅ jsonwebtoken dependency found${NC}"
else
    echo -e "${RED}❌ jsonwebtoken dependency missing${NC}"
    echo "Adding jsonwebtoken to site/package.json..."
    # Add jsonwebtoken if not present
    sed -i 's/"clsx": "[^"]*",/"clsx": "^2.1.1",\n    "jsonwebtoken": "^9.0.2",/' site/package.json
    echo -e "${GREEN}✅ Added jsonwebtoken dependency${NC}"
fi

# Check if types for jsonwebtoken were added
if grep -q '"@types/jsonwebtoken"' site/package.json; then
    echo -e "${GREEN}✅ @types/jsonwebtoken dependency found${NC}"
else
    echo -e "${RED}❌ @types/jsonwebtoken dependency missing${NC}"
    echo "Adding @types/jsonwebtoken to site/package.json..."
    sed -i 's/"@types/bcryptjs": "[^"]*",/"@types/bcryptjs": "^2.4.6",\n    "@types/jsonwebtoken": "^9.0.7",/' site/package.json
    echo -e "${GREEN}✅ Added @types/jsonwebtoken dependency${NC}"
fi

echo -e "${YELLOW}🔍 Validating Dockerfile improvements...${NC}"

# Check if the Dockerfile has been improved
if grep -q "BUILD_SUCCESS" site/Dockerfile; then
    echo -e "${GREEN}✅ Dockerfile has improved error handling${NC}"
else
    echo -e "${RED}❌ Dockerfile needs improvement${NC}"
fi

echo -e "${YELLOW}🔍 Checking SSH key...${NC}"

# Check for SSH key
SSH_KEY_PATH="$HOME/.ssh/default"
if [[ -f "$SSH_KEY_PATH" ]]; then
    echo -e "${GREEN}✅ SSH key found at $SSH_KEY_PATH${NC}"
else
    echo -e "${YELLOW}⚠️ SSH key not found at $SSH_KEY_PATH${NC}"
    echo "Please run: ./ssh-keygen-setup.sh to create SSH keys"
    
    # Try alternative paths
    for alt_path in "$HOME/.ssh/id_rsa" "$HOME/.ssh/id_ed25519"; do
        if [[ -f "$alt_path" ]]; then
            echo -e "${GREEN}✅ Found alternative SSH key: $alt_path${NC}"
            SSH_KEY_PATH="$alt_path"
            break
        fi
    done
    
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        echo -e "${RED}❌ No SSH key found. Please create one first.${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Run the deployment with the found SSH key
exec ./deploy-remote.sh --key "$SSH_KEY_PATH" "$@"
