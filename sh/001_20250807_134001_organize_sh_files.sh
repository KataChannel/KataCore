#!/bin/bash

# Script to organize .sh files from root to scripts/ directory
# Numbered sequentially based on creation time (oldest first)

echo "Organizing .sh files from root to scripts/ directory..."

# Change to the correct directory
cd /chikiet/kataoffical/tazagroup

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Get list of .sh files in root directory, sorted by modification time (oldest first)
# Exclude this organization script itself
echo "Finding .sh files in root directory..."

# Create temporary file list sorted by modification time (oldest first)
ls -1tr *.sh 2>/dev/null | grep -v "organize_sh_files.sh" | grep -v "organize_files.sh" > /tmp/sh_files_list.txt

# Check if any .sh files exist
if [ ! -s /tmp/sh_files_list.txt ]; then
    echo "No .sh files found in root directory."
    rm -f /tmp/sh_files_list.txt
    exit 0
fi

echo "Found the following .sh files (in chronological order):"
cat /tmp/sh_files_list.txt

# Initialize counter
counter=1

# Process each file
while IFS= read -r file; do
    if [[ -f "$file" ]]; then
        # Extract base name without .sh extension
        base_name=$(basename "$file" .sh)
        
        # Create new numbered name
        new_name=$(printf "%02d_%s.sh" $counter "$base_name")
        
        echo "Moving: $file -> scripts/$new_name"
        
        # Move file to scripts directory with new name
        mv "$file" "scripts/$new_name"
        
        # Increment counter
        counter=$((counter + 1))
    fi
done < /tmp/sh_files_list.txt

# Clean up temporary file
rm -f /tmp/sh_files_list.txt

echo ""
echo "Organization complete!"
echo "Moved $(($counter - 1)) shell scripts to scripts/ directory"
echo ""
echo "Current contents of scripts/ directory:"
ls -la scripts/

echo ""
echo "Files in sh/ directory remain unchanged:"
ls -la sh/ 2>/dev/null || echo "sh/ directory not found or empty"
