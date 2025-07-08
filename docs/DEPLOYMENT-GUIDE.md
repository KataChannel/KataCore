# 🚀 KataCore Deployment Guide

Hướng dẫn triển khai toàn diện cho dự án KataCore với các công cụ tự động hóa.

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cài đặt ban đầu](#cài-đặt-ban-đầu)
4. [Deploy Remote với deploy-remote.sh](#deploy-remote)
5. [Quản lý Git với autopush.sh](#quản-lý-git)
6. [Các lệnh thường dùng](#các-lệnh-thường-dùng)
7. [Xử lý sự cố](#xử-lý-sự-cố)

## 🎯 Tổng quan

KataCore cung cấp 2 script chính để tự động hóa quy trình phát triển và triển khai:

- **`deploy-remote.sh`**: Triển khai dự án lên server remote với SSL và domain
- **`autopush.sh`**: Tự động commit, push code và merge branch

## 🛠️ Yêu cầu hệ thống

### Local Machine
- **OS**: Linux/macOS/Windows (WSL)
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0
- **Git**: >= 2.30.0
- **SSH Client**: OpenSSH hoặc tương đương
- **Bash**: >= 4.0

### Remote Server
- **OS**: Ubuntu 20.04+ hoặc Debian 11+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Disk**: Tối thiểu 20GB free space
- **Network**: Public IP với ports 80, 443, 22 mở
- **Domain**: (Tùy chọn) cho SSL deployment

## 🔧 Cài đặt ban đầu

### 1. Clone Repository
```bash
git clone https://github.com/your-org/KataCore.git
cd KataCore
```

### 2. Cấp quyền thực thi
```bash
chmod +x deploy-remote.sh autopush.sh
```

### 3. Cấu hình SSH Key
```bash
# Tạo SSH key mới (nếu chưa có)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key lên server
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_SERVER_IP
```

## 🚀 Deploy Remote

### Chế độ Interactive (Khuyến nghị cho lần đầu)

```bash
./deploy-remote.sh --interactive
```

Script sẽ hướng dẫn bạn từng bước:
1. **Server Configuration**: IP, domain, SSH settings
2. **Deployment Type**: Simple (IP only) hoặc Full (domain + SSL)
3. **Services**: Chọn services cần cài đặt
4. **Nginx Configuration**: Cấu hình reverse proxy

### Deployment nhanh

#### 1. Simple Deployment (chỉ IP, không SSL)
```bash
./deploy-remote.sh --simple 116.118.48.143
```

#### 2. Full Deployment (với domain + SSL)
```bash
./deploy-remote.sh 116.118.48.143 kataoffical.online
```

#### 3. Custom Configuration
```bash
./deploy-remote.sh \
  --user ubuntu \
  --key ~/.ssh/my-key.pem \
  --install-api \
  --install-postgres \
  --install-redis \
  --nginxapi \
  116.118.48.143 kataoffical.online
```

### Tùy chọn Deploy

| Option | Mô tả | Ví dụ |
|--------|-------|-------|
| `--interactive` | Chế độ tương tác | `./deploy-remote.sh -i` |
| `--simple` | Deployment đơn giản (IP only) | `./deploy-remote.sh --simple IP` |
| `--user USER` | SSH username | `--user ubuntu` |
| `--key PATH` | SSH private key path | `--key ~/.ssh/my-key.pem` |
| `--compose FILE` | Docker compose file | `--compose docker-compose.yml` |
| `--project NAME` | Project name | `--project myapp` |
| `--force-regen` | Force regenerate .env files | `--force-regen` |
| `--cleanup` | Cleanup deployment | `--cleanup IP` |

### Service Options

| Option | Mô tả |
|--------|-------|
| `--install-api` | Cài đặt API service |
| `--install-postgres` | Cài đặt PostgreSQL database |
| `--install-redis` | Cài đặt Redis cache |
| `--install-minio` | Cài đặt MinIO object storage |
| `--install-pgadmin` | Cài đặt pgAdmin |

### Nginx Options (Full deployment only)

| Option | Mô tả | URL |
|--------|-------|-----|
| `--nginxapi` | API subdomain | `https://api.domain.com` |
| `--nginxpgadmin` | pgAdmin subdomain | `https://pgadmin.domain.com` |
| `--nginxminio` | MinIO subdomain | `https://minio.domain.com` |

## 📝 Quản lý Git

### Sử dụng autopush.sh

#### 1. Push branch hiện tại
```bash
# Auto-commit và push
./autopush.sh

# Với commit message tùy chỉnh
./autopush.sh "feat: add new feature"
```

#### 2. Merge vào main branch
```bash
# Auto-detect main branch và merge
./autopush.sh --merge

# Merge với custom message
./autopush.sh --merge "release: version 2.0"

# Merge vào branch cụ thể
./autopush.sh --main-branch develop --merge
```

### Tính năng autopush.sh

- ✅ **Dynamic main branch detection**: Tự động phát hiện main/master/develop
- ✅ **Smart commit messages**: Tự động tạo commit message dựa trên thay đổi
- ✅ **Merge workflow**: Merge an toàn với pull latest changes
- ✅ **Branch cleanup**: Tùy chọn xóa feature branch sau merge
- ✅ **Validation**: Kiểm tra git repository và conflicts

### Examples

```bash
# Commit và push thay đổi hiện tại
./autopush.sh "fix: resolve database connection issue"

# Merge feature branch vào main
git checkout feature/new-ui
./autopush.sh --merge "feat: add new UI components"

# Merge vào develop branch
./autopush.sh --main-branch develop --merge "chore: update dependencies"
```

## 🎯 Các lệnh thường dùng

### Kiểm tra trạng thái deployment

```bash
# Kiểm tra containers đang chạy
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose ps'

# Xem logs
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose logs'

# Kiểm tra resource usage
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'docker stats --no-stream'
```

### Restart services

```bash
# Restart tất cả services
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose restart'

# Restart service cụ thể
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose restart api'
```

### Update deployment

```bash
# Re-deploy với code mới
./deploy-remote.sh --force-regen SERVER_IP DOMAIN

# Update chỉ API
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose build api && docker compose up -d api'
```

### Cleanup deployment

```bash
# Xóa hoàn toàn deployment
./deploy-remote.sh --cleanup SERVER_IP

# Xóa containers nhưng giữ data
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose down'
```

## 🔍 Monitoring & Logs

### Xem logs real-time

```bash
# Tất cả services
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose logs -f'

# Chỉ API
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose logs -f api'

# Last 100 lines
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose logs --tail=100'
```

### Health checks

```bash
# Kiểm tra endpoints
curl -f http://SERVER_IP:3000/health
curl -f http://SERVER_IP:3001/health

# Với domain
curl -f https://your-domain.com/health
curl -f https://api.your-domain.com/health
```

## 🆘 Xử lý sự cố

### Lỗi thường gặp

#### 1. SSH Connection Failed
```bash
# Kiểm tra SSH key
ssh -i ~/.ssh/id_rsa root@SERVER_IP

# Test connection
./deploy-remote.sh --test-connection SERVER_IP
```

#### 2. Docker Build Failed
```bash
# Xem chi tiết lỗi
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'cd /opt/katacore && docker compose build --no-cache'

# Clean và rebuild
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'docker system prune -af'
```

#### 3. SSL Certificate Issues
```bash
# Re-generate certificates
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'certbot renew --force-renewal'

# Check certificate status
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'certbot certificates'
```

#### 4. Git Merge Conflicts
```bash
# Reset về trạng thái sạch
git status
git reset --hard HEAD
git clean -fd

# Hoặc resolve conflicts manually
git mergetool
```

### Debug Commands

```bash
# Kiểm tra Docker daemon
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'systemctl status docker'

# Kiểm tra disk space
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'df -h'

# Kiểm tra memory usage
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'free -m'

# Kiểm tra open ports
ssh -i ~/.ssh/id_rsa root@SERVER_IP 'netstat -tlnp'
```

## 🔐 Security Best Practices

1. **SSH Keys**: Sử dụng SSH keys thay vì password
2. **Firewall**: Chỉ mở ports cần thiết
3. **SSL**: Luôn sử dụng HTTPS cho production
4. **Environment**: Backup file .env.prod an toàn
5. **Updates**: Thường xuyên update server và dependencies

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)
- [Git Best Practices](https://git-scm.com/docs)

## 🤝 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker compose logs`
2. Xem tài liệu troubleshooting
3. Tạo issue trên GitHub
4. Liên hệ team qua Slack/Discord

---

**Made with ❤️ by KataCore Team**
