# TazaGroup Unified Comprehensive Seed Data

## ✅ STATUS: FULLY OPERATIONAL

**Last Updated:** July 25, 2025  
**Status:** ✅ **PRODUCTION READY & TESTED**  
**Version:** 4.0 - TypeScript Fixed & Validated

The unified comprehensive seed script has been **successfully fixed and tested**. All TypeScript compilation errors have been resolved and the script executes flawlessly.

### 🎯 EXECUTION RESULTS
```
✅ Database cleared successfully
✅ Created 10 system roles
✅ Created admin users  
✅ Created 6 departments
✅ Created 13 positions
✅ Created 15 users (6 managers + 9 employees)
✅ Created 15 employee records
✅ Created sample HR data (attendance, leave requests, payroll)
✅ Created sample communication data
✅ Created affiliate system data
✅ Created user settings for 15 users
```

## 📋 Tổng quan

Script seed data tổng hợp từ tất cả các modules và systems trong dự án TazaGroup. Tạo ra một bộ dữ liệu hoàn chỉnh cho việc phát triển và testing.

## 🎯 Tính năng chính

### ✅ Super User mặc định
- **Email**: `it@tazagroup.vn`
- **Password**: `123456`
- **Role**: Super Administrator với quyền tối cao

### 🏢 Cấu trúc tổ chức hoàn chỉnh
- **6 Departments**: Technology, HR, Sales & Marketing, Finance & Accounting, Operations, Quality Assurance
- **13 Positions**: Từ C-level đến Staff level
- **17 Users**: System users, Management, và Employees

### 👥 Hệ thống phân quyền
- **10 Roles** với level phân cấp từ 1-10:
  - Super Admin (Level 10)
  - System Admin (Level 9) 
  - HR Manager (Level 8)
  - Sales Manager (Level 7)
  - Finance Manager (Level 7)
  - IT Manager (Level 7)
  - Department Manager (Level 6)
  - Team Lead (Level 5)
  - Employee (Level 3)
  - Viewer (Level 1)

### 📊 Dữ liệu mẫu
- **Employee Records**: Thông tin nhân viên đầy đủ
- **Attendance**: Dữ liệu chấm công 30 ngày gần nhất
- **Leave Requests**: Đơn xin nghỉ phép mẫu
- **Payroll**: Bảng lương tháng 11/2024
- **Communication**: Conversations và Messages
- **Affiliate**: Hệ thống affiliate cơ bản

## 🚀 Cách sử dụng

### Option 1: Sử dụng script runner (Khuyến nghị)
```bash
# Từ thư mục root của project
./run-unified-seed.sh
```

### Option 2: Chạy trực tiếp với npm/bun
```bash
# Di chuyển vào thư mục site
cd site

# Với bun
bun run db:seed:unified

# Với npm
npm run db:seed:unified

# Hoặc chạy trực tiếp
npx tsx prisma/seed/unified-comprehensive-seed.ts
```

### Option 3: Chạy manual
```bash
cd site
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed/unified-comprehensive-seed.ts
```

## 🔑 Login Credentials

### System Users
| Role | Email | Password | Mô tả |
|------|-------|----------|-------|
| Super Admin | `it@tazagroup.vn` | `123456` | Quyền tối cao |
| System Admin | `admin@tazagroup.vn` | `123456` | Quản trị hệ thống |

### Management Users
| Role | Email | Password | Department |
|------|-------|----------|------------|
| CTO | `cto@tazagroup.vn` | `123456` | Technology |
| HR Director | `hr.director@tazagroup.vn` | `123456` | Human Resources |
| Sales Director | `sales.director@tazagroup.vn` | `123456` | Sales & Marketing |
| Finance Manager | `finance.manager@tazagroup.vn` | `123456` | Finance & Accounting |
| Operations Manager | `ops.manager@tazagroup.vn` | `123456` | Operations |
| QA Manager | `qa.manager@tazagroup.vn` | `123456` | Quality Assurance |

### Employee Users
| Email | Password | Department | Position |
|-------|----------|------------|----------|
| `dev1@tazagroup.vn` | `123456` | Technology | Senior Software Engineer |
| `dev2@tazagroup.vn` | `123456` | Technology | Backend Developer |
| `devops@tazagroup.vn` | `123456` | Technology | DevOps Engineer |
| `hr1@tazagroup.vn` | `123456` | HR | HR Specialist |
| `sales1@tazagroup.vn` | `123456` | Sales | Senior Sales Executive |
| `sales2@tazagroup.vn` | `123456` | Sales | Sales Executive |
| `accountant1@tazagroup.vn` | `123456` | Finance | Senior Accountant |
| `ops1@tazagroup.vn` | `123456` | Operations | Operations Specialist |
| `qa1@tazagroup.vn` | `123456` | QA | QA Specialist |

## 📈 Dữ liệu được tạo

### 🏢 Departments (6)
- Technology Department
- Human Resources  
- Sales & Marketing
- Finance & Accounting
- Operations
- Quality Assurance

### 💼 Positions (13)
- CTO, HR Director, Sales Director
- Finance Manager, Operations Manager, QA Manager
- Senior Software Engineer, DevOps Engineer
- HR Specialist, Senior Sales Executive, Sales Executive
- Senior Accountant, Operations Specialist, QA Specialist

### 👥 Users (17)
- 2 System users
- 6 Management users  
- 9 Employee users

### 📊 HR Data
- Employee records cho tất cả users
- Attendance records (30 ngày)
- Leave requests mẫu
- Payroll records tháng 11/2024

### 💬 Communication
- Company announcement channel
- IT team conversation
- Sample messages

### 🤝 Affiliate
- 3 affiliate records
- Sample referral data

## 🛠️ Yêu cầu kỹ thuật

### Dependencies
- Node.js 18+
- Prisma CLI
- TypeScript/tsx
- PostgreSQL database

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## 🗂️ File Structure

```
prisma/seed/
├── unified-comprehensive-seed.ts  # Main seed file
├── master-seed.ts                 # Legacy master seed  
├── hrm-seed.ts                   # Legacy HRM seed
└── data-migration.ts             # Legacy migration
```

## 🧹 Cleanup

Script này đã loại bỏ các dependencies không cần thiết:
- ✅ Không phụ thuộc vào external permission files
- ✅ Self-contained permission definitions
- ✅ Simplified role structure
- ✅ Removed unused scripts

## 📝 Changelog

### Version 3.0 (Current)
- ✅ Unified comprehensive seed data
- ✅ Super user: it@tazagroup.vn
- ✅ Self-contained permissions
- ✅ Complete organizational structure
- ✅ Sample data for all modules
- ✅ Removed unnecessary dependencies

### Previous Versions
- v2.0: Master seed comprehensive
- v1.0: Basic HRM seed

## 🤝 Contributing

Khi cần cập nhật seed data:

1. Chỉnh sửa `unified-comprehensive-seed.ts`
2. Test với database mới
3. Cập nhật documentation
4. Increment version number

## 📞 Support

Nếu gặp vấn đề khi chạy seed:

1. Kiểm tra DATABASE_URL trong .env
2. Đảm bảo database accessible
3. Chạy `prisma generate` trước
4. Check console logs để debug

---

**🎯 Mục tiêu**: Tạo ra bộ seed data hoàn chỉnh, professional và dễ maintain cho TazaGroup project.
