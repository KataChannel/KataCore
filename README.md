# TazaGroup - Unified Business Management System

## 🚀 Quick Start

### Development
```bash
# Start development server
./run.sh

# Seed database with complete data
cd site && npm run db:seed
```

### Production
```bash
# Deploy to production
./sh/deploy-production.sh
```

## 🏢 System Overview

### Core Features
- **👥 HR Management**: Complete employee lifecycle
- **🔐 Authentication**: Role-based access control  
- **💬 Communication**: Internal messaging system
- **📊 Analytics**: Business insights

### User Roles
- **Super Admin**: it@tazagroup.vn / 123456
- **Department Managers**: Full department access
- **Employees**: Self-service portal

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Custom JWT system
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
tazagroup/
├── run.sh                 # Main startup script
├── sh/                    # Shell utilities
├── site/                  # Main application
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed/          # Database seeding
│   ├── src/               # Application source
│   └── package.json       # Dependencies
└── README.md              # This file
```

## 🔧 Development Commands

```bash
# Install dependencies
cd site && npm install

# Generate Prisma client
cd site && npx prisma generate

# Run database migrations
cd site && npx prisma migrate deploy

# Seed database
cd site && npm run db:seed

# Start development server
cd site && npm run dev
```

## 🚀 Deployment

Use the provided shell scripts in `sh/` directory for automated deployment.

## 📞 Support

For technical support, contact the development team.

---

**TazaGroup** - Professional Business Management Solution






#codebase cập nhật dựa án admin.social/facebook với
1. Configuration Tab : NEXT_PUBLIC_FACEBOOK_APP_ID, NEXT_PUBLIC_FACEBOOK_APP_SECRET,NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN,NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN,NEXT_PUBLIC_FACEBOOK_API_VERSION các thông số này ưu tiên được lấy từ .env nếu không có lấy từ localstorage, có thể nhập từ người dùng
2.Sync Tab theo các bước
2.1 Nếu không có thông số NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN popup login hoặc nhập NEXT_PUBLIC_FACEBOOK_SHORT_LIVED_TOKEN vào rồi generate NEXT_PUBLIC_FACEBOOK_LONG_LIVED_TOKEN
2.2 sử dụng các thông số để tiến hành Sync : 
Fanpage -> Post -> Comment
 Fanpage -> Massenger
 2.3 Hiển thị đươi dạng bảng.
 3. User data tab giữ nguyên
 lữu ý không thay đổi nhiều với cấu trúc hiện tại để userdata hiển thị ra chính xác dữ liệu