#!/bin/bash

# ============================================================================
# ORGANIZE CODEBASE SCRIPT
# ============================================================================
# Organizes files into appropriate directories with timestamp-based numbering
# Author: TazaCore Team
# Created: $(date '+%Y-%m-%d %H:%M:%S')

set -e

echo "🚀 Starting codebase organization..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get file creation time (Unix timestamp)
get_file_timestamp() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        stat -f "%B" "$file" 2>/dev/null || echo "0"
    else
        # Linux
        stat -c "%Y" "$file" 2>/dev/null || echo "0"
    fi
}

# Function to move file with timestamp-based numbering
move_file_with_timestamp() {
    local source_file="$1"
    local target_dir="$2"
    local counter_file="$3"
    
    # Get current counter
    local counter=1
    if [[ -f "$counter_file" ]]; then
        counter=$(cat "$counter_file")
    fi
    
    # Get file timestamp
    local timestamp=$(get_file_timestamp "$source_file")
    local formatted_date=$(date -d "@$timestamp" '+%Y%m%d_%H%M%S' 2>/dev/null || date '+%Y%m%d_%H%M%S')
    
    # Get file extension and base name
    local filename=$(basename "$source_file")
    local extension="${filename##*.}"
    local basename="${filename%.*}"
    
    # Create new filename with counter and timestamp
    local new_filename=$(printf "%03d_%s_%s.%s" "$counter" "$formatted_date" "$basename" "$extension")
    
    # Ensure target directory exists
    mkdir -p "$target_dir"
    
    # Move file
    if mv "$source_file" "$target_dir/$new_filename"; then
        print_success "Moved: $source_file → $target_dir/$new_filename"
        
        # Increment counter
        ((counter++))
        echo "$counter" > "$counter_file"
    else
        print_error "Failed to move: $source_file"
        return 1
    fi
}

# Initialize counters
mkdir -p .counters
echo "1" > .counters/docs_counter
echo "1" > .counters/scripts_counter
echo "1" > .counters/sh_counter

# Create target directories
print_status "Creating target directories..."
mkdir -p docs scripts sh

print_status "Starting file organization..."

# ===========================================================================
# 1. MOVE .md FILES TO docs/ (EXCEPT README.md)
# ===========================================================================
print_status "📄 Moving .md files to docs/ directory..."

# Get all .md files except README.md, sort by timestamp
md_files=()
while IFS= read -r -d '' file; do
    if [[ "$(basename "$file")" != "README.md" ]]; then
        md_files+=("$file")
    fi
done < <(find . -maxdepth 1 -name "*.md" -type f -print0)

# Sort files by timestamp
if [[ ${#md_files[@]} -gt 0 ]]; then
    # Create array with timestamp and filename
    declare -a timestamped_files
    for file in "${md_files[@]}"; do
        timestamp=$(get_file_timestamp "$file")
        timestamped_files+=("$timestamp:$file")
    done
    
    # Sort by timestamp and move files
    IFS=$'\n' sorted_files=($(sort -n <<<"${timestamped_files[*]}"))
    
    for entry in "${sorted_files[@]}"; do
        file="${entry#*:}"
        move_file_with_timestamp "$file" "docs" ".counters/docs_counter"
    done
else
    print_warning "No .md files found (except README.md)"
fi

# ===========================================================================
# 2. MOVE .sh FILES TO sh/ (EXCEPT run.sh AND deploy.sh)
# ===========================================================================
print_status "🔧 Moving .sh files to sh/ directory..."

# Get all .sh files except run.sh and deploy.sh
sh_files=()
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    if [[ "$filename" != "run.sh" && "$filename" != "deploy.sh" ]]; then
        sh_files+=("$file")
    fi
done < <(find . -maxdepth 1 -name "*.sh" -type f -print0)

# Sort and move .sh files
if [[ ${#sh_files[@]} -gt 0 ]]; then
    declare -a timestamped_sh_files
    for file in "${sh_files[@]}"; do
        timestamp=$(get_file_timestamp "$file")
        timestamped_sh_files+=("$timestamp:$file")
    done
    
    IFS=$'\n' sorted_sh_files=($(sort -n <<<"${timestamped_sh_files[*]}"))
    
    for entry in "${sorted_sh_files[@]}"; do
        file="${entry#*:}"
        move_file_with_timestamp "$file" "sh" ".counters/sh_counter"
    done
else
    print_warning "No .sh files found (except run.sh and deploy.sh)"
fi

# ===========================================================================
# 3. MOVE .js, .ts, .cjs FILES TO scripts/
# ===========================================================================
print_status "📜 Moving .js, .ts, .cjs files to scripts/ directory..."

# Get all .js, .ts, .cjs files in root directory
script_files=()
while IFS= read -r -d '' file; do
    script_files+=("$file")
done < <(find . -maxdepth 1 \( -name "*.js" -o -name "*.ts" -o -name "*.cjs" \) -type f -print0)

# Sort and move script files
if [[ ${#script_files[@]} -gt 0 ]]; then
    declare -a timestamped_script_files
    for file in "${script_files[@]}"; do
        timestamp=$(get_file_timestamp "$file")
        timestamped_script_files+=("$timestamp:$file")
    done
    
    IFS=$'\n' sorted_script_files=($(sort -n <<<"${timestamped_script_files[*]}"))
    
    for entry in "${sorted_script_files[@]}"; do
        file="${entry#*:}"
        move_file_with_timestamp "$file" "scripts" ".counters/scripts_counter"
    done
else
    print_warning "No .js, .ts, .cjs files found in root directory"
fi

# ===========================================================================
# 4. CLEAN UP AND SUMMARY
# ===========================================================================
print_status "🧹 Cleaning up..."

# Remove counter files
rm -rf .counters

# Create organization summary
print_success "✅ Codebase organization completed!"
echo ""
echo "📊 ORGANIZATION SUMMARY:"
echo "========================"

if [[ -d "docs" ]]; then
    doc_count=$(find docs -type f | wc -l)
    echo "📄 Documentation files moved to docs/: $doc_count"
    if [[ $doc_count -gt 0 ]]; then
        echo "   Latest files in docs/:"
        ls -la docs/ | tail -n 5 | sed 's/^/   /'
    fi
fi

if [[ -d "sh" ]]; then
    sh_count=$(find sh -type f | wc -l)
    echo "🔧 Shell scripts moved to sh/: $sh_count"
    if [[ $sh_count -gt 0 ]]; then
        echo "   Latest files in sh/:"
        ls -la sh/ | tail -n 5 | sed 's/^/   /'
    fi
fi

if [[ -d "scripts" ]]; then
    script_count=$(find scripts -type f | wc -l)
    echo "📜 Script files moved to scripts/: $script_count"
    if [[ $script_count -gt 0 ]]; then
        echo "   Latest files in scripts/:"
        ls -la scripts/ | tail -n 5 | sed 's/^/   /'
    fi
fi

echo ""
echo "🎯 Files kept in root directory:"
echo "   - README.md (documentation)"
echo "   - run.sh (execution script)"
echo "   - deploy.sh (deployment script)"
echo ""

print_success "🎉 Codebase organization completed successfully!"

# ===========================================================================
# 5. OPTIONAL: CREATE RESTORE SCRIPT
# ===========================================================================
print_status "📝 Creating restore script for emergency rollback..."

cat > restore-organization.sh << 'EOF'
#!/bin/bash

# Emergency restore script
# This script can restore the original file organization if needed

echo "⚠️  WARNING: This will restore files to their original locations"
echo "This may overwrite existing files!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

echo "🔄 Restoring file organization..."

# Move files back from organized directories
if [[ -d "docs" ]]; then
    find docs -type f -name "*.md" -exec mv {} . \;
    echo "📄 Moved .md files back to root"
fi

if [[ -d "sh" ]]; then
    find sh -type f -name "*.sh" -exec mv {} . \;
    echo "🔧 Moved .sh files back to root"
fi

if [[ -d "scripts" ]]; then
    find scripts -type f \( -name "*.js" -o -name "*.ts" -o -name "*.cjs" \) -exec mv {} . \;
    echo "📜 Moved script files back to root"
fi

echo "✅ File organization restored!"
EOF

chmod +x restore-organization.sh
print_success "📝 Created restore-organization.sh for emergency rollback"

echo ""
echo "🔗 USAGE:"
echo "==========="
echo "• To organize files: ./organize-codebase.sh"
echo "• To restore files:  ./restore-organization.sh"
echo ""
print_success "🎯 Organization script completed!"
