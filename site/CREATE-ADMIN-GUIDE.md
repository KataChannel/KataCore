# TazaCore Super Administrator Creation Guide

## 📋 Tổng quan

Hướng dẫn tạo Super Administrator với đầy đủ quyền hệ thống cho TazaCore.

## 🚀 Các cách tạo Super Admin

### 1. Tạo nhanh với thông tin mặc định (Khuyến nghị)

```bash
# Chạy script tạo nhanh
npm run create-admin

# Hoặc
cd site
tsx scripts/quick-create-admin.ts
```

**Thông tin mặc định:**
- Email: `admin@taza.com`
- Username: `superadmin`
- Password: `TazaAdmin@2024!`
- Display Name: `Super Administrator`

### 2. Tạo với thông tin tùy chỉnh (Interactive)

```bash
# Chạy script tương tác
npm run create-admin-interactive

# Hoặc
cd site
tsx scripts/create-admin-user.ts
```

Script sẽ hỏi bạn nhập:
- Email
- Username
- Display Name
- Password
- Phone (optional)

### 3. Tạo qua API

```bash
# POST request tạo với thông tin mặc định
curl -X POST http://localhost:3000/api/admin/quick-create-admin \
  -H "Content-Type: application/json"

# POST request với thông tin tùy chỉnh
curl -X POST http://localhost:3000/api/admin/quick-create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "username": "admin",
    "password": "MySecurePassword123!",
    "displayName": "System Administrator",
    "phone": "+84-123-456-789"
  }'
```

### 4. Kiểm tra Super Admin hiện tại

```bash
# GET request kiểm tra
curl http://localhost:3000/api/admin/quick-create-admin
```

## 🔑 Quyền hạn Super Administrator

Super Administrator có toàn quyền trên:

### 🖥️ System Permissions
- `system:admin` - Quản trị hệ thống
- `system:manage` - Quản lý hệ thống
- `system:configure` - Cấu hình hệ thống
- `system:audit` - Kiểm toán hệ thống
- `system:backup` - Backup và restore

### 👥 User & Role Management
- `create:user`, `read:user`, `update:user`, `delete:user`, `manage:user`
- `create:role`, `read:role`, `update:role`, `delete:role`, `manage:role`

### 📦 Module Permissions (11 Modules)
- **Sales**: `admin:sales`, `manage:sales`, `approve:sales`, `export:sales`, `import:sales`
- **CRM**: `admin:crm`, `manage:crm`, `export:crm`, `import:crm`
- **Inventory**: `admin:inventory`, `manage:inventory`, `approve:inventory`, `export:inventory`, `import:inventory`
- **Finance**: `admin:finance`, `manage:finance`, `approve:finance`, `export:finance`, `audit:finance`
- **HRM**: `admin:hrm`, `manage:hrm`, `approve:hrm`, `export:hrm`, `import:hrm`
- **Projects**: `admin:projects`, `manage:projects`, `approve:projects`, `export:projects`
- **Manufacturing**: `admin:manufacturing`, `manage:manufacturing`, `approve:manufacturing`, `export:manufacturing`
- **Marketing**: `admin:marketing`, `manage:marketing`, `approve:marketing`, `export:marketing`
- **Support**: `admin:support`, `manage:support`, `export:support`
- **Analytics**: `admin:analytics`, `manage:analytics`, `export:analytics`
- **E-commerce**: `admin:ecommerce`, `manage:ecommerce`, `approve:ecommerce`, `export:ecommerce`

### 🌟 Universal Permissions
- `create:*`, `read:*`, `update:*`, `delete:*`, `manage:*`, `admin:*`

## 🔗 Đường dẫn truy cập

Sau khi tạo thành công, bạn có thể truy cập:

- **Admin Panel**: http://localhost:3000/admin
- **Login Page**: http://localhost:3000/auth/login
- **Demo Page**: http://localhost:3000/auth-demo

## ⚠️ Lưu ý bảo mật

### Bắt buộc sau khi tạo:
1. **Đổi mật khẩu** ngay sau lần đăng nhập đầu tiên
2. **Cập nhật email** từ mặc định sang email thực
3. **Thêm số điện thoại** cho bảo mật 2 lớp
4. **Kích hoạt 2FA** nếu có sẵn

### Không nên:
- Chia sẻ thông tin đăng nhập
- Sử dụng mật khẩu mặc định trong production
- Tạo nhiều Super Admin không cần thiết
- Đăng nhập từ mạng không an toàn

## 🛠️ Troubleshooting

### Lỗi thường gặp:

#### 1. Database Connection Error
```bash
# Kiểm tra Prisma connection
cd ../shared
npx prisma db push
```

#### 2. User Already Exists
```bash
# Kiểm tra user hiện tại
curl http://localhost:3000/api/admin/quick-create-admin

# Force create (overwrite)
curl -X POST http://localhost:3000/api/admin/quick-create-admin \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

#### 3. Role Permission Issues
```bash
# Reset và tạo lại roles
npm run db:migrate
npm run create-admin
```

#### 4. Employee Table Missing
Lỗi này không ảnh hưởng tới việc tạo Super Admin. Employee record sẽ được tạo sau khi HRM module được setup.

## 🔍 Verification

Sau khi tạo, kiểm tra:

```bash
# 1. Kiểm tra user trong database
npx prisma studio

# 2. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taza.com",
    "password": "TazaAdmin@2024!"
  }'

# 3. Kiểm tra permissions
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs trong terminal
2. Xem Prisma Studio để debug database
3. Kiểm tra API response với curl
4. Reset database nếu cần thiết

---

**🚀 Happy Coding with TazaCore!**
