#!/bin/bash

# 🔐 KataCore Auto-Generated Security Script
# Tạo các mật khẩu và secrets bảo mật tự động

set -euo pipefail

# Color codes
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

echo -e "${BLUE}🔐 Đang tạo auto-generated security cho KataCore...${NC}"

# Tạo các password và secrets bảo mật
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "\n")
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
PGADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Tạo file .env.local với auto-generated passwords
cat > .env.local << EOF
# 🔐 KataCore Auto-Generated Security Configuration
# Generated on $(date)
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# ===== AUTO-GENERATED PASSWORDS =====
# 16-32 character secure passwords
POSTGRES_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
PGADMIN_DEFAULT_PASSWORD=$PGADMIN_PASSWORD
GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD

# ===== JWT & ENCRYPTION =====
# 64-character base64 encoded JWT secret
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# ===== DATABASE CONFIGURATION =====
POSTGRES_DB=katacore
POSTGRES_USER=katacore
DATABASE_URL=postgresql://katacore:$DB_PASSWORD@localhost:5432/katacore

# ===== REDIS CONFIGURATION =====
REDIS_URL=redis://:$REDIS_PASSWORD@localhost:6379

# ===== MINIO CONFIGURATION =====
MINIO_ROOT_USER=admin
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=$MINIO_ROOT_PASSWORD
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_USE_SSL=false

# ===== PGADMIN CONFIGURATION =====
PGADMIN_DEFAULT_EMAIL=admin@localhost
PGADMIN_PORT=5050

# ===== APPLICATION CONFIGURATION =====
NODE_ENV=development
API_PORT=3001
SITE_PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
INTERNAL_API_URL=http://localhost:3001
EOF

echo -e "${GREEN}✅ Auto-generated security đã được tạo thành công!${NC}"
echo -e "${YELLOW}📁 File: .env.local${NC}"
echo ""
echo -e "${BLUE}🔑 Passwords đã được tạo:${NC}"
echo "• Database Password: $DB_PASSWORD"
echo "• Redis Password: $REDIS_PASSWORD"
echo "• MinIO Password: $MINIO_ROOT_PASSWORD"
echo "• PgAdmin Password: $PGADMIN_PASSWORD"
echo "• Grafana Password: $GRAFANA_PASSWORD"
echo ""
echo -e "${BLUE}🔐 Security Features:${NC}"
echo "• JWT Secret: 64-character base64 encoded"
echo "• Passwords: 32-character secure random strings"
echo "• Encryption Key: 32-character secure key"
echo ""
echo -e "${YELLOW}⚠️  LƯU Ý: File .env.local chứa mật khẩu bảo mật. KHÔNG commit vào git!${NC}"
