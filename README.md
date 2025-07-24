# 🚀 TazaCore - Enterprise Full-Stack Platform

<div align="center">

![TazaCore Logo](https://img.shields.io/badge/TazaCore-Production%20Ready-blue?style=for-the-badge&logo=docker)

**🏢 Complete Business Management System | 📊 12 Integrated Modules | 🔐 Advanced Security**

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6+-darkblue?style=flat-square&logo=prisma)](https://prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker)](https://www.docker.com/)

[🚀 Quick Start](#-quick-start) • [💼 Features](#-core-features) • [🛠️ Scripts](#-available-scripts) • [📊 Architecture](#-system-architecture)

</div>

---

## ✨ What is TazaCore?

**TazaCore** is a production-ready enterprise platform that combines advanced HR management, affiliate marketing, call center integration, and comprehensive business modules with intelligent permission system. Built with modern technologies and designed for scalability.

### 🎯 **Perfect for:**
- 🏢 **Enterprise Companies** needing complete business management
- 👥 **HR Teams** requiring advanced employee management  
- 💰 **Marketing Teams** running affiliate programs
- 📞 **Call Centers** needing CDR management
- 🏗️ **Developers** wanting a solid foundation for business apps

---

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/your-username/tazagroup.git
cd tazagroup

# 2. One-command setup (sets up everything)
./quick-setup-permissions.sh

# 3. Start development server  
cd site && bun dev
```

**🎉 That's it!** Access your system at `http://localhost:3000`

**Default Login**: `admin@taza.com` / `TazaAdmin@2024!`

---

## 💼 Core Features

### 🏢 **Business Modules (12 Complete Systems)**

| Module | Features | Status |
|--------|----------|--------|
| 👥 **HRM** | Employee management, attendance, payroll, performance reviews | ✅ Complete |
| 💰 **Sales** | Lead management, pipeline tracking, revenue analytics | ✅ Complete |
| 👨‍💼 **CRM** | Customer profiles, communication history, support tickets | ✅ Complete |
| 📦 **Inventory** | Stock management, procurement, warehouse operations | ✅ Complete |
| 💳 **Finance** | Accounting, invoicing, expense tracking, reporting | ✅ Complete |
| 🏗️ **Projects** | Task management, team collaboration, progress tracking | ✅ Complete |
| 🏭 **Manufacturing** | Production planning, quality control, resource allocation | ✅ Complete |
| 📢 **Marketing** | Campaign management, analytics, lead generation | ✅ Complete |
| 🆘 **Support** | Ticket system, knowledge base, customer satisfaction | ✅ Complete |
| 📊 **Analytics** | Business intelligence, KPI dashboards, custom reports | ✅ Complete |
| 🛒 **E-commerce** | Product catalog, order management, payment processing | ✅ Complete |
| 🤝 **Affiliate** | Partner management, commission tracking, referral system | ✅ Complete |

### 🔐 **Advanced Security & Permissions**
- **100+ Granular Permissions**: Action-resource-scope based permissions
- **8 System Roles**: From Employee (Level 1) to Super Administrator (Level 10)
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Multi-Provider OAuth**: Google, Facebook, Apple, Microsoft integration
- **Auto-sync Service**: Real-time synchronization between code and database

### 📞 **Call Center Integration**
- **Real-time CDR Processing**: Automatic call data record synchronization
- **Advanced Analytics**: Call volume, duration, success rates
- **Extension Management**: Track all phone extensions and assignments
- **Export Capabilities**: CSV/Excel exports for reporting

### 🎯 **Enterprise Features**
- **Multi-tenant Architecture**: Support multiple organizations
- **Advanced Dashboard**: Personalized widgets and analytics
- **Real-time Notifications**: System-wide notification system
- **File Management**: MinIO S3-compatible storage
- **Audit Logging**: Complete activity tracking
- **API-First Design**: RESTful APIs for all features

---

## 📊 System Architecture

### **Core Technology Stack**
- **Frontend**: Next.js 15+, React 18+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT-based with NextAuth.js
- **Storage**: MinIO (S3-compatible)
- **Deployment**: Docker containers

### **Database Schema & Migrations**
- **Prisma ORM** with PostgreSQL backend
- **Auto-migration system** for permissions and roles
- **Schema validation** and health monitoring
- **Data seeding** for initial setup

### **Permission System Architecture**
- **11 Business Modules**: Sales, CRM, Inventory, Finance, HRM, Projects, Manufacturing, Marketing, Support, Analytics, E-commerce
- **100+ Granular Permissions**: Action-resource-scope based permissions
- **8 System Roles**: Employee (Level 1) to Super Administrator (Level 10)
- **Auto-sync Service**: Real-time synchronization between code and database

## 💼 Core Features

### 🏗️ **Enterprise Architecture**
- **Next.js 15+** - Modern React fullstack framework
- **TypeScript** - Type-safe development
- **Prisma + PostgreSQL** - Robust database layer
- **Docker Ready** - Containerized deployment
- **Auto-sync** permission system

### 🎯 **Business Modules** (12 Complete Systems)
- **👥 HRM** - Employee management, attendance, payroll
- **💰 Affiliate** - Marketing campaigns, tracking, commissions  
- **📞 Call Center** - CDR management, analytics
- **🏢 CRM** - Customer relationship management
- **📊 Analytics** - Business intelligence and reporting
- **💼 Project Management** - Task and project tracking
- **🛒 E-commerce** - Online store integration
- **📈 Sales** - Sales pipeline and management
- **💰 Finance** - Accounting and financial tools
- **🏭 Manufacturing** - Production management
- **📢 Marketing** - Campaign and lead management
- **🎯 Support** - Help desk and ticketing

### 🔐 **Advanced Security**
- **Role-based Access Control** - 10-level hierarchy
- **100+ Granular Permissions** - Fine-grained access control
- **JWT Authentication** - Secure token-based auth
- **Auto-sync System** - Real-time permission synchronization

### 📱 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach
- **Dark/Light Themes** - Multiple theme options
- **Multi-language** - English/Vietnamese support
- **Real-time Updates** - Live notifications and data

---

## 🛠️ Available Scripts

### **🚀 Setup & Deployment**
```bash
# Complete setup with permissions
./quick-setup-permissions.sh

# Start development server
./run.sh

# Deploy to production
./deploy.sh
```

### **📂 Scripts Directory (`./scripts/`)**
```bash
# Database & Permissions
./scripts/migrate-permissions-to-db.sh  # Migrate permissions to database
./scripts/test-seed.sh                  # Test database seeding

# Deployment
./scripts/deploy-production.sh          # Production deployment
./scripts/deploy-remote-fixed.sh        # Remote deployment (fixed)
./scripts/autopush.sh                  # Auto-push to repository
./scripts/generate-security.sh         # Generate security certificates
```

### **🖥️ System Administration (`./sh/`)**
```bash
# Environment & Setup
./sh/1sshauto.sh                       # SSH automation setup
./sh/2envauto.sh                       # Environment variables setup
./sh/3pushauto.sh                      # Smart deployment automation
./sh/6clone.sh                         # Repository cloning
./sh/7sharedorisma.sh                  # Shared Prisma setup

# System Utilities
./sh/4backup.sh                        # System backup
./sh/5github.sh                        # GitHub operations
./sh/allowport.sh                      # Configure firewall ports
./sh/cleanup_report.sh                 # System cleanup and reporting
./sh/nginx.sh                          # Nginx configuration
./sh/organize_docs.sh                  # Documentation organization
./sh/deploy-shared-prisma.sh           # Deploy shared Prisma schema
./sh/pre-deploy-prisma.sh              # Pre-deployment Prisma setup
```

### **🌐 Site-Specific Scripts (`./site/`)**
```bash
# Development
./site/start-dev.sh                    # Start development server
./site/test-login-curl.sh              # Test login API with curl

# Setup & Maintenance
./site/setup-super-admin.sh            # Setup super admin user
./site/cleanup-auth-duplicates.sh      # Clean authentication duplicates
```

---

## 📊 System Status

| Module | Status | Features |
|--------|--------|----------|
| 🏗️ Core System | ✅ Complete | Authentication, Permissions, Database |
| 👥 HRM | ✅ Complete | Employees, Attendance, Payroll, Reports |
| 💰 Affiliate | ✅ Complete | Registration, Tracking, Analytics, Commissions |
| 📞 Call Center | ✅ Complete | CDR Import, Analytics, Extensions |
| 🔐 Permissions | ✅ Complete | Auto-sync, Role management, API |
| 📊 Information Hub | ✅ Complete | 9 modules, Dashboard, Analytics |
| 🎨 UI Components | ✅ Complete | Responsive, Themes, Accessibility |
| 🚢 Deployment | ✅ Complete | Docker, Scripts, Auto-deploy |

---

## 📁 Project Structure (Cleaned)

```
tazagroup/
├── 📱 site/                    # Main Next.js application
│   ├── src/                   # Source code
│   ├── prisma/                # Database schema & migrations
│   ├── public/                # Static assets
│   ├── components/            # React components
│   ├── Dockerfile             # Container configuration
│   ├── start-dev.sh          # Development server
│   ├── setup-super-admin.sh  # Admin setup
│   └── cleanup-auth-duplicates.sh # Auth cleanup
├── 🔧 scripts/                # Deployment and utility scripts
│   ├── deploy-production.sh   # Production deployment
│   ├── migrate-permissions-to-db.sh # Database migration
│   ├── test-seed.sh          # Database seeding
│   ├── autopush.sh           # Auto deployment
│   └── generate-security.sh  # Security setup
├── 🖥️ sh/                     # System administration scripts
│   ├── 1sshauto.sh           # SSH setup
│   ├── 2envauto.sh           # Environment setup
│   ├── 3pushauto.sh          # Smart deployment
│   ├── 4backup.sh            # System backup
│   ├── 5github.sh            # GitHub operations
│   ├── 6clone.sh             # Repository cloning
│   ├── 7sharedorisma.sh      # Shared Prisma
│   ├── allowport.sh          # Firewall configuration
│   ├── cleanup_report.sh     # System cleanup
│   ├── nginx.sh              # Nginx setup
│   └── organize_docs.sh      # Documentation
├── 📚 docs/                   # Technical documentation
├── 🐳 docker-compose.yml      # Container orchestration
├── 🚀 quick-setup-permissions.sh # One-command setup
├── 🏃 run.sh                  # Start all services
├── 🚢 deploy.sh               # Production deployment
├── 📋 README.md               # This comprehensive guide
└── 📄 LICENSE                 # MIT License
```

### **✨ Cleanup Summary**
- ✅ **Removed**: All test files (`test-*.js`, `debug-*.js`, etc.)
- ✅ **Consolidated**: All documentation into single README.md
- ✅ **Preserved**: All 26+ shell scripts for operations
- ✅ **Organized**: Clear categorization of scripts by purpose
- ✅ **Maintained**: Essential configuration and source files

---

## 📊 System Status

| Module | Status | Features |
|--------|--------|----------|
| 🏗️ Core System | ✅ Complete | Authentication, Permissions, Database |
| 👥 HRM | ✅ Complete | Employees, Attendance, Payroll, Reports |
| 💰 Affiliate | ✅ Complete | Registration, Tracking, Analytics, Commissions |
| 📞 Call Center | ✅ Complete | CDR Import, Analytics, Extensions |
| 🔐 Permissions | ✅ Complete | Auto-sync, Role management, API |
| 📊 Information Hub | ✅ Complete | 9 modules, Dashboard, Analytics |
| 🎨 UI Components | ✅ Complete | Responsive, Themes, Accessibility |
| 🚢 Deployment | ✅ Complete | Docker, Scripts, Auto-deploy |

---

## 📁 Project Structure

```
tazagroup/
├── 📱 site/                 # Main Next.js application
├── 🔧 scripts/             # Deployment and utility scripts  
├── 🖥️ sh/                  # System administration scripts
├── 📚 docs/                # Technical documentation
├── 🐳 docker-compose.yml   # Container orchestration
├── 🚀 quick-setup-permissions.sh  # One-command setup
├── 📖 USER_GUIDE.md        # Complete user documentation
└── 📋 README.md            # This file
```

---

## 🚀 Installation Guide

### **Prerequisites**
- **Bun.js** v1.0+ or **Node.js** v18+
- **PostgreSQL** 13+
- **Redis** 6+
- **Docker** (optional)

### **Step 1: Environment Setup**
```bash
# Clone repository
git clone https://github.com/your-username/tazagroup.git
cd tazagroup

# Copy environment template
cp .env.example .env
```

### **Step 2: Configure Environment Variables**
Edit `.env` file with your settings:
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/tazacore"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
ENCRYPTION_KEY="your-32-char-encryption-key"

# MinIO Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"
```

### **Step 3: Quick Setup**
```bash
# Run complete setup (includes database, permissions, and dependencies)
./quick-setup-permissions.sh
```

### **Step 4: Start Development**
```bash
cd site
bun dev
# or npm run dev
```

### **Step 5: Access the Application**
- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **PgAdmin**: http://localhost:5050
- **MinIO Console**: http://localhost:9001

---

## 🐳 Docker Deployment

### **Quick Docker Setup**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Docker Services**
- **Site**: Next.js application (Port 3000)
- **PostgreSQL**: Database server (Port 5432)
- **Redis**: Cache server (Port 6379)
- **MinIO**: File storage (Port 9000, Console 9001)
- **PgAdmin**: Database management (Port 5050)

---

## 📖 User Guide

### **Default Accounts**
- **Super Admin**: `admin@taza.com` / `TazaAdmin@2024!`
- **HR Manager**: `hr@taza.com` / `HrManager@2024!`
- **Sales Manager**: `sales@taza.com` / `SalesManager@2024!`

### **Key Features Overview**

#### **1. HRM System** (`/admin/hr/`)
- **Employee Management**: Complete profiles with photo uploads
- **Attendance Tracking**: Clock-in/out with real-time monitoring
- **Department Structure**: Organizational hierarchy management
- **Leave Management**: Request workflow with approval system
- **Performance Reviews**: 360-degree feedback system
- **Payroll**: Automated salary calculations

#### **2. Call Center Integration** (`/admin/crm/callcenter`)
- **CDR Processing**: Automatic call data synchronization
- **Real-time Analytics**: Live call metrics and reporting
- **Extension Management**: Track all phone extensions
- **Export Capabilities**: Comprehensive reporting tools

#### **3. Affiliate Program** (`/affiliate`)
- **Partner Dashboard**: Complete affiliate management
- **Commission Tracking**: Real-time earnings and payments
- **Link Generation**: Custom referral link creation
- **Analytics**: Performance metrics and conversion tracking

#### **4. Information Hub** (`/information-hub`)
- **Personalized Dashboard**: Customizable widgets
- **Task Management**: Team collaboration tools
- **Training Resources**: Learning management system
- **Community Features**: Internal communication platform

### **Permission Management**
1. Navigate to `/admin/permissions`
2. Assign roles to users
3. Configure module-specific permissions
4. Test permissions in different modules

### **API Integration**
All modules expose RESTful APIs:
```typescript
// Example: Employee API
GET    /api/hr/employees
POST   /api/hr/employees
PUT    /api/hr/employees/[id]
DELETE /api/hr/employees/[id]

// Example: Call Center API
GET    /api/callcenter/calls
POST   /api/callcenter/calls/sync
GET    /api/callcenter/analytics
```

---

## 🔧 Technical Details

### **Module Implementation Details**

#### **HRM System**
**Database Tables**:
- `User` - Core user information
- `Employee` - Extended employee data
- `Department` - Organizational structure
- `Position` - Job positions
- `Attendance` - Time tracking
- `LeaveRequest` - Leave management

#### **Call Center Integration**
**Components**:
- Real-time CDR sync service
- Advanced analytics dashboard
- Extension management system
- Comprehensive reporting tools

#### **Affiliate System**
**Features**:
- Multi-tier commission structure
- Real-time tracking and analytics
- Automated payment processing
- Custom referral link generation

### **Authentication Flow**
- **JWT-based authentication** with refresh tokens
- **NextAuth.js integration** for social login
- **Multi-provider support**: Google, Facebook, Apple, Microsoft
- **Token optimization** to prevent 431 errors
- **Secure cookie management** with httpOnly flags

### **Performance Optimizations**
- **Redis caching** for frequently accessed data
- **Database indexing** for optimal query performance
- **CDN integration** for static assets
- **Lazy loading** for large datasets
- **Compression** for API responses

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# If you encounter import errors
npm run build
# Check for missing dependencies
npm install

# For Prisma issues
npx prisma generate
npx prisma db push
```

#### **Permission Sync Issues**
```bash
# Re-sync permissions
./scripts/migrate-permissions-to-db.sh

# Check permission status
curl http://localhost:3000/api/admin/permissions
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U your_user -d tazacore
```

#### **Docker Issues**
```bash
# Reset Docker environment
docker-compose down -v
docker-compose up -d --build

# Check container logs
docker-compose logs site
```

---

## 📝 Development Guidelines

### **Code Structure**
```
src/
├── app/                 # Next.js app router
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   └── auth/           # Authentication pages
├── components/         # Reusable components
├── lib/               # Utility libraries
│   ├── auth/          # Authentication logic
│   └── hooks/         # Custom React hooks
└── types/             # TypeScript definitions
```

### **Adding New Modules**
1. Create module schema in `prisma/schema.prisma`
2. Add permissions in `lib/auth/modules-permissions.ts`
3. Create API routes in `app/api/[module]/`
4. Build frontend components in `app/admin/[module]/`
5. Run permission migration: `./scripts/migrate-permissions-to-db.sh`

### **Database Migrations**
```bash
# Create new migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### **Code Standards**
- Use TypeScript for all new code
- Follow ESLint configuration
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Email**: support@tazacore.com

---

## 🙏 Acknowledgments

Built with love by the TazaCore team using:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [PostgreSQL](https://postgresql.org/) - Database
- [Redis](https://redis.io/) - Caching
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MinIO](https://min.io/) - Object storage

---

<div align="center">

**⭐ Star this repository if it helped you!**

</div>
├── 🚀 quick-setup-permissions.sh  # One-command setup
├── 📖 USER_GUIDE.md        # Complete user documentation
└── 📋 README.md            # This file
```

---

## 🎓 Learning Resources

- **📖 [Complete User Guide](./USER_GUIDE.md)** - Comprehensive documentation
- **🏗️ Architecture Guide** - System design and patterns
- **🔧 Development Guide** - Setup and development workflow  
- **🚢 Deployment Guide** - Production deployment instructions
- **🔐 Security Guide** - Authentication and authorization
- **📊 API Reference** - Complete API documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Why Choose TazaCore?

✅ **Production Ready** - Battle-tested in enterprise environments  
✅ **Complete Solution** - 12 integrated business modules  
✅ **Modern Stack** - Latest technologies and best practices  
✅ **Scalable Architecture** - Designed for growth  
✅ **Security First** - Advanced permission and auth system  
✅ **Developer Friendly** - Comprehensive docs and tools  
✅ **One-Command Setup** - Get started in minutes  

---

<div align="center">

**🚀 Ready to build something amazing? [Get started now!](#-quick-start)**

Made with ❤️ by TazaCore Team

</div>
- **Docker** & **Docker Compose** 
- **Git** for version control
- **Linux/macOS** (Windows with WSL2)

### 1. 📥 Clone & Setup
```bash
# Clone repository
git clone https://github.com/chikiet/TazaCore.git
cd TazaCore

# Install dependencies
bun run install:all

# Setup environment
cp .env.example .env.prod
# Edit .env.prod with your configuration
```

### 2. 🏃 Local Development
```bash
# Start development mode (Next.js fullstack)
bun run dev

# Generate Prisma client and start development
bun run dev:full

# Database operations
bun run db:generate      # Generate Prisma client
bun run db:migrate       # Run migrations
bun run db:studio        # Open Prisma Studio
```

### 3. 🚀 Production Deployment
```bash
# Make deployment script executable
chmod +x sh/3pushauto.sh

# Run smart deployment
./sh/3pushauto.sh
```

---

## 🧠 Smart Deployment Features

### 🎯 **Deployment Options**

| Option | Description | Use Case |
|--------|-------------|----------|
| **Smart Deploy (Site & API)** | Updates frontend & backend only | Code updates, bug fixes |
| **Smart Deploy ALL** | Updates all services intelligently | Major updates, new features |
| **Deploy Only** | Skips git operations | Testing existing code |
| **Fresh Deploy** | Clean deployment with new env | Environment changes |
| **Selective Deploy** | Choose specific services | Targeted updates |

### 🔧 **Smart Features**
```bash
# Health Check System
✅ PostgreSQL: pg_isready validation
✅ Redis: PING response check  
✅ API/Site: Error log analysis
✅ MinIO: Health endpoint verification

# Intelligent Restart Logic
🧠 Only restart failed/unhealthy services
🟢 Keep healthy services running
⚡ Zero-downtime for stable services
```

---

## 💻 Development

### 📁 **Project Structure**
```
TazaCore/
├── 📂 site/                   # Next.js Fullstack Application
│   ├── src/
│   │   ├── app/              # App router & API routes
│   │   ├── components/       # Reusable components
│   │   ├── lib/              # Utilities & configs
│   │   └── types/            # TypeScript definitions
│   ├── prisma/               # Database schema & migrations
│   ├── Dockerfile
│   └── package.json
├── 📂 scripts/               # Deployment & Utility Scripts
│   ├── deploy-production.sh  # Production deployment
│   ├── generate-security.sh  # Security configuration
│   └── migrate-permissions-to-db.sh # Database migrations
├── 📂 sh/                     # Deployment Scripts
│   ├── 3pushauto.sh          # Smart deployment tool
│   └── 2envauto.sh           # Environment setup
├── 📂 docs/                   # Documentation
└── docker-compose.yml        # Service orchestration
```

### 🛠️ **Available Scripts**
```bash
# Development
bun run dev              # Start Next.js fullstack app
bun run dev:full         # Generate Prisma client and start dev

# Building
bun run build            # Build Next.js application
bun run build:check     # Type-check, lint, and build

# Testing
bun run test             # Run all tests
bun run test:e2e         # End-to-end tests

# Database
bun run db:generate      # Generate Prisma client
bun run db:migrate       # Run database migrations
bun run db:studio        # Open Prisma Studio
bun run db:seed:master   # Seed database with initial data

# Deployment
./sh/3pushauto.sh        # Smart deployment
./sh/2envauto.sh         # Environment setup
```

---

## 🚢 Deployment Guide

### 🌐 **Server Requirements**
- **OS**: Ubuntu 20.04+ / CentOS 8+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB+ SSD
- **Docker**: 24.0+
- **Docker Compose**: 2.0+

### 🔧 **Smart Deployment Workflow**

#### Step 1: Initial Setup
```bash
# Clone project on server
git clone https://github.com/chikiet/TazaCore.git
cd TazaCore

# Run environment setup
./sh/2envauto.sh
```

#### Step 2: Smart Deployment
```bash
# Run smart deployment tool
./sh/3pushauto.sh

# Choose deployment option:
# 1. Smart Deploy (Site & API) - Most common
# 2. Smart Deploy ALL - Full update
# 3. Deploy only - Skip git operations
# 4. Project cleanup - Fix issues
# 5. Check status - Monitor health
# 6. Fresh deploy - Clean environment
# 7. Selective deploy - Custom services
```

#### Step 3: Verification
```bash
# Check service health
docker ps --filter name="tazacore-"

# View logs
docker logs tazacore-api
docker logs tazacore-site

# Monitor resources
docker stats --filter name="tazacore-"
```

### 🔒 **Security Features**
- **Project-Scoped Operations** - Zero impact on other server services
- **Environment Isolation** - Separated configurations
- **Health Monitoring** - Continuous service validation
- **Rollback Support** - Environment backup & restore

---

## 📖 Documentation

### 📚 **Core Guides**
| Document | Description |
|----------|-------------|
| [🚀 Getting Started](docs/GETTING-STARTED.md) | Complete setup guide |
| [🏗️ Architecture](docs/guides/ARCHITECTURE.md) | System design & patterns |
| [💻 Development](docs/guides/DEVELOPMENT.md) | Local development setup |
| [🚢 Deployment](DEPLOYMENT-README.md) | Production deployment |

### 📋 **API References**
| API | Description |
|-----|-------------|
| [🔐 Auth API](docs/api/AUTH-API.md) | Authentication endpoints |
| [👥 HRM API](docs/api/HRM-API.md) | HR management endpoints |
| [⚙️ System API](docs/api/SYSTEM-API.md) | System operations |

### 🛠️ **Advanced Topics**
| Topic | Description |
|-------|-------------|
| [🧹 Troubleshooting](docs/troubleshooting/TROUBLESHOOTING.md) | Common issues & solutions |
| [🔧 Configuration](docs/guides/CONFIGURATION.md) | Advanced configurations |
| [📊 Monitoring](docs/guides/MONITORING.md) | Performance monitoring |

---

## 🎯 Live Demo

### 🌐 **Demo Environments**
- **Production**: `https://tazacore.example.com`
- **Staging**: `https://staging.tazacore.example.com`
- **API Docs**: `https://api.tazacore.example.com/docs`

### 📋 **Test Credentials**
```
Admin User:
Email: admin@tazacore.com
Password: admin123

Demo User:
Email: demo@tazacore.com  
Password: demo123
```

---

## 🔧 Management Commands

### 📊 **Monitoring Commands**
```bash
# Service status
docker ps --filter name="tazacore-"

# Service logs
docker logs tazacore-api --tail 100
docker logs tazacore-site --tail 100

# Resource usage
docker stats --filter name="tazacore-"

# Health checks
curl -f http://localhost:3000/health
curl -f http://localhost:8080/api/health
```

### 🛠️ **Maintenance Commands**
```bash
# Backup database
docker exec tazacore-postgres pg_dump -U postgres tazacore > backup.sql

# Restore database  
cat backup.sql | docker exec -i tazacore-postgres psql -U postgres tazacore

# Update SSL certificates
./sh/update-ssl.sh

# System cleanup
./sh/3pushauto.sh # Choose option 4 (Project cleanup)
```

---

## 🔐 Security

### 🛡️ **Security Features**
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **SQL Injection Protection** via TypeORM
- **XSS Protection** with CSP headers
- **Rate Limiting** on API endpoints
- **Environment Isolation** in deployment

### 🔒 **Best Practices**
- Regular security updates via smart deployment
- Encrypted data transmission (HTTPS/TLS)
- Secure session management
- Input validation & sanitization
- Audit logging for compliance

---

## 🤝 Contributing

### 🔧 **Development Setup**
```bash
# Fork and clone
git clone https://github.com/yourusername/TazaCore.git
cd TazaCore

# Install dependencies
bun install

# Create feature branch
git checkout -b feature/amazing-feature

# Start development
bun run dev
```

### 📝 **Contribution Guidelines**
- **Code Style**: Follow TypeScript best practices
- **Testing**: Add tests for new features
- **Documentation**: Update docs for new features  
- **Commits**: Use conventional commit messages
- **Reviews**: All PRs require review

### 🧪 **Testing**
```bash
# Run all tests
bun run test

# Run with coverage
bun run test:cov

# E2E testing
bun run test:e2e

# Lint code
bun run lint
```

---

## 📞 Support & Community

### 💬 **Get Help**
- **Issues**: [GitHub Issues](https://github.com/chikiet/TazaCore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/chikiet/TazaCore/discussions)
- **Email**: support@tazacore.com
- **Discord**: [TazaCore Community](https://discord.gg/tazacore)

### 📚 **Resources**
- **Documentation**: [docs.tazacore.com](https://docs.tazacore.com)
- **API Reference**: [api.tazacore.com](https://api.tazacore.com)
- **Blog**: [blog.tazacore.com](https://blog.tazacore.com)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **NestJS Team** - For the powerful backend framework  
- **Docker Team** - For containerization technology
- **Bun Team** - For the fast JavaScript runtime
- **Open Source Community** - For endless inspiration

---

<div align="center">

**Made with ❤️ by the TazaCore Team**

[![GitHub stars](https://img.shields.io/github/stars/chikiet/TazaCore?style=social)](https://github.com/chikiet/TazaCore/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/chikiet/TazaCore?style=social)](https://github.com/chikiet/TazaCore/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/chikiet/TazaCore?style=social)](https://github.com/chikiet/TazaCore/watchers)

[⬆ Back to top](#-tazacore---advanced-full-stack-development-platform)

</div>