# 🚀 TazaCore Enterprise Platform - Getting Started

Welcome to **TazaCore**, your complete enterprise platform solution! This guide will help you set up and start using TazaCore in just a few minutes.

## 🎯 What is TazaCore?

TazaCore is a modern, full-stack enterprise platform that includes:
- **Complete Human Resource Management (HRM) System**
- **Automated Deployment System** for any server
- **Modern Tech Stack** with Next.js 15, NestJS 11, and Bun.js
- **Production-ready Infrastructure** with Docker, PostgreSQL, Redis, and MinIO

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Prerequisites
```bash
# Install Bun.js (ultra-fast JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Install Docker (for database services)
# Visit: https://docs.docker.com/get-docker/
```

### Step 2: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/chikiet/TazaCore.git
cd TazaCore

# Install all dependencies
bun install:all

# Copy environment files
cp site/.env.example site/.env.local
cp api/.env.example api/.env
```

### Step 3: Start Development
```bash
# Start database services
bun run docker:up

# Setup database
cd api && bun run prisma:migrate && bun run prisma:seed && cd ..

# Start the application
bun run dev
```

### Step 4: Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Admin**: http://localhost:5050

## 🏢 HRM System Features

### Demo Login Credentials
```
Admin User:
- Email: admin@example.com
- Password: admin123

Manager User:
- Email: manager@example.com
- Password: manager123

Employee User:
- Email: employee@example.com
- Password: employee123
```

### Available Features
- **👥 Employee Management** - Add, edit, and manage employee records
- **🏛️ Department Structure** - Organize employees into departments
- **🔑 Role-Based Access** - Different permissions for Admin, Manager, Employee
- **📊 Dashboard** - Overview of HR metrics and data
- **🔐 Secure Authentication** - JWT-based login system

## 🚀 Deployment Options

### Option 1: Quick Deploy (Recommended)
```bash
# Deploy to any server with one command
./quick-deploy-enhanced.sh

# Follow the prompts to enter:
# - Server IP address
# - SSH credentials
# - Domain name (optional)
```

### Option 2: Interactive Wizard
```bash
# Step-by-step deployment wizard
./deploy-wizard.sh

# Guides you through:
# - Server configuration
# - SSL setup
# - Service selection
# - Environment configuration
```

### Option 3: Professional Deployment
```bash
# Advanced deployment with full control
./deploy-production.sh --help

# Example: Deploy with SSL and monitoring
./deploy-production.sh --ssl --monitoring 192.168.1.100 myapp.com
```

## 📋 Available Commands

### Development Commands
```bash
bun run dev           # Start both frontend and backend
bun run dev:site      # Start frontend only
bun run dev:api       # Start backend only
bun run build         # Build for production
bun run test          # Run tests
bun run lint          # Check code quality
```

### Database Commands
```bash
cd api
bun run prisma:studio    # Open database admin
bun run prisma:migrate   # Run database migrations
bun run prisma:seed      # Add sample data
bun run prisma:reset     # Reset database
```

### Deployment Commands
```bash
./deploy-production.sh   # Professional deployment
./deploy-wizard.sh       # Interactive deployment
./quick-deploy-enhanced.sh # Quick deployment
```

## 🔧 Configuration

### Environment Variables
Edit `site/.env.local` and `api/.env` to configure:
- Database connections
- API endpoints
- Authentication settings
- External service integrations

### Database Configuration
TazaCore uses PostgreSQL with Prisma ORM. The database schema includes:
- **Users** - Authentication and user management
- **Employees** - Employee records and information
- **Departments** - Organizational structure
- **Roles** - Permission and access control

## 🛠️ Development Workflow

### 1. Making Changes
```bash
# Edit files in:
# - site/src/ (Frontend)
# - api/src/ (Backend)

# Changes are automatically reflected (hot reload)
```

### 2. Database Changes
```bash
# Edit schema in api/prisma/schema.prisma
# Generate migration
cd api && bun run prisma:migrate

# Apply to database
bun run prisma:deploy
```

### 3. Adding New Features
```bash
# Frontend: Add components in site/src/components/
# Backend: Add modules in api/src/modules/
# Database: Update schema in api/prisma/schema.prisma
```

## 🚀 Production Deployment

### Server Requirements
- **Ubuntu 20.04+** or **CentOS 7+**
- **2GB RAM minimum** (4GB recommended)
- **20GB Storage** (SSD recommended)
- **Root access** or sudo privileges

### Deployment Process
1. **Server Preparation**: Automatic system updates and Docker installation
2. **SSL Configuration**: Let's Encrypt certificates with auto-renewal
3. **Service Setup**: PostgreSQL, Redis, MinIO, and application containers
4. **Health Monitoring**: Automated health checks and service monitoring
5. **Security Hardening**: Firewall configuration and security updates

### After Deployment
- **Monitor Services**: Use provided monitoring commands
- **Check Logs**: View application and service logs
- **Update Application**: Re-run deployment scripts for updates
- **Backup Data**: Regular database and file backups

## 🔒 Security Features

### Authentication
- **JWT Tokens** with refresh mechanism
- **Password Hashing** using bcrypt
- **Role-Based Access Control** (RBAC)
- **Session Management** with secure cookies

### Infrastructure Security
- **HTTPS Encryption** with Let's Encrypt
- **Database Security** with password protection
- **Network Security** with Docker networks
- **Access Control** with SSH key authentication

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Monitor resources
docker stats
```

### Database Management
```bash
# Access database
docker-compose exec postgres psql -U tazacore

# Backup database
docker-compose exec postgres pg_dump -U tazacore tazacore > backup.sql

# Restore database
docker-compose exec postgres psql -U tazacore tazacore < backup.sql
```

### Updates and Maintenance
```bash
# Update application
git pull origin main
bun install:all
bun run build

# Update deployment
./deploy-production.sh --update
```

## 🤝 Getting Help

### Documentation
- **📖 Full Documentation**: Coming soon
- **🔧 API Documentation**: http://localhost:3001/docs (when running)
- **📋 Code Examples**: Check the `examples/` directory

### Support Channels
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Join our development community
- **Email Support**: support@tazacore.com

### Contributing
We welcome contributions! Please read our contribution guidelines and submit pull requests.

## 📋 Next Steps

1. **Explore the HRM System** - Try adding employees and departments
2. **Customize the Interface** - Modify components and styling
3. **Add New Features** - Extend the API and frontend
4. **Deploy to Production** - Use our automated deployment system
5. **Join the Community** - Share your experience and get help

---

🎉 **Congratulations!** You now have a complete enterprise platform running. Start by exploring the HRM system and then deploy it to production when ready.

For questions or support, visit our documentation or join our community channels.

**Happy coding!** 🚀
