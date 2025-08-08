#!/bin/bash

# Set variables
VOLUME_NAME="tazacore-postgres-data"
VOLUME_NAME2="tazacore-minio-data"
TIMESTAMP=$(date +%F-%H-%M-%S)
BACKUP_DIR="/tmp/backups"
S3_BUCKET="my-backup-bucket"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to backup a volume
backup_volume() {
    local volume=$1
    local backup_file="$BACKUP_DIR/${volume}-${TIMESTAMP}.tar.gz"
    
    echo "Backing up volume: $volume"
    docker run --rm \
        -v "$volume:/data:ro" \
        -v "$BACKUP_DIR:/backup" \
        ubuntu:latest \
        bash -c "cd /data && tar czf /backup/$(basename $backup_file) ."
    
    # Upload to S3
    # aws s3 cp "$backup_file" "s3://$S3_BUCKET/$(basename $backup_file)"
    
    # Remove local backup
    # rm -f "$backup_file"
}

# Backup both volumes
backup_volume "$VOLUME_NAME"
backup_volume "$VOLUME_NAME2"

echo "Backup completed successfully!"