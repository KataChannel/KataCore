#!/bin/bash

# Script to organize .sh files from root to scripts/ directory
# Numbered sequentially based on creation time (oldest first)
# Files in sh/ directory remain unchanged

echo "=== Organizing .sh files from root to scripts/ directory ==="

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Get list of .sh files in root directory, sorted by modification time (oldest first)
# Exclude organization scripts
echo "Finding .sh files in root directory..."

# Use find to get files with timestamps, then sort
temp_file="/tmp/sh_files_with_time_$$.txt"
find . -maxdepth 1 -name "*.sh" -not -name "organize_*.sh" -printf "%T@ %f\n" | sort -n > "$temp_file"

# Check if any .sh files exist
if [ ! -s "$temp_file" ]; then
    echo "No .sh files found in root directory."
    rm -f "$temp_file"
    exit 0
fi

echo "Found the following .sh files (in chronological order - oldest first):"
cut -d' ' -f2- "$temp_file"

# Initialize counter
counter=1

# Process each file
while read -r timestamp filename; do
    if [[ -f "$filename" ]]; then
        # Extract base name without .sh extension
        base_name=$(basename "$filename" .sh)
        
        # Create new numbered name
        new_name=$(printf "%02d_%s.sh" $counter "$base_name")
        
        echo "[$counter] Moving: $filename -> scripts/$new_name"
        
        # Move file to scripts directory with new name
        mv "$filename" "scripts/$new_name"
        
        # Increment counter
        counter=$((counter + 1))
    fi
done < "$temp_file"

# Clean up temporary file
rm -f "$temp_file"

echo ""
echo "=== Organization complete! ==="
echo "Moved $(($counter - 1)) shell scripts to scripts/ directory"
echo ""
echo "Current contents of scripts/ directory:"
ls -la scripts/ | grep -E '\.(sh)$' || echo "No .sh files in scripts directory"

echo ""
echo "Files in sh/ directory remain unchanged:"
if [ -d "sh" ]; then
    echo "sh/ directory contents:"
    ls -la sh/
else
    echo "sh/ directory not found"
fi

echo ""
echo "Remaining .sh files in root (should only be organization scripts):"
ls -la *.sh 2>/dev/null || echo "No .sh files remaining in root"
