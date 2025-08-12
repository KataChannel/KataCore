#!/bin/bash

# Default values
DEFAULT_SERVER_NAME="app.tazagroup.vn"
DEFAULT_PROXY_IP="localhost"
DEFAULT_PROXY_PORT="3900"
DEFAULT_ENABLE_SSL="y"
DEFAULT_CLOUD_IP="116.118.49.243"
DEFAULT_CLOUD_USER="root"

# Get user input with default values
read -e -p "Enter server name [$DEFAULT_SERVER_NAME]: " -i "$DEFAULT_SERVER_NAME" SERVER_NAME
read -e -p "Enter proxy IP address [$DEFAULT_PROXY_IP]: " -i "$DEFAULT_PROXY_IP" PROXY_IP
read -e -p "Enter proxy port [$DEFAULT_PROXY_PORT]: " -i "$DEFAULT_PROXY_PORT" PROXY_PORT
read -e -p "Enable SSL? (y/n) [$DEFAULT_ENABLE_SSL]: " -i "$DEFAULT_ENABLE_SSL" ENABLE_SSL
read -e -p "Enter cloud server IP [$DEFAULT_CLOUD_IP]: " -i "$DEFAULT_CLOUD_IP" CLOUD_IP
read -e -p "Enter cloud server username [$DEFAULT_CLOUD_USER]: " -i "$DEFAULT_CLOUD_USER" CLOUD_USER

# Use defaults if user pressed enter without input
SERVER_NAME=${SERVER_NAME:-$DEFAULT_SERVER_NAME}
PROXY_IP=${PROXY_IP:-$DEFAULT_PROXY_IP}
PROXY_PORT=${PROXY_PORT:-$DEFAULT_PROXY_PORT}
ENABLE_SSL=${ENABLE_SSL:-$DEFAULT_ENABLE_SSL}
CLOUD_IP=${CLOUD_IP:-$DEFAULT_CLOUD_IP}
CLOUD_USER=${CLOUD_USER:-$DEFAULT_CLOUD_USER}

# Create temporary nginx config locally
mkdir -p /tmp/nginx-config
cat > /tmp/nginx-config/$SERVER_NAME << EOF
server {
    listen 80;
    server_name $SERVER_NAME;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    client_max_body_size 50M;
    location / {
        proxy_pass http://$PROXY_IP:$PROXY_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_http_version 1.1;
    }
}
EOF

# Copy configuration to cloud server and apply it
echo "Copying nginx config to cloud server..."
scp /tmp/nginx-config/$SERVER_NAME $CLOUD_USER@$CLOUD_IP:/tmp/

ssh $CLOUD_USER@$CLOUD_IP << REMOTE_SCRIPT
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo mv /tmp/$SERVER_NAME /etc/nginx/sites-available/
sudo rm -f /etc/nginx/sites-enabled/$SERVER_NAME
sudo ln -s /etc/nginx/sites-available/$SERVER_NAME /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
REMOTE_SCRIPT

if [ $? -eq 0 ]; then
    echo "Configuration applied to cloud server successfully"
else
    echo "Failed to apply configuration to cloud server"
    exit 1
fi

# Configure SSL if requested
if [[ $ENABLE_SSL == "y" || $ENABLE_SSL == "Y" ]]; then
    echo "Checking and installing certbot if needed..."
    ssh $CLOUD_USER@$CLOUD_IP << 'INSTALL_CERTBOT'
# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot and python3-certbot-nginx..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
else
    echo "Certbot is already installed"
fi
INSTALL_CERTBOT

    echo "Installing SSL certificate on cloud server..."
    ssh $CLOUD_USER@$CLOUD_IP "sudo certbot --nginx -d $SERVER_NAME"
    
    if [ $? -eq 0 ]; then
        echo "SSL certificate installed successfully"
        ssh $CLOUD_USER@$CLOUD_IP "sudo certbot renew --dry-run"
    else
        echo "SSL certificate installation failed"
    fi
fi

# Clean up temporary file
rm -f /tmp/nginx-config/$SERVER_NAME
