#!/bin/bash

echo "Kiểm tra kết nối SSH tới server..."
ssh -o ConnectTimeout=10 root@116.118.49.243 'echo "Kết nối SSH thành công!"'

if [ $? -eq 0 ]; then
    echo "✅ Server có thể kết nối được"
    echo "Kiểm tra nginx trên server..."
    ssh root@116.118.49.243 'systemctl status nginx --no-pager || echo "Nginx chưa được cài đặt"'
else
    echo "❌ Không thể kết nối tới server!"
    echo "Vui lòng kiểm tra:"
    echo "1. Địa chỉ IP server: 116.118.49.243"
    echo "2. SSH key hoặc password"
    echo "3. Kết nối mạng"
fi
