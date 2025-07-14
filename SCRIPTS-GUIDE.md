# 📋 TazaCore Scripts Guide

## 🚀 Quick Start

```bash
# Fresh installation and setup
bun run fresh

# Start development
bun run dev

# Build for production
bun run build

# Start production
bun run start
```

## 📁 Root Package Scripts

### 🔧 Development
- `dev` - Start both site and API in development mode
- `dev:site` - Start only the site (Next.js)
- `dev:api` - Start only the API (NestJS)
- `dev:full` - Generate Prisma client and start development
- `dev:debug` - Start with debugging enabled

### 🏗️ Build & Start
- `build` - Build both API and site for production
- `build:site` - Build only the site
- `build:api` - Build only the API
- `build:check` - Type-check, lint, and build
- `build:analyze` - Build with bundle analysis
- `start` - Start production servers
- `start:site` - Start site in production
- `start:api` - Start API in production
- `start:production` - Start with NODE_ENV=production

### 📦 Package Management
- `install:all` - Install dependencies for all projects
- `update:all` - Update all dependencies
- `audit` - Run security audit on all projects
- `audit:fix` - Fix security vulnerabilities

### 🧹 Cleaning
- `clean` - Clean all build artifacts and cache
- `clean:deps` - Remove all node_modules
- `clean:build` - Remove build outputs
- `clean:cache` - Remove cache files
- `clean:all` - Complete cleanup including lockfiles

### 🧪 Testing
- `test` - Run all tests
- `test:api` - Run API tests
- `test:site` - Run site tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Generate coverage reports
- `test:e2e` - Run end-to-end tests

### 🔍 Linting & Formatting
- `lint` - Lint all projects
- `lint:fix` - Fix linting issues
- `format` - Format all code
- `format:check` - Check code formatting
- `type-check` - Type-check all TypeScript

### 🗄️ Database (Prisma)
- `db:generate` - Generate Prisma client
- `db:migrate` - Run database migrations
- `db:migrate:deploy` - Deploy migrations to production
- `db:migrate:reset` - Reset database and migrations
- `db:seed` - Seed database with initial data
- `db:studio` - Open Prisma Studio
- `db:backup` - Backup database
- `db:restore` - Restore database from backup

### 🐳 Docker
- `docker:up` - Start Docker containers
- `docker:down` - Stop Docker containers
- `docker:logs` - View container logs
- `docker:build` - Build Docker images
- `docker:rebuild` - Rebuild without cache
- `docker:restart` - Restart containers
- `docker:clean` - Clean Docker system
- `docker:reset` - Complete Docker reset

### 🚀 Deployment
- `deploy` - Deploy to production
- `deploy:staging` - Deploy to staging
- `deploy:production` - Deploy to production
- `deploy:wizard` - Interactive deployment wizard
- `deploy:cleanup` - Clean up deployment artifacts
- `deploy:rollback` - Rollback deployment

### 🔐 Security & Admin
- `security:generate` - Generate security configurations
- `security:scan` - Run security scans
- `admin:create` - Create admin user
- `admin:super` - Create super admin
- `admin:cli` - Admin CLI tool

### 🛠️ Utilities
- `health` - Check application health
- `logs` - View application logs
- `monitor` - Monitor application
- `backup` - Create complete backup

### 🔄 Workflow Scripts
- `fresh` - Complete fresh setup
- `ci` - Continuous integration pipeline
- `precommit` - Pre-commit checks

## 🏗️ API Package Scripts

### Development
- `start:dev` - Development server with hot reload
- `start:debug` - Debug mode with inspector
- `start:repl` - REPL mode for testing

### Testing
- `test:unit` - Unit tests only
- `test:integration` - Integration tests
- `test:e2e` - End-to-end tests
- `test:coverage` - Coverage with HTML report

### Docker
- `docker:dev` - Run in development container
- `docker:test` - Run tests in container

### Documentation
- `docs:generate` - Generate API documentation
- `docs:serve` - Serve documentation

## 🌐 Site Package Scripts

### Development
- `dev:turbo` - Development with Turbo
- `dev:debug` - Debug mode
- `dev:https` - HTTPS development server

### Build
- `build:standalone` - Standalone build
- `build:analyze` - Bundle analysis
- `build:production` - Production build

### Testing
- `test:unit` - Unit tests
- `test:integration` - Integration tests
- `test:e2e` - Playwright E2E tests
- `test:e2e:headed` - E2E with browser UI
- `test:e2e:debug` - Debug E2E tests

### Admin Tools
- `admin:create` - Quick admin creation
- `admin:create-interactive` - Interactive admin setup
- `admin:super` - Create super admin
- `admin:cli` - Admin CLI interface
- `admin:list` - List admins
- `admin:check` - Check admin status

### Deployment
- `export` - Static export
- `deploy:vercel` - Deploy to Vercel
- `deploy:netlify` - Deploy to Netlify

## 🗄️ Shared Package Scripts

### Database Operations
- `db:migrate:status` - Check migration status
- `db:migrate:resolve` - Resolve migration conflicts
- `db:migrate:diff` - Show migration differences
- `db:seed:dev` - Seed for development
- `db:seed:test` - Seed for testing
- `db:format` - Format Prisma schema
- `db:validate` - Validate Prisma schema
- `db:reset:full` - Complete database reset with seeding

## 💡 Usage Examples

### Development Workflow
```bash
# Start fresh development
bun run fresh

# Work on specific parts
bun run dev:site    # Frontend only
bun run dev:api     # Backend only

# Check code quality
bun run precommit

# Run tests
bun run test:watch
```

### Production Deployment
```bash
# Complete CI pipeline
bun run ci

# Deploy to staging
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

### Database Management
```bash
# Fresh database setup
bun run db:migrate:reset
bun run db:seed

# Check database status
bun run db:migrate:status

# Open database GUI
bun run db:studio
```

### Troubleshooting
```bash
# Clean everything and restart
bun run fresh

# Check application health
bun run health

# View logs
bun run logs

# Reset Docker environment
bun run docker:reset
```

## 🎯 Best Practices

1. **Always run `precommit` before committing**
2. **Use `fresh` when switching branches**
3. **Run `ci` to simulate CI/CD pipeline**
4. **Use specific scripts for focused development**
5. **Check `health` after starting services**
6. **Use `clean` commands when facing issues**

## 🔧 Configuration

Environment variables and configuration files:
- `.env` - Environment variables
- `docker-compose.yml` - Docker configuration
- `package.json` - Scripts and dependencies
- `prisma/schema.prisma` - Database schema

## 📞 Support

For issues with scripts:
1. Check logs: `bun run logs`
2. Check health: `bun run health`
3. Try clean restart: `bun run fresh`
4. Check documentation in `/docs`
