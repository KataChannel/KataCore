# 🚀 KataCore StartKit v1

> **Production-ready full-stack application with automated deployment**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/chikiet/KataCore)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-1.0+-yellow.svg)](https://bun.sh)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://docker.com)
[![Next.js](https://img.shields.io/badge/next.js-15.3.4-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/nestjs-11.1.3-red.svg)](https://nestjs.com)

**KataCore StartKit v1** is a modern full-stack application built with Next.js 15, React 19, NestJS 11, and Bun.js. It provides automated remote deployment with Docker, SSL support, and production-ready infrastructure out of the box.

## 🌟 Features

### Full-Stack Application
- 🚀 **Next.js 15** - Modern React framework with Turbopack for ultra-fast development
- ⚛️ **React 19** - Latest React with improved concurrent features
- 🎨 **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- 🏗️ **NestJS 11** - Scalable TypeScript backend framework
- ⚡ **Bun.js Runtime** - Ultra-fast JavaScript runtime for both frontend and backend
- 🗄️ **Prisma ORM** - Type-safe database access with PostgreSQL
- 🔐 **Authentication** - JWT-based auth with bcrypt password hashing

### Database & Infrastructure
- 🐘 **PostgreSQL** - Robust relational database with full SQL support
- 🗃️ **Redis** - High-performance caching and session storage
- 📦 **MinIO** - S3-compatible object storage for file uploads
- 🔧 **pgAdmin** - Web-based PostgreSQL administration
- 📊 **Health Monitoring** - Built-in health checks for all services

### Development & Deployment
- 🎯 **Remote Deployment** - One-command deployment to any server
- 🔒 **Auto-SSL Configuration** - Let's Encrypt certificates with auto-renewal
- 🛡️ **Security-First** - Auto-generated secure passwords and secrets
- 🚀 **Two Deployment Modes** - Simple (IP-based) and Full (Domain + SSL)
- 🐳 **Docker Stack** - Complete containerized deployment
- 🧹 **Easy Cleanup** - Simple cleanup of remote deployments
- 📝 **TypeScript** - Full type safety across the stack

## 🏗️ Technology Stack

| Layer | Component | Technology | Version | Purpose |
|-------|-----------|------------|---------|---------|
| **Frontend** | Web Framework | Next.js | 15.3.4 | React-based web framework with SSR/SSG |
| | UI Library | React | 19.0.0 | Modern UI library with concurrent features |
| | Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| | Build Tool | Turbopack | Latest | Ultra-fast bundler for development |
| **Backend** | API Framework | NestJS | 11.1.3 | Scalable TypeScript framework |
| | Runtime | Bun.js | 1.x | High-performance JavaScript runtime |
| | Database ORM | Prisma | 5.20.0 | Type-safe database client |
| | Authentication | JWT + bcryptjs | 9.0.2 + 2.4.3 | Secure token-based authentication |
| **Database** | Primary DB | PostgreSQL | 15-alpine | Reliable relational database |
| | Cache/Session | Redis | 7-alpine | In-memory data structure store |
| | Object Storage | MinIO | Latest | S3-compatible file storage |
| | DB Admin | pgAdmin | Latest | Web-based PostgreSQL management |
| **Infrastructure** | Containerization | Docker | Latest | Application containerization |
| | Orchestration | Docker Compose | Latest | Multi-container deployment |
| | Reverse Proxy | Nginx | Latest | Load balancing and SSL termination |
| | SSL Certificates | Let's Encrypt | Latest | Free SSL certificate automation |

## 🚀 Quick Start

### Prerequisites
- **Bun.js** (v1.0+) - [Install Bun](https://bun.sh)
- **Docker** & **Docker Compose** (for deployment)
- **Node.js** (v18+) as fallback runtime
- **Git** for version control

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/chikiet/KataCore.git
cd KataCore

# Make deployment script executable
chmod +x deploy-remote.sh

# Install all dependencies (frontend + backend)
bun run install:all
```

### 2. Local Development
```bash
# Start both frontend and backend in development mode
bun run dev

# Or start individually
bun run dev:site    # Frontend (Next.js) on http://localhost:3000
bun run dev:api     # Backend (NestJS) on http://localhost:3001
```

**Development URLs:**
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:3001
- ❤️ **Health Check**: http://localhost:3001/health

### 3. Build for Production
```bash
# Build both applications
bun run build

# Or build individually
bun run build:site  # Build Next.js application
bun run build:api   # Build NestJS application
```

### 4. Remote Deployment 🚀

**For deployment to remote servers:**

#### SSH Key Setup 🔑
```bash
# Generate SSH key for deployment
./ssh-keygen-setup.sh

# Generate key with custom name and server configuration
./ssh-keygen-setup.sh --name myproject-key --server 116.118.85.41 --user ubuntu

# Generate RSA key with custom bits
./ssh-keygen-setup.sh --type rsa --bits 4096 --copy-key

# Force overwrite existing key
./ssh-keygen-setup.sh --force --name existing-key
```

#### Simple Deployment (IP-based)
```bash
# Deploy to server with IP only (no SSL)
./deploy-remote.sh --simple SERVER_IP mydomain.com
```

#### Full Deployment (Domain + SSL)
```bash
# Deploy to server with domain and SSL
./deploy-remote.sh SERVER_IP mydomain.com
```

#### Advanced Options
```bash
# Custom SSH user and key
./deploy-remote.sh --user ubuntu --key ~/.ssh/my-key.pem SERVER_IP mydomain.com

# Force regenerate environment variables
./deploy-remote.sh --force-regen SERVER_IP mydomain.com

# Custom project name
./deploy-remote.sh --project myproject SERVER_IP mydomain.com
```

#### Cleanup Deployment
```bash
# Remove deployment from remote server
./deploy-remote.sh --cleanup SERVER_IP
```

**Requirements for remote deployment:**
- SSH access to remote server
- Docker & Docker Compose on remote server (auto-installed)
- Domain name (for full deployment with SSL)

## 🎯 Deployment Options

### Development Mode (Local)
```bash
# Start development servers
bun run dev  # Both frontend + backend
```
**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:3001/health

### Simple Deployment (IP-based)
```bash
./deploy-remote.sh --simple SERVER_IP DOMAIN
```
**Features:**
- ✅ Docker containers only
- ✅ IP address access
- ✅ No SSL configuration
- ✅ Perfect for staging/testing

**Access:**
- Site: `http://SERVER_IP:3000`
- API: `http://SERVER_IP:3001`
- MinIO: `http://SERVER_IP:9000`
- pgAdmin: `http://SERVER_IP:5050`

### Full Deployment (Production)
```bash
./deploy-remote.sh SERVER_IP DOMAIN
```
**Features:**
- ✅ Docker containers + Nginx
- ✅ Domain with SSL certificates
- ✅ Production-ready configuration
- ✅ Security headers and optimizations

**Access:**
- Site: `https://yourdomain.com`
- API: `https://yourdomain.com/api`
- MinIO: `https://yourdomain.com/minio`
- pgAdmin: `https://yourdomain.com/pgadmin`

## 🏛️ Application Architecture

### Project Structure
```
KataCore/
├── 📁 api/                     # NestJS Backend API
│   ├── 📄 Dockerfile          # API container configuration
│   ├── 📄 package.json        # API dependencies
│   ├── 📄 tsconfig.json       # TypeScript configuration
│   ├── 📄 nest-cli.json       # NestJS CLI configuration
│   ├── 📄 index.ts            # Additional entry point
│   ├── 📄 .gitignore          # Git ignore for API
│   ├── 📄 bun.lock            # Bun lockfile for API
│   ├── 📁 prisma/             # Database schema & migrations
│   │   └── 📄 schema.prisma   # Prisma database schema
│   └── 📁 src/                # API source code
│       ├── 📄 main.ts         # Application entry point
│       ├── 📄 app.module.ts   # Root module
│       ├── 📄 app.controller.ts # Main controller
│       └── 📄 app.service.ts  # Main service
├── 📁 site/                   # Next.js Frontend
│   ├── 📄 Dockerfile          # Frontend container configuration
│   ├── 📄 package.json        # Frontend dependencies
│   ├── 📄 next.config.ts      # Next.js configuration
│   ├── 📄 tailwind.config.ts  # Tailwind CSS configuration
│   ├── 📄 eslint.config.mjs   # ESLint configuration
│   ├── 📄 postcss.config.mjs  # PostCSS configuration
│   ├── 📄 next-env.d.ts       # Next.js TypeScript definitions
│   ├── 📄 tsconfig.json       # TypeScript configuration
│   ├── 📄 .gitignore          # Git ignore for frontend
│   ├── 📄 bun.lock            # Bun lockfile for frontend
│   ├── 📁 public/             # Static assets
│   │   ├── 📄 next.svg        # Next.js logo
│   │   ├── 📄 vercel.svg      # Vercel logo
│   │   ├── 📄 file.svg        # File icon
│   │   ├── 📄 globe.svg       # Globe icon
│   │   └── 📄 window.svg      # Window icon
│   └── 📁 src/                # Frontend source code
│       ├── 📁 app/            # App Router pages
│       │   ├── 📄 page.tsx    # Home page
│       │   ├── 📄 layout.tsx  # Root layout
│       │   ├── 📄 globals.css # Global styles
│       │   └── 📄 favicon.ico # Site favicon
│       └── 📁 components/     # React components
│           └── 📄 ApiTest.tsx # API integration test
├── 📄 package.json            # Root package.json (workspace)
├── 📄 bun.lock               # Bun lockfile
├── 📄 .env.example           # Environment variables template
├── 📄 .env                   # Environment variables (local)
├── 📄 .gitignore             # Git ignore rules
├── 📄 docker-compose.startkitv1.yml # Full deployment stack
├── 📄 deploy-remote.sh        # Deployment automation script
├── 📄 ssh-keygen-setup.sh     # SSH key generation and setup
├── 📄 generate-security.sh    # Security configuration generator
├── 📄 test-deployment.sh      # Deployment testing script
├── 📄 CHANGELOG.md           # Version history
├── 📄 LICENSE                # MIT License
└── 📄 README.md              # This file
```

### API Endpoints
- `GET /` - Welcome message from KataCore API
- `GET /health` - Health check endpoint with service status
- Authentication endpoints (JWT-based) - *Ready for implementation*
- RESTful CRUD operations with Prisma ORM - *Ready for implementation*

### Database Schema (Prisma)
- **Users** - User management with roles and authentication
- **Posts** - Content management with publishing workflow
- **Comments** - Nested commenting system
- **Likes** - Post engagement tracking
- **Tags** - Content categorization
- **Sessions** - User session management
- **File Uploads** - Media file tracking

## 📋 Available Scripts

### Development Scripts
```bash
# Install dependencies for all packages
bun run install:all

# Development mode (both frontend + backend)
bun run dev
bun run dev:site    # Frontend only (Next.js)
bun run dev:api     # Backend only (NestJS)

# Build applications
bun run build       # Build both applications
bun run build:site  # Build Next.js frontend
bun run build:api   # Build NestJS backend

# Production mode
bun run start       # Start both in production mode
bun run start:site  # Start Next.js in production
bun run start:api   # Start NestJS in production

# Code quality
bun run lint        # Lint both applications
bun run lint:site   # Lint Next.js code
bun run lint:api    # Lint NestJS code

# Testing
bun run test        # Run API tests
./test-deployment.sh # Test deployment script and project structure

# Cleanup
bun run clean       # Remove node_modules and build artifacts
```

### Deployment Scripts
```bash
# Remote deployment using npm scripts
bun run deploy:remote  # Full remote deployment
bun run deploy:simple  # Simple IP-based deployment
bun run deploy:cleanup # Cleanup remote deployment

# Direct script usage
./deploy-remote.sh SERVER_IP mydomain.com          # Full deployment
./deploy-remote.sh --simple SERVER_IP mydomain.com # Simple deployment
./deploy-remote.sh --cleanup SERVER_IP               # Cleanup

# Test deployment functionality
./test-deployment.sh   # Run deployment tests
```

### Docker Scripts
```bash
# Local Docker development
bun run docker:up   # Start all services with Docker Compose
bun run docker:down # Stop all Docker services
bun run docker:logs # View Docker logs

# Individual Docker builds
cd api && bun run docker:build   # Build API Docker image
cd api && bun run docker:run     # Run API in Docker
```

### Database Scripts (API directory)
```bash
cd api

# Prisma commands
bun run prisma:generate  # Generate Prisma client
bun run prisma:migrate   # Run database migrations
bun run prisma:deploy    # Deploy migrations (production)
bun run prisma:reset     # Reset database (development)
bun run prisma:studio    # Open Prisma Studio
bun run prisma:seed      # Seed database with sample data
```

### Testing Scripts
```bash
# Run deployment tests
./test-deployment.sh    # Test deployment script functionality

# Run API tests
bun run test           # Run NestJS API tests
cd api && bun run test:watch  # Run tests in watch mode
cd api && bun run test:cov    # Run tests with coverage
```

## 🔧 Environment Variables

Environment variables are automatically generated during deployment. You can customize them by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Core Application Variables
```bash
# Application Configuration
NODE_ENV=production
API_VERSION=latest
SITE_VERSION=latest
RESTART_POLICY=unless-stopped

# Port Configuration
PORT=3000
SITE_PORT=3000
API_PORT=3001

# Database Configuration
POSTGRES_DB=katacore
POSTGRES_USER=katacore
POSTGRES_PASSWORD=<auto-generated-secure-password>
DATABASE_URL=postgresql://katacore:${POSTGRES_PASSWORD}@postgres:5432/katacore

# Redis Configuration
REDIS_PASSWORD=<auto-generated-secure-password>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Authentication & Security
JWT_SECRET=<auto-generated-64-char-secret>
ENCRYPTION_KEY=<auto-generated-32-char-key>
LOG_LEVEL=info

# MinIO Object Storage
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=<auto-generated-secure-password>
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=${MINIO_ROOT_PASSWORD}
MINIO_USE_SSL=false

# pgAdmin Configuration
PGLADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=admin@localhost
PGADMIN_DEFAULT_PASSWORD=<auto-generated-secure-password>
```

### Deployment Configuration
```bash
# API Configuration
CORS_ORIGIN=https://yourdomain.com
INTERNAL_API_URL=http://api:3001

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Domain & SSL Configuration
DOMAIN=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
SERVER_IP=SERVER_IP

# Deployment Type
DEPLOY_TYPE=production
```

### Development Configuration
```bash
# Development Configuration (automatically set)
NODE_ENV=development
API_PORT=3001
SITE_PORT=3000

# Local database (when using Docker for development)
DATABASE_URL=postgresql://katacore:password@localhost:5432/katacore
REDIS_URL=redis://localhost:6379

# Development API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
INTERNAL_API_URL=http://localhost:3001
```

### Production Environment Variables
All production environment variables are automatically generated during deployment with secure random values.

## 🛠️ Development Workflow

### Local Development
```bash
# 1. Start development environment
bun run dev

# 2. Make your changes to:
#    - Frontend: site/src/
#    - Backend: api/src/
#    - Database: api/prisma/schema.prisma

# 3. Test changes
./test-deployment.sh   # Test deployment configuration
bun run test          # Run API unit tests
bun run lint          # Check code quality

# 4. Build for production
bun run build
```

### Database Management
```bash
# Generate Prisma client
cd api && bun run prisma:generate

# Create migration
cd api && bun run prisma:migrate --name your-migration

# Deploy to production (automatic during deployment)
cd api && bun run prisma:deploy

# Open Prisma Studio for database management
cd api && bun run prisma:studio
```

### Testing & Quality Assurance
```bash
# Run deployment tests
./test-deployment.sh

# Run API tests
cd api && bun run test

# Run tests with coverage
cd api && bun run test:cov

# Lint code
bun run lint

# Format code
cd api && bun run format
```

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# View service status
docker-compose -f docker-compose.startkitv1.yml ps

# Real-time logs
docker-compose -f docker-compose.startkitv1.yml logs -f

# Check individual service logs
docker-compose -f docker-compose.startkitv1.yml logs service_name
```

### Updates & Maintenance
```bash
# Update application code
git pull
./deploy-remote.sh SERVER_IP mydomain.com

# Clean deployment (removes old data)
./deploy-remote.sh --cleanup SERVER_IP
./deploy-remote.sh --force-regen SERVER_IP mydomain.com
```

### Backup & Recovery
```bash
# Manual backup
docker-compose -f docker-compose.startkitv1.yml exec postgres pg_dump -U katacore katacore > backup.sql

# Restore backup
docker-compose -f docker-compose.startkitv1.yml exec -T postgres psql -U katacore -d katacore < backup.sql
```

## 🚨 Troubleshooting

### Common Development Issues

1. **Dependencies installation fails**
   ```bash
   # Clear all node modules and reinstall
   bun run clean
   bun run install:all
   ```

2. **Port already in use**
   ```bash
   # Check what's using the ports
   lsof -i :3000  # Frontend port
   lsof -i :3001  # API port
   
   # Kill the process if needed
   sudo kill -9 <PID>
   ```

3. **Database connection issues**
   ```bash
   # Reset Prisma client
   cd api && bun run prisma:generate
   
   # Reset database (development only)
   cd api && bun run prisma:reset
   ```

### Common Deployment Issues

1. **Port conflicts on remote server**
   ```bash
   # Check if ports are in use
   sudo netstat -tulpn | grep :3000
   
   # Stop conflicting services
   ./deploy-remote.sh --cleanup SERVER_IP
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

3. **Service not starting**
   ```bash
   # Check service logs
   docker-compose -f docker-compose.startkitv1.yml logs service_name
   
   # Restart services
   docker-compose -f docker-compose.startkitv1.yml restart
   ```

4. **Test deployment issues**
   ```bash
   # Run deployment tests to check configuration
   ./test-deployment.sh
   
   # Validate Docker Compose file
   docker-compose -f docker-compose.startkitv1.yml config
   ```

### Reset deployment
```bash
# Clean everything and start fresh
./deploy-remote.sh --cleanup SERVER_IP
./deploy-remote.sh --force-regen SERVER_IP mydomain.com
```

## 📚 Quick Reference

### Essential Commands
```bash
# Setup
git clone https://github.com/chikiet/KataCore.git
cd KataCore && bun run install:all

# Development
bun run dev                    # Start development servers
./test-deployment.sh           # Test deployment configuration

# Deployment
./deploy-remote.sh --simple IP DOMAIN    # Simple deployment
./deploy-remote.sh IP DOMAIN             # Full deployment with SSL
./deploy-remote.sh --cleanup IP          # Cleanup deployment

# Database
cd api && bun run prisma:studio          # Open database admin
cd api && bun run prisma:migrate         # Run migrations

# Monitoring
docker-compose -f docker-compose.startkitv1.yml logs -f  # View logs
```

### Important URLs (After Deployment)
- **Frontend**: `https://yourdomain.com` (or `http://IP:3000` for simple)
- **API**: `https://yourdomain.com/api` (or `http://IP:3001` for simple)
- **Health Check**: `https://yourdomain.com/api/health`
- **pgAdmin**: `https://yourdomain.com/pgadmin` (or `http://IP:5050`)
- **MinIO**: `https://yourdomain.com/minio` (or `http://IP:9000`)

## 🌍 Cloud Provider Support

KataCore StartKit v1 works with **any** cloud provider:

### Tested Platforms
- ✅ **AWS EC2** - All instance types
- ✅ **Google Cloud Compute** - All machine types  
- ✅ **DigitalOcean Droplets** - All sizes
- ✅ **Vultr Cloud Compute** - All plans
- ✅ **Linode** - All instances
- ✅ **Hetzner Cloud** - All server types

### Linux Distributions
- ✅ **Ubuntu** 20.04, 22.04, 24.04
- ✅ **Debian** 11, 12
- ✅ **CentOS** 8, 9
- ✅ **RHEL** 8, 9

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Test locally: `bun run dev` and `./test-deployment.sh`
4. Run tests: `bun run test` and `bun run lint`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit pull request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new API endpoints
- Update documentation for new features
- Test deployment changes with `./test-deployment.sh`
- Ensure all linting passes before committing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📖 **Documentation**: This README.md
- 🐛 **Issues**: [GitHub Issues](https://github.com/chikiet/KataCore/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/chikiet/KataCore/discussions)
- 📧 **Email**: support@katacore.com
- 🔧 **Help**: `./deploy-remote.sh --help` for deployment help
- 🧪 **Testing**: `./test-deployment.sh` for configuration validation

### Project Status
- ✅ **Version**: 1.0.0
- ✅ **Status**: Production Ready
- ✅ **Last Updated**: July 3, 2025
- ✅ **Node Version**: 18+
- ✅ **Bun Version**: 1.0+

---

<div align="center">

**🚀 Ready to deploy?**

**Quick Start:** `./deploy-remote.sh --simple SERVER_IP mydomain.com`

**Full Deploy:** `./deploy-remote.sh SERVER_IP mydomain.com`

---

**Made with ❤️ by the KataCore Team**

*Deploy once, run anywhere!*

</div>
