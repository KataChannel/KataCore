#!/bin/bash

# Script to backup data from Docker Compose services on cloud server and save to current local machine
# Ensure this script has executable permissions: chmod +x backup.sh

# Exit on any error
set -e

# Function to prompt for input with default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"${input:-$default}\""
    else
        read -p "$prompt: " input
        while [ -z "$input" ]; do
            read -p "$prompt (required): " input
        done
        eval "$var_name=\"$input\""
    fi
}

# Function to prompt for password with default from environment
prompt_password() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [press enter to use default]: " -s input
        echo
        if [ -z "$input" ]; then
            eval "$var_name=\"$default\""
        else
            eval "$var_name=\"$input\""
        fi
    else
        read -p "$prompt: " -s input
        echo
        while [ -z "$input" ]; do
            read -p "$prompt (required): " -s input
            echo
        done
        eval "$var_name=\"$input\""
    fi
}

# Function to cleanup remote files
cleanup_remote() {
    local remote_file="$1"
    local remote_dir="$2"
    echo "Cleaning up remote backup files..."
    ssh $SSH_OPTIONS "${REMOTE_SERVER}" << EOF
        # Remove compressed backup file
        if [ -f "${remote_file}" ]; then
            rm -f "${remote_file}"
            echo "Removed: ${remote_file}"
        fi
        
        # Remove any leftover uncompressed backup directory
        if [ -d "${remote_dir}" ]; then
            rm -rf "${remote_dir}"
            echo "Removed directory: ${remote_dir}"
        fi
        
        # Remove any temporary files
        rm -f "/tmp/.env.backup"
        
        # Clean up old backups (older than retention period)
        echo "Cleaning up old remote backups (older than ${REMOTE_RETENTION_DAYS} days)..."
        find "${REMOTE_BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +${REMOTE_RETENTION_DAYS} -delete 2>/dev/null || true
        
        # Show remaining disk space after cleanup
        echo "Remaining disk space on remote server:"
        df -h "${REMOTE_BACKUP_DIR}"
EOF
}

# Source environment variables from .env.prod file
ENV_FILE=""
if [ -f .env.prod ]; then
    echo "Loading configuration from .env.prod..."
    source .env.prod
    ENV_FILE=".env.prod"
elif [ -f .env ]; then
    echo "Loading configuration from .env..."
    source .env
    ENV_FILE=".env"
else
    echo "Warning: No .env.prod or .env file found. All values will need to be entered manually."
fi

# Get user inputs with defaults from environment variables
echo
echo "=== Backup Configuration ==="
echo "Press Enter to use default values shown in brackets"
echo

# Remote server configuration
prompt_input "Remote server hostname/IP" "${REMOTE_HOST:-${SERVER_HOST:-${HOST}}}" "REMOTE_HOST"
prompt_input "Remote server username" "${REMOTE_USER:-${SERVER_USER:-${SSH_USER:-root}}}" "REMOTE_USER"
prompt_input "SSH port" "${SSH_PORT:-22}" "SSH_PORT"

# Database configuration
prompt_input "PostgreSQL container name" "${POSTGRES_CONTAINER:-tazav1-postgres}" "POSTGRES_CONTAINER"
prompt_input "PostgreSQL username" "${POSTGRES_USER:-${DB_USER}}" "POSTGRES_USER"
prompt_input "PostgreSQL database name" "${POSTGRES_DB:-${DB_NAME}}" "POSTGRES_DB"

# Redis configuration
prompt_input "Redis container name" "${REDIS_CONTAINER:-tazav1-redis}" "REDIS_CONTAINER"

# MinIO configuration
prompt_input "MinIO container name" "${MINIO_CONTAINER:-tazav1-minio}" "MINIO_CONTAINER"

# API configuration
prompt_input "API container name" "${API_CONTAINER:-tazav1-api}" "API_CONTAINER"

# Backup directory configuration
prompt_input "Local backup directory" "${LOCAL_BACKUP_DIR:-${HOME}/backups}" "LOCAL_BACKUP_DIR"
prompt_input "Remote backup directory" "${REMOTE_BACKUP_DIR:-/tmp/backups}" "REMOTE_BACKUP_DIR"

# Password prompts
echo
echo "=== Password Configuration ==="
prompt_password "Redis password" "REDIS_PASSWORD" "$REDIS_PASSWORD"
prompt_password "PostgreSQL password (if required)" "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"

# Optional configurations
echo
echo "=== Optional Configuration ==="
if command -v gdrive >/dev/null 2>&1; then
    prompt_input "Google Drive folder ID (optional)" "$GDRIVE_FOLDER_ID" "GDRIVE_FOLDER_ID"
fi

# Backup retention settings
prompt_input "Remote backup retention (days)" "${REMOTE_RETENTION_DAYS:-7}" "REMOTE_RETENTION_DAYS"
prompt_input "Local backup retention (days)" "${LOCAL_RETENTION_DAYS:-30}" "LOCAL_RETENTION_DAYS"

# Define backup file paths
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOCAL_BACKUP_FILE="${LOCAL_BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"

# Remote server configuration
REMOTE_SERVER="${REMOTE_USER}@${REMOTE_HOST}"
if [ "$SSH_PORT" != "22" ]; then
    SSH_OPTIONS="-p $SSH_PORT"
else
    SSH_OPTIONS=""
fi

REMOTE_BACKUP_PATH="${REMOTE_BACKUP_DIR}/backup_${TIMESTAMP}"
REMOTE_BACKUP_FILE="${REMOTE_BACKUP_PATH}.tar.gz"

# Create local backup directory if it doesn't exist
mkdir -p "${LOCAL_BACKUP_DIR}"

# Confirm before proceeding
echo
echo "=== Backup Summary ==="
echo "Remote server: $REMOTE_SERVER:$SSH_PORT"
echo "PostgreSQL: $POSTGRES_CONTAINER ($POSTGRES_USER@$POSTGRES_DB)"
echo "Redis: $REDIS_CONTAINER"
echo "MinIO: $MINIO_CONTAINER"
echo "API: $API_CONTAINER"
echo "Local backup directory: $LOCAL_BACKUP_DIR"
echo "Backup file: $LOCAL_BACKUP_FILE"
echo "Remote retention: $REMOTE_RETENTION_DAYS days"
echo "Local retention: $LOCAL_RETENTION_DAYS days"
if [ -n "$ENV_FILE" ]; then
    echo "Environment file: $ENV_FILE (will be included in backup)"
fi
echo

read -p "Proceed with backup? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Backup cancelled."
    exit 0
fi

echo "Starting backup process from cloud server..."

# Check available space on remote server before backup
echo "Checking available space on remote server..."
ssh $SSH_OPTIONS "${REMOTE_SERVER}" "df -h ${REMOTE_BACKUP_DIR}"

# Transfer environment file to remote server if it exists
if [ -n "$ENV_FILE" ]; then
    echo "Transferring environment file to remote server..."
    scp $SSH_OPTIONS "$ENV_FILE" "${REMOTE_SERVER}:/tmp/.env.backup"
fi

# Execute backup commands on remote server
ssh $SSH_OPTIONS "${REMOTE_SERVER}" << EOF
    set -e
    
    # Create remote backup directory
    mkdir -p "${REMOTE_BACKUP_PATH}"
    
    # Backup environment file
    if [ -f "/tmp/.env.backup" ]; then
        echo "Backing up environment configuration..."
        cp "/tmp/.env.backup" "${REMOTE_BACKUP_PATH}/env_backup_${TIMESTAMP}.env"
        rm -f "/tmp/.env.backup"
    fi
    
    # Backup Docker Compose file if it exists
    echo "Backing up Docker Compose configuration..."
    if [ -f "docker-compose.yml" ]; then
        cp "docker-compose.yml" "${REMOTE_BACKUP_PATH}/docker-compose_${TIMESTAMP}.yml"
    elif [ -f "docker-compose.yaml" ]; then
        cp "docker-compose.yaml" "${REMOTE_BACKUP_PATH}/docker-compose_${TIMESTAMP}.yaml"
    else
        echo "Warning: No docker-compose file found"
    fi
    
    # Backup .env.prod file from remote server if it exists
    if [ -f ".env.prod" ]; then
        cp ".env.prod" "${REMOTE_BACKUP_PATH}/env_prod_remote_${TIMESTAMP}.env"
    fi
    
    # Backup .env file from remote server if it exists
    if [ -f ".env" ]; then
        cp ".env" "${REMOTE_BACKUP_PATH}/env_remote_${TIMESTAMP}.env"
    fi
    
    # Backup PostgreSQL database
    echo "Backing up PostgreSQL database..."
    if [ -n "${POSTGRES_PASSWORD}" ]; then
        PGPASSWORD="${POSTGRES_PASSWORD}" docker exec "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --no-privileges > "${REMOTE_BACKUP_PATH}/postgres_backup_${TIMESTAMP}.sql"
    else
        docker exec "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --no-privileges > "${REMOTE_BACKUP_PATH}/postgres_backup_${TIMESTAMP}.sql"
    fi
    
    # Backup Redis data
    echo "Backing up Redis data..."
    if [ -n "${REDIS_PASSWORD}" ]; then
        docker exec "${REDIS_CONTAINER}" redis-cli --pass "${REDIS_PASSWORD}" SAVE
    else
        docker exec "${REDIS_CONTAINER}" redis-cli SAVE
    fi
    docker cp "${REDIS_CONTAINER}:/data/dump.rdb" "${REMOTE_BACKUP_PATH}/redis_backup_${TIMESTAMP}.rdb"
    
    # Backup MinIO data
    echo "Backing up MinIO data..."
    docker cp "${MINIO_CONTAINER}:/data" "${REMOTE_BACKUP_PATH}/minio_data"
    
    # Backup API logs
    echo "Backing up API logs..."
    docker cp "${API_CONTAINER}:/app/logs" "${REMOTE_BACKUP_PATH}/api_logs" 2>/dev/null || echo "Warning: API logs not found or not accessible"
    
    # Backup API uploads/files if they exist
    echo "Backing up API uploads..."
    docker cp "${API_CONTAINER}:/app/uploads" "${REMOTE_BACKUP_PATH}/api_uploads" 2>/dev/null || echo "Warning: API uploads not found or not accessible"
    
    # Backup API static files if they exist
    echo "Backing up API static files..."
    docker cp "${API_CONTAINER}:/app/static" "${REMOTE_BACKUP_PATH}/api_static" 2>/dev/null || echo "Warning: API static files not found or not accessible"
    
    # Backup Docker volumes information
    echo "Backing up Docker volumes information..."
    docker volume ls > "${REMOTE_BACKUP_PATH}/docker_volumes_${TIMESTAMP}.txt"
    docker network ls > "${REMOTE_BACKUP_PATH}/docker_networks_${TIMESTAMP}.txt"
    
    # Backup container configurations
    echo "Backing up container configurations..."
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" > "${REMOTE_BACKUP_PATH}/docker_containers_${TIMESTAMP}.txt"
    
    # Backup system information
    echo "Backing up system information..."
    cat > "${REMOTE_BACKUP_PATH}/system_info_${TIMESTAMP}.txt" << EOL
System Information Backup
========================
Date: \$(date)
Hostname: \$(hostname)
OS: \$(cat /etc/os-release 2>/dev/null | head -5 || echo "Unknown")
Docker Version: \$(docker --version 2>/dev/null || echo "Not available")
Docker Compose Version: \$(docker-compose --version 2>/dev/null || echo "Not available")
Disk Usage: 
\$(df -h)

Memory Usage:
\$(free -h)

Running Processes:
\$(ps aux | head -20)
EOL
    
    # Create backup info file with all environment variables
    echo "Creating backup info..."
    cat > "${REMOTE_BACKUP_PATH}/backup_info.txt" << EOL
Backup Date: \$(date)
Backup Timestamp: ${TIMESTAMP}
PostgreSQL Container: ${POSTGRES_CONTAINER}
PostgreSQL Database: ${POSTGRES_DB}
PostgreSQL User: ${POSTGRES_USER}
Redis Container: ${REDIS_CONTAINER}
MinIO Container: ${MINIO_CONTAINER}
API Container: ${API_CONTAINER}
Remote Backup Directory: ${REMOTE_BACKUP_DIR}
Local Backup Directory: ${LOCAL_BACKUP_DIR}
Remote Retention Days: ${REMOTE_RETENTION_DAYS}
Local Retention Days: ${LOCAL_RETENTION_DAYS}

Environment Variables Backed Up:
================================
EOL
    
    # Add all environment variables to backup info
    if [ -f "${REMOTE_BACKUP_PATH}/env_backup_${TIMESTAMP}.env" ]; then
        echo "Local .env.prod content:" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
        cat "${REMOTE_BACKUP_PATH}/env_backup_${TIMESTAMP}.env" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
        echo "" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
    fi
    
    if [ -f "${REMOTE_BACKUP_PATH}/env_prod_remote_${TIMESTAMP}.env" ]; then
        echo "Remote .env.prod content:" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
        cat "${REMOTE_BACKUP_PATH}/env_prod_remote_${TIMESTAMP}.env" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
        echo "" >> "${REMOTE_BACKUP_PATH}/backup_info.txt"
    fi
    
    # Compress backups
    echo "Compressing backups..."
    tar -czf "${REMOTE_BACKUP_FILE}" -C "${REMOTE_BACKUP_DIR}" "backup_${TIMESTAMP}"
    
    # Clean up uncompressed backup files immediately after compression
    rm -rf "${REMOTE_BACKUP_PATH}"
    
    echo "Remote backup completed: ${REMOTE_BACKUP_FILE}"
    echo "Backup file size: \$(du -h "${REMOTE_BACKUP_FILE}" | cut -f1)"
EOF

# Copy backup file from remote server to local machine with error handling
echo "Downloading backup from cloud server to local machine..."
if scp $SSH_OPTIONS "${REMOTE_SERVER}:${REMOTE_BACKUP_FILE}" "${LOCAL_BACKUP_FILE}"; then
    echo "Successfully downloaded backup to: ${LOCAL_BACKUP_FILE}"
    
    # Verify the downloaded file
    if [ -f "${LOCAL_BACKUP_FILE}" ] && [ -s "${LOCAL_BACKUP_FILE}" ]; then
        echo "Backup file verification: SUCCESS"
        
        # Only cleanup remote files after successful download and verification
        cleanup_remote "${REMOTE_BACKUP_FILE}" "${REMOTE_BACKUP_PATH}"
        
        echo "Remote backup file cleaned up successfully"
    else
        echo "ERROR: Downloaded backup file is empty or corrupted!"
        exit 1
    fi
else
    echo "ERROR: Failed to download backup from remote server"
    echo "Remote backup file will be preserved for manual retrieval: ${REMOTE_BACKUP_FILE}"
    exit 1
fi

# Remove old local backups
echo "Cleaning up old local backups (older than ${LOCAL_RETENTION_DAYS} days)..."
find "${LOCAL_BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +${LOCAL_RETENTION_DAYS} -delete 2>/dev/null || true

echo "Backup process completed!"
echo "Backup saved to: ${LOCAL_BACKUP_FILE}"
echo "Backup size: $(du -h "${LOCAL_BACKUP_FILE}" | cut -f1)"

# Display backup contents
echo
echo "=== Backup Contents ==="
echo "The backup includes:"
echo "- PostgreSQL database dump"
echo "- Redis data dump"
echo "- MinIO data"
echo "- API logs, uploads, and static files"
echo "- Environment configuration files (.env.prod)"
echo "- Docker Compose configuration"
echo "- Docker containers, volumes, and networks information"
echo "- System information"
echo "- Complete backup metadata"

# Optional: Upload to Google Drive if configured
if [ -n "${GDRIVE_FOLDER_ID}" ] && command -v gdrive >/dev/null 2>&1; then
    echo "Uploading backup to Google Drive..."
    if gdrive upload --parent "${GDRIVE_FOLDER_ID}" "${LOCAL_BACKUP_FILE}"; then
        echo "Successfully uploaded to Google Drive"
    else
        echo "Warning: Failed to upload to Google Drive"
    fi
fi

echo "Backup process finished at $(date)"
echo "Remote server storage has been optimized by removing temporary backup files"
