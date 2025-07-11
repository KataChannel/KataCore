#!/bin/bash

# Script to copy entire project to another folder, excluding node_modules and .git directories

# Get destination folder from user input if not provided as argument
if [ $# -eq 0 ]; then
    read -p "Enter destination folder: " DESTINATION
    if [ -z "$DESTINATION" ]; then
        echo "Error: Destination folder cannot be empty"
        exit 1
    fi
else
    DESTINATION="$1"
fi

SOURCE_DIR="$(dirname "$(readlink -f "$0")")"

# Create destination directory if it doesn't exist
mkdir -p "$DESTINATION"

echo "Copying project from $SOURCE_DIR to $DESTINATION"
echo "Excluding node_modules and .git directories..."

# Copy all files and folders except node_modules and .git
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --exclude='**/node_modules' \
    --exclude='.git' \
    --exclude='*/.git' \
    --exclude='**/.git' \
    "$SOURCE_DIR/" "$DESTINATION/"

echo "Copy completed successfully!"
echo "Project copied to: $DESTINATION"