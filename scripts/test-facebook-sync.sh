#!/bin/bash

# Start server in background
echo "🚀 Starting development server..."
PORT=3005 bun --bun next dev &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

echo "🧪 Testing sync endpoints..."

# Test sync-posts
echo "1️⃣ Testing sync-posts..."
curl -X POST http://localhost:3005/api/admin/social/facebook/database \
  -H "Content-Type: application/json" \
  -d '{"action":"sync-posts","data":{"pageId":"1570712083254440"}}' \
  --max-time 30 \
  --silent \
  | jq '.' || echo "❌ sync-posts failed"

echo ""

# Test sync-messages  
echo "2️⃣ Testing sync-messages..."
curl -X POST http://localhost:3005/api/admin/social/facebook/database \
  -H "Content-Type: application/json" \
  -d '{"action":"sync-messages","data":{"pageId":"1570712083254440"}}' \
  --max-time 30 \
  --silent \
  | jq '.' || echo "❌ sync-messages failed"

echo ""

# Cleanup
echo "🧹 Stopping server..."
kill $SERVER_PID 2>/dev/null

echo "✅ Test completed!"
