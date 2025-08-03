#!/bin/bash

# Script cải tiến để deploy nginx config cho TazaGroup
# Với xử lý lỗi và logging tốt hơn

set -e  # Exit on any error

SERVER_IP="116.118.49.243"
SERVER_USER="root"
CONFIG_FILE="app.tazagroup.vn"
LOG_FILE="nginx-deploy.log"

# Function để log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function để kiểm tra file
check_config_file() {
    if [ ! -f "./$CONFIG_FILE" ]; then
        log "❌ Lỗi: File $CONFIG_FILE không tồn tại!"
        exit 1
    fi
    log "✅ File cấu hình $CONFIG_FILE đã sẵn sàng"
}

# Function để kiểm tra kết nối SSH
check_ssh_connection() {
    log "🔍 Kiểm tra kết nối SSH tới $SERVER_USER@$SERVER_IP..."
    
    if timeout 10s ssh -o ConnectTimeout=5 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" 'echo "SSH OK"' &>/dev/null; then
        log "✅ Kết nối SSH thành công"
        return 0
    else
        log "❌ Không thể kết nối SSH. Vui lòng kiểm tra:"
        log "   - SSH key hoặc password"
        log "   - Địa chỉ IP: $SERVER_IP"
        log "   - Firewall settings"
        return 1
    fi
}

# Function để copy file
copy_config() {
    log "📋 Đang copy file cấu hình..."
    
    if scp -o ConnectTimeout=10 "./$CONFIG_FILE" "$SERVER_USER@$SERVER_IP:/tmp/"; then
        log "✅ Copy file thành công"
        return 0
    else
        log "❌ Lỗi copy file"
        return 1
    fi
}

# Function để cài đặt nginx
install_nginx() {
    log "🔧 Cài đặt và cấu hình nginx..."
    
    ssh "$SERVER_USER@$SERVER_IP" << 'REMOTE_SCRIPT'
set -e

# Update package list
apt update

# Install nginx if not exists
if ! command -v nginx &> /dev/null; then
    echo "Installing nginx..."
    apt install -y nginx
    systemctl enable nginx
else
    echo "Nginx already installed"
fi

# Create directories if not exist
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Check if config file already exists
if [ -f "/etc/nginx/sites-available/app.tazagroup.vn" ]; then
    echo "⚠️  File cấu hình đã tồn tại tại /etc/nginx/sites-available/app.tazagroup.vn"
    echo "✅ Bỏ qua việc ghi đè file và tiếp tục..."
else
    # Move config file if not exists
    if [ -f "/tmp/app.tazagroup.vn" ]; then
        mv /tmp/app.tazagroup.vn /etc/nginx/sites-available/
        echo "Config file moved successfully"
    else
        echo "Error: Config file not found in /tmp/"
        exit 1
    fi
fi

# Create symbolic link
ln -sf /etc/nginx/sites-available/app.tazagroup.vn /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
if nginx -t; then
    echo "Nginx config is valid"
else
    echo "Nginx config is invalid!"
    exit 1
fi

# Restart nginx
systemctl restart nginx
systemctl status nginx --no-pager

echo "Nginx configuration completed successfully"
REMOTE_SCRIPT

    if [ $? -eq 0 ]; then
        log "✅ Nginx cài đặt và cấu hình thành công"
        return 0
    else
        log "❌ Lỗi cài đặt nginx"
        return 1
    fi
}

# Function để cài đặt SSL cho domain cụ thể
install_ssl_only() {
    local domain="${CONFIG_FILE}"
    log "🔒 Cài đặt SSL certificate cho $domain..."
    
    ssh "$SERVER_USER@$SERVER_IP" << SSL_SCRIPT
set -e

# Check if nginx config exists
if [ ! -f "/etc/nginx/sites-available/$domain" ]; then
    echo "❌ Nginx config cho $domain không tồn tại!"
    exit 1
fi

# Install certbot if not exists
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
else
    echo "Certbot already installed"
fi

# Check if certificate already exists
if certbot certificates 2>/dev/null | grep -q "$domain"; then
    echo "⚠️  SSL certificate cho $domain đã tồn tại"
    read -p "Bạn có muốn renew certificate? (y/n): " -r
    if [[ \$REPLY =~ ^[Yy]$ ]]; then
        certbot renew --cert-name $domain
    fi
else
    # Install SSL certificate
    echo "Installing SSL certificate for $domain..."
    certbot --nginx -d $domain --non-interactive --agree-tos --email it@tazagroup.vn
fi

# Test nginx config after SSL installation
if nginx -t; then
    echo "✅ Nginx config is valid"
    systemctl reload nginx
else
    echo "❌ Nginx config is invalid after SSL installation!"
    exit 1
fi

echo "SSL certificate for $domain installed successfully"
SSL_SCRIPT

    if [ $? -eq 0 ]; then
        log "✅ SSL certificate cài đặt thành công cho $domain"
        return 0
    else
        log "❌ Lỗi cài đặt SSL certificate cho $domain"
        return 1
    fi
}

# Main execution
main() {
    log "🚀 Bắt đầu script cho TazaGroup"
    
    # Menu lựa chọn
    echo "Chọn thao tác:"
    echo "1. Deploy đầy đủ (nginx + config)"
    echo "2. Chỉ cài SSL cho domain hiện tại"
    read -p "Lựa chọn (1/2): " choice
    
    case $choice in
        1)
            # Full deployment
            check_config_file
            if ! check_ssh_connection; then
                log "❌ Deploy thất bại do không thể kết nối SSH"
                exit 1
            fi
            if ! copy_config; then
                log "❌ Deploy thất bại do lỗi copy file"
                exit 1
            fi
            if ! install_nginx; then
                log "❌ Deploy thất bại do lỗi cài đặt nginx"
                exit 1
            fi
            read -p "Bạn có muốn cài đặt SSL certificate? (y/n): " -r
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                install_ssl_only
            fi
            ;;
        2)
            # SSL only
            if ! check_ssh_connection; then
                log "❌ Không thể kết nối SSH"
                exit 1
            fi
            install_ssl_only
            ;;
        *)
            log "❌ Lựa chọn không hợp lệ"
            exit 1
            ;;
    esac
    
    log "🎉 Hoàn tất thành công!"
    log "🌐 Website: https://$CONFIG_FILE"
    log "📋 Log file: $LOG_FILE"
}

# Trap để cleanup khi script bị interrupt
trap 'log "❌ Script bị interrupt"; exit 1' INT TERM

# Run main function
main "$@"
