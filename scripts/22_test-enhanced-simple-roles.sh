#!/bin/bash

# Enhanced test script cho Simple Roles API
echo "🧪 Testing Enhanced Simple Roles API..."
echo "======================================"

BASE_URL="http://localhost:3900"
API_ENDPOINT="$BASE_URL/api/admin/roles"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_get_roles() {
    echo -e "\n${BLUE}📋 Test 1: GET all roles${NC}"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$API_ENDPOINT")
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ GET $API_ENDPOINT - Success (200)${NC}"
        # Count roles
        role_count=$(echo "$body" | jq '.roles | length' 2>/dev/null || echo "0")
        echo "Total roles found: $role_count"
    else
        echo -e "${RED}❌ GET $API_ENDPOINT - Failed ($http_status)${NC}"
        echo "$body"
    fi
}

test_create_role() {
    echo -e "\n${BLUE}📝 Test 2: POST create new role${NC}"
    test_role_data='{
        "name": "Test Simple Role",
        "description": "A test role created by simple API",
        "permissions": ["read:users", "write:users"],
        "level": 4,
        "modules": ["hr", "admin"]
    }'

    response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_role_data" \
        "$API_ENDPOINT")

    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

    if [ "$http_status" = "201" ]; then
        echo -e "${GREEN}✅ POST $API_ENDPOINT - Success (201)${NC}"
        # Extract role ID for further tests
        role_id=$(echo "$body" | jq -r '.data.role.id' 2>/dev/null)
        echo "Created role ID: $role_id"
        
        # Set global variable for use in other tests
        export TEST_ROLE_ID="$role_id"
    else
        echo -e "${RED}❌ POST $API_ENDPOINT - Failed ($http_status)${NC}"
        echo "$body"
    fi
}

test_update_role() {
    if [ -n "$TEST_ROLE_ID" ] && [ "$TEST_ROLE_ID" != "null" ]; then
        echo -e "\n${BLUE}✏️ Test 3: PUT update role${NC}"
        update_data='{
            "id": "'$TEST_ROLE_ID'",
            "name": "Updated Simple Test Role",
            "description": "Updated description via simple API",
            "level": 5
        }'
        
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
            -X PUT \
            -H "Content-Type: application/json" \
            -d "$update_data" \
            "$API_ENDPOINT")
        
        http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
        
        if [ "$http_status" = "200" ]; then
            echo -e "${GREEN}✅ PUT $API_ENDPOINT - Success (200)${NC}"
            echo "Role updated successfully"
        else
            echo -e "${RED}❌ PUT $API_ENDPOINT - Failed ($http_status)${NC}"
            echo "$body"
        fi
    else
        echo -e "${YELLOW}⚠️ Skipping update test - no role ID available${NC}"
    fi
}

test_delete_role() {
    if [ -n "$TEST_ROLE_ID" ] && [ "$TEST_ROLE_ID" != "null" ]; then
        echo -e "\n${BLUE}🗑️ Test 4: DELETE role${NC}"
        
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
            -X DELETE \
            "$API_ENDPOINT?id=$TEST_ROLE_ID")
        
        http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
        
        if [ "$http_status" = "200" ]; then
            echo -e "${GREEN}✅ DELETE $API_ENDPOINT - Success (200)${NC}"
            echo "Role deleted successfully"
        else
            echo -e "${RED}❌ DELETE $API_ENDPOINT - Failed ($http_status)${NC}"
            echo "$body"
        fi
    else
        echo -e "${YELLOW}⚠️ Skipping delete test - no role ID available${NC}"
    fi
}

test_validation() {
    echo -e "\n${BLUE}🔍 Test 5: Validation tests${NC}"
    
    # Test empty name
    echo "Testing empty name validation..."
    invalid_data='{"name": "", "description": "Test"}'
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$invalid_data" \
        "$API_ENDPOINT")
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$http_status" = "400" ]; then
        echo -e "${GREEN}✅ Empty name validation - Success (400)${NC}"
    else
        echo -e "${RED}❌ Empty name validation - Failed ($http_status)${NC}"
    fi
}

test_search() {
    echo -e "\n${BLUE}🔍 Test 6: Search functionality${NC}"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$API_ENDPOINT?search=admin&limit=3&page=1")
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ GET $API_ENDPOINT?search=admin - Success (200)${NC}"
        role_count=$(echo "$body" | jq '.data.roles | length' 2>/dev/null || echo "0")
        echo "Search results: $role_count roles"
    else
        echo -e "${RED}❌ GET $API_ENDPOINT?search=admin - Failed ($http_status)${NC}"
        echo "$body"
    fi
}

# Main test execution
main() {
    echo "Waiting for server to be ready..."
    sleep 2
    
    test_get_roles
    test_create_role
    test_update_role
    test_validation
    test_search
    test_delete_role
    
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}🏁 Enhanced Simple Roles API Testing Complete!${NC}"
    echo -e "${BLUE}======================================${NC}"
}

# Run main function
main
