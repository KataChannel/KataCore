#!/bin/bash

echo "Chọn file để chạy từ thư mục sh/:"
echo

# Kiểm tra xem thư mục sh/ có tồn tại không
if [ ! -d "sh" ]; then
    echo "Thư mục sh/ không tồn tại!"
    exit 1
fi

# Liệt kê các file .sh trong thư mục sh/
files=(sh/*.sh)
if [ ${#files[@]} -eq 0 ]; then
    echo "Không có file .sh nào trong thư mục sh/!"
    exit 1
fi

# Hiển thị danh sách file
for i in "${!files[@]}"; do
    filename=$(basename "${files[$i]}")
    echo "$((i+1)). $filename"
done

echo
read -p "Nhập số thứ tự file muốn chạy: " choice

# Kiểm tra input hợp lệ
if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#files[@]} ]; then
    echo "Lựa chọn không hợp lệ!"
    exit 1
fi

# Chạy file được chọn
selected_file="${files[$((choice-1))]}"
echo "Đang chạy: $selected_file"
echo "----------------------------------------"
bash "$selected_file"