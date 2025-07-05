# 🚀 KataCore Enterprise Platform

<div align="center">

**Production-ready full-stack platform with automated deployment & Human Resource Management**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/chikiet/KataCore)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-1.0+-yellow.svg)](https://bun.sh)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://docker.com)
[![Next.js](https://img.shields.io/badge/next.js-15.3.5-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/nestjs-11.1.3-red.svg)](https://nestjs.com)

[🚀 Quick Start](#-quick-start) • 
[📖 Documentation](#-documentation) • 
[🌟 Features](#-features) • 
[🎯 Live Demo](#-live-demo) • 
[🤝 Contributing](#-contributing)

</div>

---

## 📋 Overview

**KataCore** is a modern enterprise platform that combines cutting-edge technology with practical business solutions. Built with Next.js 15, React 19, NestJS 11, and powered by Bun.js, it delivers a complete full-stack experience with automated deployment capabilities.

### 🎯 What Makes KataCore Special

- **🏢 Complete HRM System** - Full-featured Human Resource Management with employee lifecycle, departments, and role-based access
- **🚀 One-Command Deployment** - Deploy to any server with automated SSL, Docker orchestration, and environment setup  
- **⚡ Ultra-Fast Development** - Bun.js runtime with Turbopack for lightning-fast builds and hot reloading
- **🔒 Enterprise Security** - JWT authentication, role-based permissions, and automated security configurations
- **🐳 Cloud-Ready Architecture** - Containerized services with PostgreSQL, Redis, MinIO, and monitoring

---

## 🌟 Features

### 🏢 Human Resource Management System
- **👥 Employee Lifecycle Management** - Complete CRUD operations with status tracking (Active, Probation, Leave, Terminated)
- **🏛️ Organizational Structure** - Multi-level departments with hierarchical management and budget tracking
- **🔑 Role-Based Access Control** - Granular permissions system with manager overrides and department-specific access
- **📊 Comprehensive Data Management** - Automated seeding with 7 employees, 3 departments, and realistic test data
- **🔐 Secure Authentication** - JWT-based login with bcrypt password hashing and session management
- **📱 Modern Interface** - React-based UI with Material-UI components and responsive design

### 🚀 Platform Infrastructure
- **⚛️ Next.js 15 Frontend** - Latest React 19 with Turbopack, App Router, and TypeScript
- **🏗️ NestJS 11 Backend** - Scalable API with Prisma ORM, dependency injection, and modular architecture
- **⚡ Bun.js Runtime** - Ultra-fast JavaScript runtime for both frontend and backend development
- **🗄️ Production Database** - PostgreSQL with Redis caching and MinIO object storage
- **🔧 Development Tools** - Hot reloading, TypeScript support, ESLint, and automated testing

### 🚀 Automated Deployment System
- **🎯 One-Command Deploy** - Deploy to any server with single command
- **🔒 Automated SSL** - Let's Encrypt certificates with auto-renewal
- **🐳 Docker Orchestration** - Multi-container setup with health checks
- **🌐 Nginx Proxy** - Reverse proxy with subdomain routing
- **📊 Monitoring Stack** - Optional Grafana and Prometheus integration
- **🔐 Security Hardening** - Automated firewall, SSH key management, and system updates
- **🗄️ PostgreSQL Database** - Production-ready with Redis caching and MinIO object storage
- **🐳 Docker Orchestration** - Complete containerized stack with health monitoring and auto-restart

### 🎯 Deployment & DevOps
- **🔄 Automated Deployment** - One-command deployment with SSH key generation and environment setup
- **🔒 SSL Certificate Management** - Automatic Let's Encrypt certificates with domain configuration
- **📊 Health Monitoring** - Built-in health checks, logging, and service status monitoring
- **🛡️ Security-First Design** - Auto-generated passwords, secure configurations, and production hardening
- **🌐 Multi-Environment Support** - Development, staging, and production configurations with environment-specific settings

---

## 🏗️ Technology Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 15, React 19, TypeScript, Tailwind CSS 4, Material-UI</td>
</tr>
---

## 🚀 Quick Start

### Prerequisites
- **Bun.js** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **Docker** & **Docker Compose** ([Install Docker](https://docs.docker.com/get-docker/))
- **Node.js** >= 18.0.0 (for compatibility)

### 1. Clone & Install
```bash
git clone https://github.com/chikiet/KataCore.git
cd KataCore
bun install:all
```

### 2. Environment Setup
```bash
# Copy environment templates
cp site/.env.example site/.env.local
cp api/.env.example api/.env

# Generate security keys
bun run security:generate
```

### 3. Database Setup
```bash
# Start database services
bun run docker:up

# Setup database schema
cd api && bun run prisma:migrate
cd api && bun run prisma:seed
```

### 4. Start Development
```bash
# Start both frontend and backend
bun run dev

# Or start individually
bun run dev:site  # Frontend on http://localhost:3000
bun run dev:api   # Backend on http://localhost:3001
```

### 5. Production Deployment
```bash
# Quick deployment to server
./quick-deploy-enhanced.sh

# Or interactive deployment wizard
./deploy-wizard.sh

# Or professional deployment with options
./deploy-production.sh --help
```

---

## 📖 Documentation

### 📚 Core Guides
- [**🚀 Quick Start Guide**](docs/guides/QUICK-START.md) - Get up and running in 5 minutes
- [**🏗️ Architecture Overview**](docs/guides/ARCHITECTURE.md) - System design and components
- [**🔧 Development Guide**](docs/guides/DEVELOPMENT.md) - Development workflow and best practices
- [**📦 Deployment Guide**](docs/guides/DEPLOYMENT-GUIDE.md) - Complete deployment instructions

### 📋 API References
- [**🏢 HRM API**](docs/api/HRM-API.md) - Employee and department management endpoints
- [**🔐 Authentication API**](docs/api/AUTH-API.md) - JWT authentication and authorization
- [**🔧 System API**](docs/api/SYSTEM-API.md) - Health checks and system information

### 🛠️ Advanced Topics
- [**🔒 Security Configuration**](docs/security/SECURITY.md) - Security best practices and hardening
- [**📊 Monitoring Setup**](docs/monitoring/MONITORING.md) - Grafana, Prometheus, and logging
- [**🐳 Docker Configuration**](docs/docker/DOCKER.md) - Container orchestration and customization
- [**🚀 CI/CD Pipeline**](docs/cicd/PIPELINE.md) - Automated testing and deployment

---

## 🎯 Live Demo

### 🌐 Production Instance
- **Main App**: [http://116.118.48.143:3000](http://116.118.48.143:3000)
- **API Endpoint**: [http://116.118.48.143:3001](http://116.118.48.143:3001)
- **Database Admin**: [http://116.118.48.143:5050](http://116.118.48.143:5050)
- **File Storage**: [http://116.118.48.143:9000](http://116.118.48.143:9000)

### 🔑 Demo Credentials
```
Admin User:
- Email: admin@katacore.com
- Password: Admin123!

Manager User:
- Email: manager@katacore.com
- Password: Manager123!

Employee User:
- Email: employee@katacore.com
- Password: Employee123!
```

### 📱 Test Features
- **Employee Management** - Create, update, and manage employee records
- **Department Structure** - Organize employees into departments with hierarchies
- **Role-Based Access** - Test different permission levels
- **Authentication Flow** - Login/logout and session management
- **API Integration** - Explore REST API endpoints

---

## 🏗️ Architecture

### 🔧 Technology Stack
```
Frontend (site/)
├── Next.js 15 (App Router)
├── React 19 (Server Components)
├── TypeScript 5.7
├── Tailwind CSS 4.0
├── Material-UI 7.0
└── Bun.js Runtime

Backend (api/)
├── NestJS 11 (Modular Architecture)
├── Prisma ORM (Database)
├── JWT Authentication
├── TypeScript 5.7
├── Swagger/OpenAPI
└── Bun.js Runtime

Infrastructure
├── PostgreSQL 15 (Database)
├── Redis 7 (Caching)
├── MinIO (Object Storage)
├── Docker Compose
├── Nginx (Reverse Proxy)
└── Let's Encrypt (SSL)
```

### 🏛️ Project Structure
```
KataCore/
├── 📁 site/                  # Next.js Frontend
│   ├── src/app/               # App Router pages
│   ├── src/components/        # React components
│   ├── src/lib/              # Utilities & configs
│   └── prisma/               # Database client
├── 📁 api/                   # NestJS Backend
│   ├── src/                  # Source code
│   ├── prisma/               # Database schema
│   └── dist/                 # Build output
├── 📁 deployment/            # Deployment scripts
│   ├── scripts/              # Automation scripts
│   ├── configs/              # Server configurations
│   └── templates/            # Config templates
├── 📁 docs/                  # Documentation
│   ├── guides/               # User guides
│   ├── api/                  # API documentation
│   └── examples/             # Code examples
└── 📁 scripts/               # Development scripts
    ├── setup/                # Initial setup
    ├── deployment/           # Deployment helpers
    └── maintenance/          # Maintenance tasks
```

### Prerequisites
- **Bun.js** v1.0+ ([Install Bun](https://bun.sh))
- **Docker** & **Docker Compose** (for deployment)
- **Git** for version control
- **Linux/macOS** (Windows with WSL2)

### 1. 📥 Clone & Setup
```bash
# Clone the repository
git clone https://github.com/chikiet/KataCore.git
cd KataCore

# Install all dependencies (frontend + backend)
bun run install:all

# Generate environment files
cp .env.example .env
```

### 2. 🏃 Local Development
```bash
# Start both frontend and backend
bun run dev

# Or start individually
bun run dev:site    # Frontend: http://localhost:3000
bun run dev:api     # Backend: http://localhost:3001
```

**Development URLs:**
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:3001
- ❤️ **Health Check**: http://localhost:3001/health
- 🏢 **HRM System**: http://localhost:3000/hr

### 3. 🎯 HRM System Setup
```bash
# Seed database with test data
curl -X POST http://localhost:3001/api/seed/hrm

# Login with test credentials
# HR Manager: hr.manager@company.com / hr123456
# IT Manager: it.manager@company.com / it123456
# Sales Manager: sales.manager@company.com / sales123456
```

### 4. 🚀 Production Deployment

#### Option 1: Quick Deploy (Recommended)
```bash
# Deploy to any server with one command
./quick-deploy-enhanced.sh

# Follow interactive prompts for:
# - Server IP configuration
# - Domain and SSL setup
# - Service selection
# - Environment configuration
```

## 📖 Documentation

### 🏢 HRM System Features

#### 👥 Employee Management
- **Complete CRUD Operations** - Create, read, update, and delete employee records
- **Status Tracking** - Active, Inactive, Terminated, On Leave, Probation
- **Contract Types** - Full-time, Part-time, Contract, Internship, Freelance
- **Personal & Professional Info** - Contact details, emergency contacts, job history
- **Salary & Compensation** - Salary tracking with history and adjustments

#### 🏛️ Organizational Structure
- **Department Hierarchies** - Multi-level departments with parent-child relationships
- **Position Management** - Job roles with levels, responsibilities, and requirements
- **Manager Assignments** - Clear reporting structure and team management
- **Budget Tracking** - Department budgets and resource allocation

#### 🔑 Security & Permissions
- **Role-Based Access Control** - Granular permissions for different user types
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Password Security** - bcrypt hashing with configurable salt rounds
- **Session Management** - Automatic token expiration and renewal

### 🚀 Deployment Options

#### 🎯 Development Mode
- **Local Environment** - SQLite database with hot reloading
- **Test Data** - Automated seeding with realistic employee data
- **Development Tools** - Prisma Studio, API testing, and debugging

#### 🌐 Production Deployment
- **Automated Setup** - One-command deployment with environment generation
- **SSL Certificates** - Automatic Let's Encrypt certificates with renewal
- **Docker Orchestration** - Multi-container setup with health monitoring
- **Security Hardening** - Production-ready configurations and secrets

#### 🔧 Infrastructure Services
- **PostgreSQL** - Primary database with backup and replication
- **Redis** - Caching and session storage
- **MinIO** - S3-compatible object storage for file uploads
- **pgAdmin** - Web-based database administration
- **Nginx** - Reverse proxy with SSL termination

---

## 📋 Available Scripts

### 🛠️ Development
```bash
bun run dev          # Start both frontend and backend
bun run dev:site     # Frontend only (Next.js)
bun run dev:api      # Backend only (NestJS)
bun run build        # Build for production
bun run test         # Run test suite
bun run lint         # Code quality checks
```

### 🚀 Deployment
```bash
# Interactive deployment
./quick-deploy-enhanced.sh          # Enhanced quick deploy
./deploy-wizard.sh                  # Step-by-step wizard
./deploy-production.sh              # Enterprise deployment

# Direct deployment
./deploy-remote-fixed.sh --simple SERVER_IP          # Simple mode
./deploy-remote-fixed.sh SERVER_IP DOMAIN            # Full mode with SSL
```

### 🗄️ Database Management
```bash
cd api && bun run prisma:generate   # Generate Prisma client
cd api && bun run prisma:migrate    # Run migrations
cd api && bun run prisma:studio     # Open database admin
cd api && bun run prisma:seed       # Seed with test data
```

### 🐳 Docker Operations
```bash
bun run docker:up      # Start local Docker stack
bun run docker:down    # Stop Docker services
bun run docker:logs    # View service logs
```

---

## 🎯 API Reference

### 🔐 Authentication
```bash
POST /api/auth/login     # User login with JWT tokens
POST /api/auth/logout    # Logout and token invalidation
POST /api/auth/refresh   # Token refresh for extended sessions
```

### 👥 Employee Management
```bash
GET    /api/hrm/employees        # List employees (paginated)
POST   /api/hrm/employees        # Create new employee
GET    /api/hrm/employees/:id    # Get employee details
PUT    /api/hrm/employees/:id    # Update employee
DELETE /api/hrm/employees/:id    # Delete employee
```

### 🏛️ Department Management
```bash
GET    /api/hrm/departments      # List all departments
POST   /api/hrm/departments      # Create department
PUT    /api/hrm/departments/:id  # Update department
DELETE /api/hrm/departments/:id  # Delete department
```

### 🔑 Role & Permissions
```bash
GET    /api/hrm/roles           # List roles with permissions
POST   /api/hrm/roles           # Create new role
PUT    /api/hrm/roles/:id       # Update role permissions
DELETE /api/hrm/roles/:id       # Delete role
```

### 📊 Data Seeding
```bash
POST /api/seed/hrm              # Seed database with test data
```

---

## 🔧 Configuration

### 🌍 Environment Variables
KataCore automatically generates secure environment variables during deployment:

```bash
# Application Configuration
NODE_ENV=production
API_VERSION=latest
SITE_VERSION=latest

# Database Configuration  
DATABASE_URL=postgresql://user:pass@postgres:5432/katacore
POSTGRES_DB=katacore
POSTGRES_USER=katacore
POSTGRES_PASSWORD=<auto-generated>

# Authentication & Security
JWT_SECRET=<auto-generated-64-char>
ENCRYPTION_KEY=<auto-generated-32-char>

# Redis Cache
REDIS_URL=redis://:password@redis:6379
REDIS_PASSWORD=<auto-generated>

# MinIO Object Storage
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<auto-generated>
MINIO_ENDPOINT=minio
MINIO_PORT=9000

# Application URLs
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### 🔐 Security Configuration
- **Automated Password Generation** - Cryptographically secure random passwords
- **SSL Certificate Management** - Automatic Let's Encrypt integration
- **CORS Configuration** - Proper cross-origin resource sharing setup
- **Security Headers** - Production-ready security headers and configurations

---

## 📊 Monitoring & Maintenance

### 🔍 Health Monitoring
```bash
# Check service status
docker compose ps

# View real-time logs
docker compose logs -f

# Monitor resource usage
docker stats

# Check API health
curl https://yourdomain.com/api/health
```

### 🔄 Updates & Maintenance
```bash
# Update application
git pull
./deploy-remote-fixed.sh SERVER_IP DOMAIN

# Force environment regeneration
./deploy-remote-fixed.sh --force-regen SERVER_IP DOMAIN

# Clean deployment (removes old data)
./deploy-remote-fixed.sh --cleanup SERVER_IP
```

### 💾 Backup & Recovery
```bash
# Database backup
docker compose exec postgres pg_dump -U katacore katacore > backup.sql

# Restore from backup
docker compose exec -T postgres psql -U katacore -d katacore < backup.sql

# Full system backup
tar -czf katacore-backup-$(date +%Y%m%d).tar.gz /opt/katacore/
```

---

## 🚨 Troubleshooting

### 🔧 Common Development Issues

#### Dependencies Installation
```bash
# Clear and reinstall dependencies
bun run clean
bun run install:all
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill processes if needed
sudo kill -9 <PID>
```

#### Database Issues
```bash
# Reset Prisma client
cd api && bun run prisma:generate

# Reset database (development only)
cd api && bun run prisma:reset
```

### 🚀 Common Deployment Issues

#### SSH Connection Problems
```bash
# Test SSH connection
ssh -i ~/.ssh/default root@SERVER_IP

# Fix SSH permissions
chmod 600 ~/.ssh/default
chmod 644 ~/.ssh/default.pub
```

#### Service Startup Issues
```bash
# Check container logs
docker compose logs service_name

# Restart specific service
docker compose restart service_name

# Full restart
docker compose down && docker compose up -d
```

#### SSL Certificate Issues
```bash
# Check certificate status
openssl s_client -connect yourdomain.com:443

# Force certificate renewal
certbot renew --force-renewal
```

---

## 🌍 Cloud Provider Support

KataCore is tested and supported on:

- **✅ DigitalOcean** - Droplets and Kubernetes
- **✅ AWS** - EC2, ECS, and Lambda
- **✅ Google Cloud** - Compute Engine and Cloud Run
- **✅ Azure** - Virtual Machines and Container Instances
- **✅ Linode** - Compute Instances
- **✅ Vultr** - Cloud Compute
- **✅ Hetzner** - Cloud Servers

### 📋 Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🔧 Development Setup
```bash
# Fork and clone
git clone https://github.com/yourusername/KataCore.git
cd KataCore

# Install dependencies
bun run install:all

# Create feature branch
git checkout -b feature/amazing-feature

# Start development
bun run dev
```

### 📝 Contribution Guidelines
- **Code Style**: Follow TypeScript best practices and ESLint rules
- **Testing**: Add tests for new features and API endpoints
- **Documentation**: Update documentation for new features
- **Commits**: Use conventional commit messages
- **Reviews**: All PRs require review and passing tests

### 🧪 Testing
```bash
# Run all tests
bun run test

# Run with coverage
cd api && bun run test:cov

# Test deployment
./test-deployment.sh

# Lint code
bun run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Community

<div align="center">

### 🆘 Getting Help

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red.svg)](https://github.com/chikiet/KataCore/issues)
[![GitHub Discussions](https://img.shields.io/badge/GitHub-Discussions-blue.svg)](https://github.com/chikiet/KataCore/discussions)
[![Documentation](https://img.shields.io/badge/Docs-Available-green.svg)](https://docs.katacore.com)

**📧 Email**: support@katacore.com  
**💬 Community**: [Join our Discord](https://discord.gg/katacore)  
**📚 Documentation**: [docs.katacore.com](https://docs.katacore.com)

</div>

### 🎯 Quick Help Commands
```bash
./deploy-remote-fixed.sh --help     # Deployment help
./test-deployment.sh                # Validate configuration
bun run dev                         # Start development
curl http://localhost:3001/health   # Test API
```

---

<div align="center">

### 🚀 Ready to Deploy?

**Quick Start**: `./quick-deploy-enhanced.sh`

**Full Deploy**: `./deploy-production.sh SERVER_IP DOMAIN.COM`

---

**⭐ Star us on GitHub** • **🐛 Report Issues** • **💡 Request Features**

**Made with ❤️ by the KataCore Team**

*Deploy once, scale everywhere!*

</div>


