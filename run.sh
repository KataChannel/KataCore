#!/bin/bash

# Enhanced run.sh script with better error handling and validation
# Version: 2.0

set -euo pipefail  # Enable strict error handling

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() { echo -e "${CYAN}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Show banner
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         🚀 TazaCore Script Runner        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo
echo -e "${BLUE}Chọn file để chạy từ thư mục sh/:${NC}"
echo

# Kiểm tra xem thư mục sh/ có tồn tại không
if [ ! -d "sh" ]; then
    error "Thư mục sh/ không tồn tại!"
fi

# Liệt kê các file .sh trong thư mục sh/ với improved glob handling
files=()
shopt -s nullglob  # Enable nullglob to handle empty matches
for file in sh/*.sh; do
    if [ -f "$file" ]; then
        files+=("$file")
    fi
done
shopt -u nullglob  # Disable nullglob

# Kiểm tra xem có file .sh nào không
if [ ${#files[@]} -eq 0 ]; then
    error "Không có file .sh nào trong thư mục sh/!"
fi

log "Tìm thấy ${#files[@]} script trong thư mục sh/"

# Hiển thị danh sách file với enhanced formatting
for i in "${!files[@]}"; do
    filename=$(basename "${files[$i]}")
    # Check if file is executable
    if [ -x "${files[$i]}" ]; then
        echo -e "${GREEN}$((i+1)).${NC} ${BLUE}$filename${NC} ${GREEN}[executable]${NC}"
    else
        echo -e "${GREEN}$((i+1)).${NC} ${YELLOW}$filename${NC} ${YELLOW}[not executable]${NC}"
    fi
done

echo
echo -e "${CYAN}q. Thoát${NC}"
echo

# Input validation loop
while true; do
    read -p "$(echo -e "${BLUE}Nhập số thứ tự file muốn chạy (hoặc 'q' để thoát): ${NC}")" choice
    
    # Handle quit option
    if [[ "$choice" == "q" || "$choice" == "Q" ]]; then
        log "Thoát chương trình"
        exit 0
    fi
    
    # Handle empty input
    if [[ -z "$choice" ]]; then
        warning "Vui lòng nhập một số hoặc 'q' để thoát"
        continue
    fi
    
    # Validate numeric input
    if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
        warning "Vui lòng nhập một số hợp lệ!"
        continue
    fi
    
    # Validate range
    if [ "$choice" -lt 1 ] || [ "$choice" -gt ${#files[@]} ]; then
        warning "Lựa chọn phải từ 1 đến ${#files[@]}!"
        continue
    fi
    
    # Valid choice, break the loop
    break
done

# Get selected file
selected_file="${files[$((choice-1))]}"
filename=$(basename "$selected_file")

# Verify file exists and is readable
if [ ! -f "$selected_file" ]; then
    error "File không tồn tại: $selected_file"
fi

if [ ! -r "$selected_file" ]; then
    error "Không có quyền đọc file: $selected_file"
fi

# Make file executable if it's not
if [ ! -x "$selected_file" ]; then
    warning "File chưa có quyền thực thi, đang cấp quyền..."
    chmod +x "$selected_file" || error "Không thể cấp quyền thực thi cho file!"
    success "Đã cấp quyền thực thi cho file"
fi

echo
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
success "Đang chạy: $filename"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo

# Execute the script with error handling
if ! bash "$selected_file"; then
    echo
    echo -e "${RED}═══════════════════════════════════════════${NC}"
    error "Script thực thi thất bại với mã lỗi: $?"
fi

echo
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
success "Script hoàn thành thành công!"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"