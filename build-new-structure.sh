#!/bin/bash

echo "🚀 Building and deploying new structure..."

# Build the project
echo "📦 Building project..."
docker compose build --no-cache site

# Start services
echo "🔄 Starting services..."
docker compose up -d

# Monitor logs
echo "📄 Monitoring logs..."
docker compose logs -f site
