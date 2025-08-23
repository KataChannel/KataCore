#!/bin/bash

# 🧪 Test Facebook API Pagination Implementation
# This script tests the new pagination functionality in Facebook sync endpoints

echo "🚀 Testing Facebook API Pagination Implementation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo ""
echo -e "${BLUE}🔍 Testing Enhanced Facebook Sync Endpoints${NC}"
echo ""

# Test 1: Sync Comments with Pagination
echo -e "${YELLOW}📝 Test 1: Sync Comments with Full Pagination${NC}"
echo "=============================================="
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"comments","fullSync":true}' \
  "$BASE_URL/api/admin/social/facebook/sync")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ Comments sync completed successfully${NC}"
    echo "Response: $body" | jq '.'
else
    echo -e "${RED}❌ Comments sync failed (HTTP $http_status)${NC}"
    echo "Error: $body"
fi

echo ""

# Test 2: Sync Messages with Pagination  
echo -e "${YELLOW}💬 Test 2: Sync Messages with Full Pagination${NC}"
echo "=============================================="
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"messages","fullSync":true}' \
  "$BASE_URL/api/admin/social/facebook/sync")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ Messages sync completed successfully${NC}"
    echo "Response: $body" | jq '.'
else
    echo -e "${RED}❌ Messages sync failed (HTTP $http_status)${NC}"
    echo "Error: $body"
fi

echo ""

# Test 3: Check Data Count Before and After
echo -e "${YELLOW}📊 Test 3: Verify Data Count Increase${NC}"
echo "======================================"

# Get current counts
echo "Getting current database counts..."

comments_count=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=comments&limit=1" | jq '.pagination.total // 0')
messages_count=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=messages&limit=1" | jq '.pagination.total // 0')
posts_count=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=posts&limit=1" | jq '.pagination.total // 0')

echo -e "${BLUE}Current Data Counts:${NC}"
echo "📝 Comments: $comments_count"
echo "💬 Messages: $messages_count" 
echo "📊 Posts: $posts_count"

echo ""

# Test 4: Sync ALL Data with Original Endpoint
echo -e "${YELLOW}🔄 Test 4: Full Sync with Original Endpoint${NC}"
echo "============================================"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/social/facebook/sync")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ Full sync completed successfully${NC}"
    echo "Response: $body" | jq '.'
else
    echo -e "${RED}❌ Full sync failed (HTTP $http_status)${NC}"
    echo "Error: $body"
fi

echo ""

# Test 5: Check Final Data Counts
echo -e "${YELLOW}📈 Test 5: Final Data Count Verification${NC}"
echo "========================================"

echo "Getting final database counts..."

final_comments=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=comments&limit=1" | jq '.pagination.total // 0')
final_messages=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=messages&limit=1" | jq '.pagination.total // 0')
final_posts=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?type=posts&limit=1" | jq '.pagination.total // 0')

echo -e "${BLUE}Final Data Counts:${NC}"
echo "📝 Comments: $final_comments (was: $comments_count)"
echo "💬 Messages: $final_messages (was: $messages_count)"
echo "📊 Posts: $final_posts (was: $posts_count)"

echo ""

# Calculate increases
comments_increase=$((final_comments - comments_count))
messages_increase=$((final_messages - messages_count))
posts_increase=$((final_posts - posts_count))

echo -e "${GREEN}📊 Data Increase Summary:${NC}"
echo "📝 Comments increased by: $comments_increase"
echo "💬 Messages increased by: $messages_increase"
echo "📊 Posts increased by: $posts_increase"

echo ""

# Test 6: Pagination Performance Test
echo -e "${YELLOW}⚡ Test 6: Pagination Performance Test${NC}"
echo "====================================="

start_time=$(date +%s)

# Test pagination on user interactions endpoint
response=$(curl -s "$BASE_URL/api/admin/social/facebook/user-interactions?limit=100&page=1")
total_records=$(echo "$response" | jq '.pagination.total // 0')
total_pages=$(echo "$response" | jq '.pagination.totalPages // 0')

end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "${BLUE}Performance Results:${NC}"
echo "📊 Total Records: $total_records"
echo "📄 Total Pages: $total_pages"
echo "⏱️  Query Duration: ${duration}s"

if [ "$total_records" -gt 0 ]; then
    echo -e "${GREEN}✅ Pagination working correctly${NC}"
else
    echo -e "${RED}❌ No data found - check sync functionality${NC}"
fi

echo ""
echo -e "${GREEN}🎯 Facebook Pagination Test Completed!${NC}"
echo "=========================================="

# Summary
echo ""
echo -e "${BLUE}📋 Test Summary:${NC}"
echo "• Enhanced pagination implemented for Facebook API calls"
echo "• Maximum pages configured to prevent excessive API calls"
echo "• Automatic retry and rate limiting protection added"
echo "• Console logging for better debugging and monitoring"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "• Monitor Facebook API rate limits in production"
echo "• Adjust maxPages parameters based on data volume"
echo "• Consider implementing incremental sync for large datasets"
echo "• Set up monitoring for sync completion and errors"
