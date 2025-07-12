#!/bin/bash

# Deployment Verification Script
echo "🔍 Verifying deployment..."

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running"
else
    echo "❌ Some containers are not running"
    docker-compose ps
fi

# Check API health
echo "🔍 Checking API health..."
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "⚠️ API health check failed, trying basic connection..."
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        echo "✅ API is responding (no health endpoint)"
    else
        echo "❌ API is not responding"
    fi
fi

# Check Site health
echo "🔍 Checking Site health..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Site is responding"
else
    echo "❌ Site is not responding"
fi

# Check database connection
echo "🔍 Checking database connection..."
if docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-tazacore} >/dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
fi

echo "🎉 Deployment verification completed"
