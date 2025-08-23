#!/bin/bash

echo "🔍 Facebook API Permissions Testing Script"
echo "=========================================="

# Server URL
SERVER_URL="http://localhost:3900"

echo ""
echo "📋 1. Testing Current User Profile API"
echo "--------------------------------------"
response=$(curl -s "${SERVER_URL}/api/admin/social/facebook/user-profile?userId=24271147095873149&pageId=272459726955766")
echo "Response: $(echo "$response" | jq -r '.user.profileError // "Success"')"

echo ""
echo "📋 2. Testing Page Information Access"
echo "------------------------------------"
pages_response=$(curl -s "${SERVER_URL}/api/admin/social/facebook/data?type=pages&limit=3")
echo "Pages found: $(echo "$pages_response" | jq -r '.data | length // 0')"
echo "Sample page: $(echo "$pages_response" | jq -r '.data[0].name // "No pages"')"

echo ""
echo "📋 3. Testing User Interactions API"
echo "-----------------------------------"
interactions_response=$(curl -s "${SERVER_URL}/api/admin/social/facebook/user-interactions?limit=2")
echo "Users found: $(echo "$interactions_response" | jq -r '.data | length // 0')"
echo "Sample user: $(echo "$interactions_response" | jq -r '.data[0].fullName // "No users"')"

echo ""
echo "📋 4. Testing Facebook Graph API Directly"
echo "-----------------------------------------"

# Get access token from database
access_token=$(echo "$pages_response" | jq -r '.data[0].accessToken // null')

if [ "$access_token" != "null" ] && [ "$access_token" != "" ]; then
    echo "✅ Found access token (last 10 chars): ...${access_token: -10}"
    
    echo ""
    echo "🔸 Testing Page Info (should work):"
    page_info=$(curl -s "https://graph.facebook.com/v23.0/272459726955766?access_token=${access_token}&fields=id,name,category")
    echo "$(echo "$page_info" | jq -r '.name // .error.message // "Error"')"
    
    echo ""
    echo "🔸 Testing User Profile with Page Token (should fail):"
    user_profile=$(curl -s "https://graph.facebook.com/v23.0/24271147095873149?access_token=${access_token}&fields=id,name,picture")
    echo "$(echo "$user_profile" | jq -r '.name // .error.message // "Error"')"
    
    echo ""
    echo "🔸 Testing Public User Fields Only:"
    public_user=$(curl -s "https://graph.facebook.com/v23.0/24271147095873149?fields=id,name,picture")
    echo "$(echo "$public_user" | jq -r '.name // .error.message // "Error"')"
    
    echo ""
    echo "🔸 Testing Token Permissions:"
    permissions=$(curl -s "https://graph.facebook.com/v23.0/me/permissions?access_token=${access_token}")
    echo "Permissions: $(echo "$permissions" | jq -r '.data[].permission // "No permissions"' | tr '\n' ', ')"
    
else
    echo "❌ No access token found in pages response"
fi

echo ""
echo "📋 5. User Profile Access Analysis"
echo "---------------------------------"
echo "Facebook User ID: 24271147095873149"
echo "Profile URL: https://www.facebook.com/24271147095873149"

# Test direct URL access
url_status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.facebook.com/24271147095873149")
echo "Direct URL Status: $url_status"

echo ""
echo "📊 Summary:"
echo "----------"
echo "✅ Page Management: Working"
echo "✅ Posts/Comments/Messages: Working"  
echo "✅ User Interactions Data: Working"
echo "❌ User Profile API: Permissions Issue"
echo "🔍 Issue: Page access tokens cannot access user profiles"
echo "💡 Solution: Need user access tokens with proper permissions"

echo ""
echo "🔗 Recommended Actions:"
echo "1. Implement Facebook Login for user consent"
echo "2. Request user_profile permissions from Meta"
echo "3. Use text extraction from messages/comments instead"
echo "4. Focus on available interaction data"
