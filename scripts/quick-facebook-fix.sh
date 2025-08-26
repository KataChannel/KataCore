#!/bin/bash

# 🚀 Quick Facebook Token Fix Script
# Provides step-by-step guidance to fix Facebook token issues

echo "🔧 Facebook Token Quick Fix Guide"
echo "================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if server is running
echo -e "\n${BLUE}1. Checking if server is running...${NC}"
if curl -s http://localhost:3900/api/health > /dev/null 2>&1; then
    echo -e "✅ ${GREEN}Server is running on port 3900${NC}"
else
    echo -e "❌ ${RED}Server is not running. Please start with:${NC}"
    echo "   npm run dev"
    exit 1
fi

# Get token status
echo -e "\n${BLUE}2. Checking token health...${NC}"
TOKEN_STATUS=$(curl -s "http://localhost:3900/api/admin/social/facebook/refresh-tokens")

TOTAL_TOKENS=$(echo "$TOKEN_STATUS" | jq -r '.summary.total // 0')
VALID_TOKENS=$(echo "$TOKEN_STATUS" | jq -r '.summary.valid // 0')
INVALID_TOKENS=$(echo "$TOKEN_STATUS" | jq -r '.summary.invalid // 0')

echo "📊 Token Summary:"
echo "   Total: $TOTAL_TOKENS"
echo "   Valid: $VALID_TOKENS"
echo "   Invalid: $INVALID_TOKENS"

if [ "$INVALID_TOKENS" -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tokens are healthy! No action needed.${NC}"
    exit 0
fi

# Show specific error types
echo -e "\n${BLUE}3. Analyzing token errors...${NC}"
ERROR_190=$(echo "$TOKEN_STATUS" | jq -r '.tokens[] | select(.errorCode == "190") | .pageId' | wc -l)
ERROR_464=$(echo "$TOKEN_STATUS" | jq -r '.tokens[] | select(.errorCode == "464") | .pageId' | wc -l)

echo "Error breakdown:"
echo "   Code 190 (Expired): $ERROR_190 tokens"
echo "   Code 464 (Invalidated): $ERROR_464 tokens"

# Provide specific solutions
echo -e "\n${YELLOW}4. Recommended Solutions:${NC}"

if [ "$ERROR_190" -gt 0 ]; then
    echo -e "\n${BLUE}For Expired Tokens (Code 190):${NC}"
    echo "Try automatic refresh first:"
    echo "   curl -X POST \"http://localhost:3900/api/admin/social/facebook/refresh-tokens\" \\"
    echo "        -H \"Content-Type: application/json\" -d '{\"autoRefresh\": true}'"
    echo ""
    echo "Or run this script with auto-refresh:"
    read -p "Would you like to try auto-refresh now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Attempting auto-refresh...${NC}"
        REFRESH_RESULT=$(curl -s -X POST "http://localhost:3900/api/admin/social/facebook/refresh-tokens" \
                         -H "Content-Type: application/json" -d '{"autoRefresh": true}')
        
        REFRESHED=$(echo "$REFRESH_RESULT" | jq -r '.summary.refreshed // 0')
        FAILED=$(echo "$REFRESH_RESULT" | jq -r '.summary.failed // 0')
        
        echo "Refresh results:"
        echo "   Refreshed: $REFRESHED"
        echo "   Failed: $FAILED"
        
        if [ "$REFRESHED" -gt 0 ]; then
            echo -e "✅ ${GREEN}Some tokens were refreshed successfully!${NC}"
        fi
        
        if [ "$FAILED" -gt 0 ]; then
            echo -e "⚠️  ${YELLOW}Some tokens still need manual attention.${NC}"
        fi
    fi
fi

if [ "$ERROR_464" -gt 0 ] || [ "$ERROR_190" -gt 0 ]; then
    echo -e "\n${BLUE}For Manual Reconnection (Required for code 464 or failed 190):${NC}"
    echo ""
    echo "📝 Step-by-step manual fix:"
    echo ""
    echo "1. Go to Facebook Developer Console:"
    echo "   https://developers.facebook.com/apps/"
    echo ""
    echo "2. Select your app (TazaCore/KataCore)"
    echo ""
    echo "3. Go to Tools & Support > Access Token Tool"
    echo ""
    echo "4. Generate new Page Access Tokens for each page:"
    
    # List pages that need manual attention
    echo "$TOKEN_STATUS" | jq -r '.tokens[] | select(.status == "invalid") | "   - \(.pageName) (\(.pageId))"'
    
    echo ""
    echo "5. Update tokens in your application:"
    echo "   - Database: facebook_pages table"
    echo "   - Or via admin interface"
    echo ""
    echo "6. For session invalidated (464) errors:"
    echo "   - This usually means password was changed"
    echo "   - Or Facebook detected suspicious activity"
    echo "   - You may need to re-authorize the app completely"
fi

# Show verification steps
echo -e "\n${BLUE}5. Verification Steps:${NC}"
echo ""
echo "After fixing tokens, verify they work:"
echo "1. Check token status:"
echo "   curl \"http://localhost:3900/api/admin/social/facebook/refresh-tokens\""
echo ""
echo "2. Run comprehensive health check:"
echo "   ./scripts/facebook-token-health-check.sh"
echo ""
echo "3. Test specific functionality:"
echo "   curl \"http://localhost:3900/api/admin/social/facebook/data?type=pages&limit=5\""

# Show helpful resources
echo -e "\n${BLUE}6. Additional Resources:${NC}"
echo ""
echo "📚 Documentation:"
echo "   - docs/FACEBOOK_TOKEN_ERROR_HANDLING.md"
echo "   - docs/FACEBOOK_PAGINATION_IMPLEMENTATION.md"
echo ""
echo "🔧 Debugging Tools:"
echo "   - Debug endpoint: /api/admin/social/facebook/debug-permissions"
echo "   - Token refresh: /api/admin/social/facebook/refresh-tokens"
echo ""
echo "📞 Common Facebook Error Codes:"
echo "   - 190: Token expired (auto-fixable)"
echo "   - 460: Password changed (manual fix)"
echo "   - 463: Session expired (auto-fixable)"
echo "   - 464: Session invalidated (manual fix)"
echo "   - 467: Invalid signature (manual fix)"

echo -e "\n${GREEN}🎯 Facebook Token Fix Guide Complete!${NC}"
echo ""
echo "Need more help? Check the comprehensive documentation:"
echo "📖 docs/FACEBOOK_TOKEN_ERROR_HANDLING.md"
