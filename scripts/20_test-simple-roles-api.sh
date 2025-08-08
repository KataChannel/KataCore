#!/bin/bash

echo "🧪 Testing Simple Roles API"
echo "=================================="

BASE_URL="http://localhost:3900/api/admin/roles"

echo ""
echo "📋 Testing GET /api/admin/roles/route-simple (List roles)"
echo "----------------------------------------"
curl -X GET "${BASE_URL}/route-simple" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "📝 Testing POST /api/admin/roles/route-simple (Create role)"
echo "----------------------------------------"
curl -X POST "${BASE_URL}/route-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Role",
    "description": "A test role for the simple API",
    "level": 5,
    "permissions": ["read:dashboard", "read:users"],
    "modules": ["hrm", "analytics"]
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "🔍 Testing GET again to see the created role"
echo "----------------------------------------"
curl -X GET "${BASE_URL}/route-simple" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "✅ Simple Roles API test completed!"
echo "=================================="
