#!/bin/bash

# 🔐 Tazav1 Auto-Generated Security Configuration
# Generated on: $(date '+%Y-%m-%d %H:%M:%S %z')

echo "=== Tazav1 Cloud Server Configuration ==="

# Default values
DEFAULT_IP="localhost"
DEFAULT_SITE_PORT="3800"
DEFAULT_API_PORT="3801"
DEFAULT_POSTGRES_PORT="5444"
DEFAULT_REDIS_PORT="6444"
DEFAULT_MINIO_PORT="9440"
DEFAULT_MINIO_CONSOLE_PORT="9441"
DEFAULT_PGADMIN_PORT="5445"

# Check if .env.prod exists and load values
if [ -f ".env.prod" ]; then
    echo "Found .env.prod file, loading existing configuration..."
    source .env.prod
    echo "Configuration loaded from .env.prod"
else
    echo "No .env.prod file found, using interactive mode..."
fi

echo "Please enter your server configuration (press Enter to keep existing values):"

# Get server IP (use existing IP_ADDRESS if available, otherwise use default)
CURRENT_IP=${IP_ADDRESS:-$DEFAULT_IP}
read -p "Enter server IP address (current: $CURRENT_IP): " SERVER_IP
SERVER_IP=${SERVER_IP:-$CURRENT_IP}

# Get custom ports or use existing/defaults
echo ""
echo "=== Port Configuration ==="
CURRENT_SITE_PORT=${SITE_PORT:-$DEFAULT_SITE_PORT}
read -p "Enter site port (current: $CURRENT_SITE_PORT): " SITE_PORT
SITE_PORT=${SITE_PORT:-$CURRENT_SITE_PORT}

CURRENT_API_PORT=${API_PORT:-$DEFAULT_API_PORT}
read -p "Enter API port (current: $CURRENT_API_PORT): " API_PORT
API_PORT=${API_PORT:-$CURRENT_API_PORT}

CURRENT_POSTGRES_PORT=${POSTGRES_PORT:-$DEFAULT_POSTGRES_PORT}
read -p "Enter PostgreSQL port (current: $CURRENT_POSTGRES_PORT): " POSTGRES_PORT
POSTGRES_PORT=${POSTGRES_PORT:-$CURRENT_POSTGRES_PORT}

CURRENT_REDIS_PORT=${REDIS_PORT:-$DEFAULT_REDIS_PORT}
read -p "Enter Redis port (current: $CURRENT_REDIS_PORT): " REDIS_PORT
REDIS_PORT=${REDIS_PORT:-$CURRENT_REDIS_PORT}

CURRENT_MINIO_PORT=${MINIO_PORT:-$DEFAULT_MINIO_PORT}
read -p "Enter MinIO port (current: $CURRENT_MINIO_PORT): " MINIO_PORT
MINIO_PORT=${MINIO_PORT:-$CURRENT_MINIO_PORT}

CURRENT_MINIO_CONSOLE_PORT=${MINIO_CONSOLE_PORT:-$DEFAULT_MINIO_CONSOLE_PORT}
read -p "Enter MinIO console port (current: $CURRENT_MINIO_CONSOLE_PORT): " MINIO_CONSOLE_PORT
MINIO_CONSOLE_PORT=${MINIO_CONSOLE_PORT:-$CURRENT_MINIO_CONSOLE_PORT}

CURRENT_PGADMIN_PORT=${PGADMIN_PORT:-$DEFAULT_PGADMIN_PORT}
read -p "Enter PgAdmin port (current: $CURRENT_PGADMIN_PORT): " PGADMIN_PORT
PGADMIN_PORT=${PGADMIN_PORT:-$CURRENT_PGADMIN_PORT}

echo ""
echo "=== Configuring UFW Firewall ==="
echo "Opening required ports..."

ssh root@$SERVER_IP "ufw status" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "UFW is not installed or not running on the server. Installing UFW..."
    ssh root@$SERVER_IP "apt-get update && apt-get install -y ufw"
    if [ $? -ne 0 ]; then
        echo "Failed to install UFW. Please check your server connection and try again."
        exit 1
    fi
    echo "UFW installed successfully."
else
    echo "UFW is already installed and running."
fi
# Allow the configured application ports
ssh root@$SERVER_IP "ufw allow $SITE_PORT/tcp"
echo "✓ Site port $SITE_PORT allowed"

ssh root@$SERVER_IP "ufw allow $API_PORT/tcp"
echo "✓ API port $API_PORT allowed"

ssh root@$SERVER_IP "ufw allow $POSTGRES_PORT/tcp"
echo "✓ PostgreSQL port $POSTGRES_PORT allowed"

ssh root@$SERVER_IP "ufw allow $REDIS_PORT/tcp"
echo "✓ Redis port $REDIS_PORT allowed"

ssh root@$SERVER_IP "ufw allow $MINIO_PORT/tcp"
echo "✓ MinIO port $MINIO_PORT allowed"

ssh root@$SERVER_IP "ufw allow $MINIO_CONSOLE_PORT/tcp"
echo "✓ MinIO console port $MINIO_CONSOLE_PORT allowed"

ssh root@$SERVER_IP "ufw allow $PGADMIN_PORT/tcp"
echo "✓ PgAdmin port $PGADMIN_PORT allowed"

# Enable UFW if not already enabled
ssh root@$SERVER_IP "ufw --force enable"
echo "✓ UFW firewall enabled"

echo ""
echo "Configuration file '.env.prod' has been generated successfully!"
echo "Server IP: $SERVER_IP"
echo "Ports configured:"
echo "  - Site: $SITE_PORT"
echo "  - API: $API_PORT"
echo "  - PostgreSQL: $POSTGRES_PORT"
echo "  - Redis: $REDIS_PORT"
echo "  - MinIO: $MINIO_PORT"
echo "  - MinIO Console: $MINIO_CONSOLE_PORT"
echo "  - PgAdmin: $PGADMIN_PORT"
