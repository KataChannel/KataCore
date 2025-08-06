#!/bin/bash

# Script để chuyển đổi từ API roles hiện tại sang simple API
echo "🔄 Switching to Simple Roles API..."
echo "=================================="

API_DIR="/chikiet/kataoffical/tazagroup/app/api/admin/roles"
BACKUP_DIR="$API_DIR/backup_$(date +%Y%m%d_%H%M%S)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup
echo -e "${BLUE}📦 Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp "$API_DIR/route.ts" "$BACKUP_DIR/route.ts.backup" 2>/dev/null || echo "No existing route.ts found"

# Switch to simple API
echo -e "${BLUE}🔄 Switching to simple API...${NC}"
if [ -f "$API_DIR/route-simple.ts" ]; then
    cp "$API_DIR/route-simple.ts" "$API_DIR/route.ts"
    echo -e "${GREEN}✅ Switched to simple API${NC}"
    echo "Backup created at: $BACKUP_DIR"
else
    echo -e "${YELLOW}⚠️ route-simple.ts not found${NC}"
    exit 1
fi

# Test the API
echo -e "\n${BLUE}🧪 Testing API...${NC}"
sleep 2

response=$(curl -s -w "HTTP_STATUS:%{http_code}" "http://localhost:3900/api/admin/roles?limit=1")
http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ Simple API is working${NC}"
else
    echo -e "${YELLOW}⚠️ API test failed. Rolling back...${NC}"
    cp "$BACKUP_DIR/route.ts.backup" "$API_DIR/route.ts" 2>/dev/null
fi

echo -e "\n${BLUE}=================================${NC}"
echo -e "${GREEN}🎉 Simple API switch complete!${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo "🌐 Demo page: http://localhost:3900/demo/simple-roles"
echo "📋 API endpoint: http://localhost:3900/api/admin/roles"
echo "🧪 Test script: ./test-enhanced-simple-roles.sh"
