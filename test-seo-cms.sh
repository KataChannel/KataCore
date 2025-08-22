#!/bin/bash

echo "🧪 Testing SEO CMS APIs in TazaGroup"
echo "===================================="

BASE_URL="http://localhost:3900"

echo ""
echo "1. Testing Analytics API..."
curl -s "${BASE_URL}/api/analytics/cms?period=6m" | jq '.success'

echo ""
echo "2. Testing Search API..."
curl -s "${BASE_URL}/api/search/posts?q=test" | jq '.success'

echo ""
echo "3. Testing Categories API..."
curl -s "${BASE_URL}/api/cms/categories" | jq '.success'

echo ""
echo "4. Testing Tags API..."
curl -s "${BASE_URL}/api/cms/tags" | jq '.success'

echo ""
echo "5. Testing Posts API..."
curl -s "${BASE_URL}/api/cms/posts" | jq '.success'

echo ""
echo "6. Testing SEO Analysis API..."
curl -s "${BASE_URL}/api/seo/analyze?postId=test-id" | jq '.error // .success'

echo ""
echo "✅ API Test completed!"
echo ""
echo "📝 To test the UI, visit:"
echo "   - Dashboard: ${BASE_URL}/admin/seo"
echo "   - Posts: ${BASE_URL}/admin/seo/posts"
echo "   - Categories: ${BASE_URL}/admin/seo/categories"
echo "   - Tags: ${BASE_URL}/admin/seo/tags"
