#!/bin/bash

# 🔧 Facebook Token Health Check & Fix Script
# This script checks all Facebook tokens and attempts to fix invalid ones

echo "🔍 Facebook Token Health Check & Auto-Fix"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3900"

# Function to check token health
check_token_health() {
    local endpoint=$1
    local description=$2
    
    echo -e "\n${BLUE}🔍 Checking: ${description}${NC}"
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "✅ ${GREEN}TOKEN HEALTHY${NC}"
        
        # Check if response contains success data
        success=$(echo "$body" | jq -r '.success // false' 2>/dev/null)
        if [ "$success" = "true" ]; then
            pages_count=$(echo "$body" | jq -r '.data | length // 0' 2>/dev/null)
            echo "📊 Active pages: ${pages_count}"
        fi
        
    elif [ "$http_code" = "401" ]; then
        echo -e "❌ ${RED}TOKEN INVALID${NC}"
        
        error_msg=$(echo "$body" | jq -r '.error // "Unknown error"' 2>/dev/null)
        error_code=$(echo "$body" | jq -r '.code // "UNKNOWN"' 2>/dev/null)
        action=$(echo "$body" | jq -r '.action // "unknown"' 2>/dev/null)
        
        echo "Error: ${error_msg}"
        echo "Code: ${error_code}"
        echo "Action: ${action}"
        
        # Check if this is a specific token issue
        case "$error_code" in
            "190")
                echo -e "🔄 ${YELLOW}ATTEMPTING AUTO-REFRESH...${NC}"
                attempt_token_refresh "$endpoint"
                ;;
            "460"|"463"|"464")
                echo -e "⚠️  ${YELLOW}SESSION INVALIDATED - MANUAL RECONNECTION REQUIRED${NC}"
                echo "This error occurs when:"
                echo "- User changed Facebook password"
                echo "- Facebook invalidated session for security"
                echo "- Account was compromised"
                echo ""
                echo "Solution: Please reconnect Facebook account manually"
                ;;
            "467")
                echo -e "🔧 ${YELLOW}INVALID TOKEN SIGNATURE${NC}"
                echo "This usually means the token is corrupted or malformed"
                ;;
        esac
        
    else
        echo -e "❌ ${RED}API ERROR${NC} - HTTP ${http_code}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

# Function to attempt token refresh
attempt_token_refresh() {
    local endpoint=$1
    
    echo "🔄 Attempting automatic token refresh..."
    
    refresh_response=$(curl -s -X POST "${BASE_URL}/api/admin/social/facebook/refresh-tokens" \
        -H "Content-Type: application/json" \
        -d '{"autoRefresh": true}')
    
    refresh_success=$(echo "$refresh_response" | jq -r '.success // false' 2>/dev/null)
    
    if [ "$refresh_success" = "true" ]; then
        echo -e "✅ ${GREEN}TOKEN REFRESH SUCCESSFUL${NC}"
        
        # Re-test the endpoint
        echo "🔄 Re-testing endpoint..."
        check_token_health "$endpoint" "Re-test after refresh"
        
    else
        echo -e "❌ ${RED}TOKEN REFRESH FAILED${NC}"
        refresh_error=$(echo "$refresh_response" | jq -r '.error // "Unknown error"' 2>/dev/null)
        echo "Error: ${refresh_error}"
        echo ""
        echo -e "${YELLOW}Manual action required:${NC}"
        echo "1. Go to Facebook Developer Console"
        echo "2. Generate new access token"
        echo "3. Update token in application settings"
    fi
}

# Function to get token diagnostics
get_token_diagnostics() {
    echo -e "\n${BLUE}📊 TOKEN DIAGNOSTICS${NC}"
    echo "===================="
    
    diag_response=$(curl -s "${BASE_URL}/api/admin/social/facebook/debug-permissions")
    
    echo "$diag_response" | jq '.' 2>/dev/null || echo "$diag_response"
}

# Function to show token recovery options
show_recovery_options() {
    echo -e "\n${YELLOW}🛠️  TOKEN RECOVERY OPTIONS${NC}"
    echo "=========================="
    echo ""
    echo "1. Automatic Refresh (for expired tokens):"
    echo "   curl -X POST \"${BASE_URL}/api/admin/social/facebook/refresh-tokens\""
    echo ""
    echo "2. Manual Token Update:"
    echo "   - Get new token from Facebook Developer Console"
    echo "   - Update in database or environment variables"
    echo ""
    echo "3. Complete Reconnection:"
    echo "   - Revoke current app permissions in Facebook"
    echo "   - Re-authorize the application"
    echo "   - Generate new long-lived tokens"
    echo ""
    echo "4. Debug Token Issues:"
    echo "   curl \"${BASE_URL}/api/admin/social/facebook/debug-permissions\""
}

# Main execution
echo -e "\n${YELLOW}Testing Facebook Token Health...${NC}"

# Test key endpoints
check_token_health "/api/admin/social/facebook/data?type=pages&limit=5" "Pages Access"
check_token_health "/api/admin/social/facebook/data?type=posts&limit=5" "Posts Access"
check_token_health "/api/admin/social/facebook/data?type=comments&limit=5" "Comments Access"

# Get detailed diagnostics
get_token_diagnostics

# Show recovery options
show_recovery_options

echo -e "\n${GREEN}🎯 Facebook Token Health Check Complete!${NC}"
echo ""
echo "Summary of common token issues:"
echo "• Code 190: Token expired - Can be auto-refreshed"
echo "• Code 460: Password changed - Manual reconnection required"
echo "• Code 463: Session expired - Manual reconnection required"  
echo "• Code 464: Session invalidated - Manual reconnection required"
echo "• Code 467: Invalid signature - Token corrupted"
echo ""
echo "For persistent issues, check:"
echo "1. Facebook App settings and permissions"
echo "2. App review status for advanced permissions"
echo "3. Token expiration settings"
echo "4. Rate limiting and usage quotas"
