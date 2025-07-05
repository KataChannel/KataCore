#!/bin/bash

# 🚀 KataCore Project Structure Optimizer
# Organizes project files into a clean, professional structure
# Version: 2.0.0

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 KataCore Project Structure Optimizer                  ║
║                                                                              ║
║    Organizes your project files into a clean, professional structure        ║
║    Version: 2.0.0                                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Create organized directory structure
create_structure() {
    log "Creating organized directory structure..."
    
    # Create main directories
    mkdir -p {docs,scripts,deployment,configs}
    mkdir -p docs/{guides,api,examples,troubleshooting}
    mkdir -p scripts/{setup,deployment,maintenance,testing}
    mkdir -p deployment/{scripts,configs,templates,docs}
    mkdir -p configs/{docker,nginx,environments}
    
    success "Directory structure created"
}

# Move deployment files to organized structure
organize_deployment_files() {
    log "Organizing deployment files..."
    
    # Move deployment scripts
    mv deploy-production.sh deployment/scripts/ 2>/dev/null || true
    mv deploy-wizard.sh deployment/scripts/ 2>/dev/null || true
    mv deploy-remote-fixed.sh deployment/scripts/ 2>/dev/null || true
    mv quick-deploy-enhanced.sh deployment/scripts/ 2>/dev/null || true
    mv auto-ssh-deploy.sh deployment/scripts/ 2>/dev/null || true
    
    # Move setup scripts
    mv ssh-keygen-setup.sh scripts/setup/ 2>/dev/null || true
    mv generate-security.sh scripts/setup/ 2>/dev/null || true
    
    # Move testing scripts
    mv test-deployment.sh scripts/testing/ 2>/dev/null || true
    
    # Move config files
    mv docker-compose.yml configs/docker/ 2>/dev/null || true
    
    success "Deployment files organized"
}

# Create configuration files
create_configs() {
    log "Creating configuration files..."
    
    # Environment configurations
    cat > configs/environments/dev.conf << 'EOF'
# Development Environment Configuration
NODE_ENV=development
PORT=3000
API_PORT=3001
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/katacore_dev
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug
JWT_SECRET=dev_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
EOF

    cat > configs/environments/prod.conf << 'EOF'
# Production Environment Configuration
NODE_ENV=production
PORT=3000
API_PORT=3001
DATABASE_URL=postgresql://prod_user:prod_pass@postgres:5432/katacore
REDIS_URL=redis://:redis_pass@redis:6379
LOG_LEVEL=info
JWT_SECRET=prod_jwt_secret_key
CORS_ORIGIN=https://your-domain.com
EOF

    cat > configs/environments/staging.conf << 'EOF'
# Staging Environment Configuration
NODE_ENV=staging
PORT=3000
API_PORT=3001
DATABASE_URL=postgresql://staging_user:staging_pass@postgres:5432/katacore_staging
REDIS_URL=redis://:redis_pass@redis:6379
LOG_LEVEL=info
JWT_SECRET=staging_jwt_secret_key
CORS_ORIGIN=https://staging.your-domain.com
EOF

    success "Configuration files created"
}

# Create deployment templates
create_deployment_templates() {
    log "Creating deployment templates..."
    
    # Docker Compose template
    cat > deployment/templates/docker-compose.template.yml << 'EOF'
version: '3.8'

services:
  site:
    build: ./site
    ports:
      - "${SITE_PORT:-3000}:3000"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - api
    restart: unless-stopped

  api:
    build: ./api
    ports:
      - "${API_PORT:-3001}:3001"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB:-katacore}
      - POSTGRES_USER=${POSTGRES_USER:-katacore}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER:-admin}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:
EOF

    success "Deployment templates created"
}

# Create documentation files
create_documentation() {
    log "Creating documentation files..."
    
    # Quick Start Guide
    cat > docs/guides/QUICK-START.md << 'EOF'
# 🚀 Quick Start Guide

## Prerequisites
- Bun.js >= 1.0.0
- Docker & Docker Compose
- Node.js >= 18.0.0

## Installation

### 1. Clone and Install
```bash
git clone https://github.com/chikiet/KataCore.git
cd KataCore
bun install:all
```

### 2. Environment Setup
```bash
cp site/.env.example site/.env.local
cp api/.env.example api/.env
bun run security:generate
```

### 3. Database Setup
```bash
bun run docker:up
cd api && bun run prisma:migrate
cd api && bun run prisma:seed
```

### 4. Start Development
```bash
bun run dev
```

Access the application at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database Admin: http://localhost:5050

## Next Steps
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [API Documentation](../api/README.md)
EOF

    # Development Guide
    cat > docs/guides/DEVELOPMENT.md << 'EOF'
# 🔧 Development Guide

## Development Workflow

### 1. Local Development
```bash
# Start all services
bun run dev

# Start individual services
bun run dev:site  # Frontend only
bun run dev:api   # Backend only
```

### 2. Code Quality
```bash
# Linting
bun run lint

# Testing
bun run test

# Type checking
bun run type-check
```

### 3. Database Management
```bash
# Database migrations
cd api && bun run prisma:migrate

# Database seeding
cd api && bun run prisma:seed

# Database studio
cd api && bun run prisma:studio
```

## Project Structure

### Frontend (site/)
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities and configurations
- `src/hooks/` - Custom React hooks

### Backend (api/)
- `src/` - NestJS source code
- `prisma/` - Database schema and migrations
- `dist/` - Built output

## Best Practices

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write descriptive commit messages

### Database
- Always create migrations for schema changes
- Use Prisma Studio for database inspection
- Keep seed data realistic and comprehensive

### Security
- Never commit sensitive data
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all inputs
EOF

    success "Documentation created"
}

# Create improved autopush script
create_improved_autopush() {
    log "Creating improved autopush script..."
    
    cat > scripts/maintenance/autopush.sh << 'EOF'
#!/bin/bash

# 🚀 KataCore Auto Git Push
# Improved version with better commit messages and validation
# Version: 2.0.0

set -euo pipefail

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository!"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    log "Uncommitted changes detected"
    
    # Show status
    git status --short
    
    # Get commit message
    if [ $# -eq 0 ]; then
        echo -e "${YELLOW}Enter commit message (or press Enter for auto-generated): ${NC}"
        read -r commit_msg
        
        if [ -z "$commit_msg" ]; then
            # Auto-generate commit message based on changes
            modified_files=$(git diff --name-only HEAD | wc -l)
            new_files=$(git diff --name-only --cached | wc -l)
            
            if [ "$modified_files" -gt 0 ] && [ "$new_files" -gt 0 ]; then
                commit_msg="Update and add files ($modified_files modified, $new_files new)"
            elif [ "$modified_files" -gt 0 ]; then
                commit_msg="Update $modified_files files"
            elif [ "$new_files" -gt 0 ]; then
                commit_msg="Add $new_files new files"
            else
                commit_msg="Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
            fi
        fi
    else
        commit_msg="$*"
    fi
    
    # Add all changes
    git add .
    
    # Commit changes
    git commit -m "$commit_msg"
    
    # Push to remote
    log "Pushing to remote repository..."
    git push
    
    info "Successfully pushed with message: '$commit_msg'"
else
    info "No changes to commit"
fi
EOF

    chmod +x scripts/maintenance/autopush.sh
    success "Improved autopush script created"
}

# Create master deployment script
create_master_deployment() {
    log "Creating master deployment script..."
    
    cat > scripts/deployment/deploy.sh << 'EOF'
#!/bin/bash

# 🚀 KataCore Master Deployment Script
# Unified deployment interface for all environments
# Version: 2.0.0

set -euo pipefail

# Source directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly RED='\033[0;31m'
readonly NC='\033[0m'

# Functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Show help
show_help() {
    cat << 'EOF'
🚀 KataCore Master Deployment Script

USAGE:
    ./deploy.sh [COMMAND] [OPTIONS]

COMMANDS:
    local           Deploy locally with Docker
    remote          Deploy to remote server
    production      Production deployment with full features
    staging         Staging deployment
    development     Development deployment
    wizard          Interactive deployment wizard
    cleanup         Clean up remote deployment

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output

EXAMPLES:
    ./deploy.sh local                    # Local Docker deployment
    ./deploy.sh remote 192.168.1.100    # Simple remote deployment
    ./deploy.sh production --ssl         # Production with SSL
    ./deploy.sh wizard                   # Interactive deployment
    ./deploy.sh cleanup                  # Clean up deployment

For more information, visit: https://docs.katacore.com
EOF
}

# Main function
main() {
    cd "$PROJECT_ROOT"
    
    case "${1:-help}" in
        local)
            log "Starting local deployment..."
            exec bun run docker:up
            ;;
        remote)
            log "Starting remote deployment..."
            exec ./deployment/scripts/deploy-remote-fixed.sh "${@:2}"
            ;;
        production)
            log "Starting production deployment..."
            exec ./deployment/scripts/deploy-production.sh "${@:2}"
            ;;
        staging)
            log "Starting staging deployment..."
            exec ./deployment/scripts/deploy-production.sh --mode staging "${@:2}"
            ;;
        development)
            log "Starting development deployment..."
            exec ./deployment/scripts/deploy-production.sh --mode development "${@:2}"
            ;;
        wizard)
            log "Starting deployment wizard..."
            exec ./deployment/scripts/deploy-wizard.sh
            ;;
        cleanup)
            log "Starting cleanup..."
            exec ./deployment/scripts/deploy-remote-fixed.sh --cleanup "${@:2}"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: ${1:-}"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
EOF

    chmod +x scripts/deployment/deploy.sh
    success "Master deployment script created"
}

# Create symlinks for backward compatibility
create_symlinks() {
    log "Creating symlinks for backward compatibility..."
    
    # Create symlinks to maintain compatibility
    ln -sf deployment/scripts/deploy-production.sh deploy-production.sh 2>/dev/null || true
    ln -sf deployment/scripts/deploy-wizard.sh deploy-wizard.sh 2>/dev/null || true
    ln -sf deployment/scripts/quick-deploy-enhanced.sh quick-deploy-enhanced.sh 2>/dev/null || true
    ln -sf scripts/deployment/deploy.sh deploy.sh 2>/dev/null || true
    ln -sf scripts/maintenance/autopush.sh autopush.sh 2>/dev/null || true
    ln -sf configs/docker/docker-compose.yml docker-compose.yml 2>/dev/null || true
    
    success "Symlinks created for backward compatibility"
}

# Update package.json scripts
update_package_scripts() {
    log "Updating package.json scripts..."
    
    # Update scripts in package.json to use new structure
    if [ -f package.json ]; then
        # Create a backup
        cp package.json package.json.backup
        
        # Update scripts using sed
        sed -i 's|"deploy:remote": "./deploy-remote.sh"|"deploy:remote": "./scripts/deployment/deploy.sh remote"|g' package.json
        sed -i 's|"deploy:simple": "./deploy-remote.sh --simple"|"deploy:simple": "./scripts/deployment/deploy.sh remote --simple"|g' package.json
        sed -i 's|"deploy:cleanup": "./deploy-remote.sh --cleanup"|"deploy:cleanup": "./scripts/deployment/deploy.sh cleanup"|g' package.json
        sed -i 's|"security:generate": "./generate-security.sh"|"security:generate": "./scripts/setup/generate-security.sh"|g' package.json
        sed -i 's|"docker:up": "docker-compose.*up -d"|"docker:up": "docker-compose -f configs/docker/docker-compose.yml up -d"|g' package.json
        sed -i 's|"docker:down": "docker-compose.*down"|"docker:down": "docker-compose -f configs/docker/docker-compose.yml down"|g' package.json
        sed -i 's|"docker:logs": "docker-compose.*logs -f"|"docker:logs": "docker-compose -f configs/docker/docker-compose.yml logs -f"|g' package.json
        
        success "Package.json scripts updated"
    fi
}

# Clean up old files
cleanup_old_files() {
    log "Cleaning up old files..."
    
    # Remove old deployment files (keep backups)
    rm -f deploy-remote.sh deploy-remote1.sh "deploy-remote copy.sh" deploy-remote.sh.backup
    rm -f deploy-with-default.sh quick-deploy.sh quick-deploy-fixed.sh
    rm -f generate-security.sh
    
    # Remove old documentation files
    rm -f SSH-AUTOMATION-README.md QUICK-START.md HRM-SUMMARY.md
    
    success "Old files cleaned up"
}

# Main execution
main() {
    show_banner
    
    log "Starting KataCore project structure optimization..."
    
    create_structure
    organize_deployment_files
    create_configs
    create_deployment_templates
    create_documentation
    create_improved_autopush
    create_master_deployment
    create_symlinks
    update_package_scripts
    cleanup_old_files
    
    success "Project structure optimization completed!"
    
    echo
    info "New project structure:"
    echo "  📁 deployment/scripts/   - All deployment scripts"
    echo "  📁 scripts/setup/        - Setup and configuration scripts"
    echo "  📁 scripts/maintenance/  - Maintenance scripts"
    echo "  📁 configs/              - Configuration files"
    echo "  📁 docs/                 - Documentation"
    echo "  🔗 Symlinks created for backward compatibility"
    echo
    warning "Please review the changes and test your deployment scripts"
    info "Use './scripts/deployment/deploy.sh --help' for deployment options"
}

# Execute main function
main "$@"
