# 🚀 TazaCore Quick Start Guide

Get TazaCore up and running in **5 minutes**! This guide will help you set up a complete enterprise HRM platform with automated deployment capabilities.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Bun.js** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **Docker** & **Docker Compose** ([Install Docker](https://docs.docker.com/get-docker/))
- **Git** for version control

## 🚀 Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/chikiet/TazaCore.git
cd TazaCore

# Install all dependencies (this may take 2-3 minutes)
bun install:all
```

## ⚙️ Step 2: Environment Setup

```bash
# Copy environment templates
cp site/.env.example site/.env.local
cp api/.env.example api/.env

# Generate security keys and configurations
bun run security:generate
```

## 🗄️ Step 3: Database Setup

```bash
# Start database services (PostgreSQL, Redis, MinIO)
bun run docker:up

# Wait for services to start (about 30 seconds)
sleep 30

# Setup database schema and seed with sample data
cd api
bun run prisma:migrate
bun run prisma:seed
cd ..
```

## 🎯 Step 4: Start Development

```bash
# Start both frontend and backend
bun run dev

# ✨ Your application is now running!
```

## 🌐 Step 5: Access Your Application

Open your browser and navigate to:

- **🏠 Main Application**: [http://localhost:3000](http://localhost:3000)
- **🚀 API Endpoints**: [http://localhost:3001](http://localhost:3001)
- **📊 API Documentation**: [http://localhost:3001/docs](http://localhost:3001/docs)
- **🗄️ Database Admin**: [http://localhost:5050](http://localhost:5050)
- **📦 File Storage**: [http://localhost:9000](http://localhost:9000)

## 🔑 Demo Login Credentials

The database is pre-seeded with test accounts:

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Administrator
```

### Manager Account
```
Email: manager@example.com
Password: manager123
Role: Manager
```

### Employee Account
```
Email: employee@example.com
Password: employee123
Role: Employee
```

## 🎉 What You Just Built

Congratulations! You now have a complete enterprise platform running with:

### 🏢 Human Resource Management System
- **Employee Management** - Create, edit, delete, and manage employee records
- **Department Structure** - Organize employees into departments with hierarchies
- **Role-Based Access** - Different permissions for Admin, Manager, and Employee roles
- **Dashboard** - Overview of HR metrics and analytics
- **Secure Authentication** - JWT-based login with password encryption

### 🔧 Technology Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: NestJS 11 + Prisma ORM + PostgreSQL
- **Infrastructure**: Docker + Redis + MinIO + Nginx-ready
- **Runtime**: Bun.js for ultra-fast performance

### 📊 Sample Data
Your system comes pre-loaded with:
- **7 Sample Employees** with realistic data
- **3 Departments** (Engineering, Marketing, Human Resources)
- **Role Hierarchies** demonstrating access control
- **Complete User Profiles** with authentication

## 🚀 Next Steps

### Explore the HRM System

1. **Login** with any of the demo accounts
2. **Browse Employees** - View the employee directory
3. **Manage Departments** - Create and organize departments
4. **Test Permissions** - Try different actions with different user roles
5. **Explore API** - Check out the Swagger documentation at `/docs`

### Start Development

1. **Modify the Frontend** - Edit files in `site/src/`
2. **Extend the API** - Add new endpoints in `api/src/`
3. **Update Database** - Modify schema in `api/prisma/schema.prisma`
4. **Add Features** - Build on the existing foundation

### Deploy to Production

When you're ready to deploy to a server:

```bash
# Quick deployment to any server
./quick-deploy-enhanced.sh

# Interactive deployment wizard
./deploy-wizard.sh

# Professional deployment with full features
./deploy-production.sh --help
```

## 📚 Available Commands

### Development Commands
```bash
# Start development environment
bun run dev                 # Both frontend and backend
bun run dev:site           # Frontend only (http://localhost:3000)
bun run dev:api            # Backend only (http://localhost:3001)

# Build for production
bun run build              # Build both applications
bun run build:site         # Build frontend only
bun run build:api          # Build backend only

# Code quality
bun run lint               # Check code quality
bun run test               # Run tests
bun run format             # Format code
```

### Database Commands
```bash
cd api

# Database management
bun run prisma:studio      # Open visual database editor
bun run prisma:migrate     # Run database migrations
bun run prisma:seed        # Add sample data
bun run prisma:reset       # Reset database (development only)
bun run prisma:generate    # Generate Prisma client
```

### Docker Commands
```bash
# Service management
bun run docker:up          # Start all services
bun run docker:down        # Stop all services
bun run docker:logs        # View service logs
bun run docker:restart     # Restart all services

# Individual service management
docker-compose up postgres # Start only PostgreSQL
docker-compose up redis    # Start only Redis
docker-compose up minio    # Start only MinIO
```

### Deployment Commands
```bash
# Production deployment options
./deploy-production.sh     # Professional deployment script
./deploy-wizard.sh         # Interactive deployment wizard
./quick-deploy-enhanced.sh # Quick deployment with validation

# Development helpers
./scripts/setup/generate-security.sh    # Generate security keys
./scripts/testing/test-deployment.sh    # Test deployment scripts
./scripts/maintenance/autopush.sh       # Git automation
```

## 🛠️ Customization

### Frontend Customization
```bash
# Edit the main layout
nano site/src/app/layout.tsx

# Customize components
nano site/src/components/ui/Button.tsx

# Modify styles
nano site/src/app/globals.css

# Add new pages
mkdir site/src/app/my-new-page
nano site/src/app/my-new-page/page.tsx
```

### Backend Customization
```bash
# Add new API endpoints
mkdir api/src/my-module
nano api/src/my-module/my-module.controller.ts

# Modify database schema
nano api/prisma/schema.prisma

# Add new services
nano api/src/my-module/my-module.service.ts
```

### Environment Configuration
```bash
# Frontend environment
nano site/.env.local

# Backend environment
nano api/.env

# Docker environment
nano docker-compose.yml
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Services Won't Start
```bash
# Check if ports are already in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Stop conflicting services
sudo systemctl stop nginx
sudo systemctl stop postgresql

# Restart Docker services
bun run docker:down
bun run docker:up
```

#### Database Connection Issues
```bash
# Check PostgreSQL container
docker-compose logs postgres

# Reset database connection
cd api
bun run prisma:reset
bun run prisma:migrate
bun run prisma:seed
```

#### Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/**/*.sh

# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and log back in
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules site/node_modules api/node_modules
rm -f bun.lockb site/bun.lockb api/bun.lockb
bun install:all

# Clear build cache
rm -rf site/.next api/dist
bun run build
```

### Getting Help

#### Check Logs
```bash
# Application logs
bun run docker:logs

# Specific service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs minio
```

#### Verify Setup
```bash
# Test deployment scripts
./scripts/testing/test-deployment.sh

# Check service health
curl http://localhost:3000
curl http://localhost:3001/health
```

#### Community Support
- 📖 **Documentation**: Check the `docs/` directory
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join our Discord community
- 📧 **Email**: Contact support@tazacore.com

## 🎯 Success Checklist

After completing this guide, you should have:

- ✅ TazaCore running locally on your machine
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API responding at http://localhost:3001
- ✅ Database with sample employees and departments
- ✅ All services (PostgreSQL, Redis, MinIO) running
- ✅ Admin, Manager, and Employee accounts working
- ✅ Full HRM system functionality available

## 🚀 Ready for More?

Now that you have TazaCore running, explore these advanced features:

1. **📖 Read the [Development Guide](DEVELOPMENT.md)** - Learn the codebase structure
2. **🏗️ Check the [Architecture Overview](ARCHITECTURE.md)** - Understand the system design
3. **📦 Try [Deployment Guide](DEPLOYMENT-GUIDE.md)** - Deploy to production servers
4. **🔧 Explore API Documentation** - Visit http://localhost:3001/docs
5. **🎨 Customize the Interface** - Modify components and styling

## 📞 Need Help?

If you encounter any issues:

1. **Check the troubleshooting section above**
2. **Review the logs** using the provided commands
3. **Search existing issues** on GitHub
4. **Create a new issue** with detailed error information
5. **Join our community** for real-time help

---

🎉 **Congratulations!** You've successfully set up TazaCore Enterprise Platform. Happy coding! 🚀
