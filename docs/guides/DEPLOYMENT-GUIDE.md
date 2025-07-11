# 🚀 TazaCore Senior-Level Deployment Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [User Input Workflows](#user-input-workflows)
3. [Environment Management](#environment-management)
4. [Advanced Configuration](#advanced-configuration)
5. [Troubleshooting](#troubleshooting)

## Quick Start

### Option 1: Interactive Setup Wizard (Recommended for first-time users)
```bash
./deploy.sh setup
```

### Option 2: Pre-configured Environment Deployment
```bash
# Deploy to development
./deploy.sh deploy --env dev

# Deploy to staging
./deploy.sh deploy --env staging

# Deploy to production
./deploy.sh deploy --env prod
```

### Option 3: Command-line Configuration
```bash
./deploy.sh deploy --server 116.118.85.41 --domain myapp.com --user root --type full
```

## User Input Workflows

### 1. Interactive Setup Wizard Workflow

The setup wizard provides a guided experience for configuring your deployment:

#### Step 1: Environment Selection
```
Select target environment:
  1) Development
  2) Staging  
  3) Production
Select option [1-3]:
```

#### Step 2: Server Configuration
```
Enter server IP address: 116.118.85.41
```

#### Step 3: Deployment Type Selection
```
Select deployment type:
  1) Simple (IP-based)
  2) Full (Domain with SSL)
Select option [1-2]:
```

#### Step 4: Domain Configuration (if Full deployment)
```
Enter domain name: myapp.com
Enter email for SSL certificates [admin@myapp.com]:
```

#### Step 5: SSH Configuration
```
SSH username [root]:
Use existing SSH key at /home/user/.ssh/id_rsa? (y/n) [y]:
```

#### Step 6: Project Configuration
```
Project name [tazacore]:
Select Docker Compose configuration:
  1) docker-compose.yml (Standard)
  2) docker-compose.startkitv1.yml (Full Stack)
  3) docker-compose.simple.yml (Minimal)
Select option [1-3]:
```

#### Step 7: Service Configuration
```
Install API service? (y/n) [y]:
Install PostgreSQL database? (y/n) [y]:
Install Redis cache? (y/n) [y]:
Install MinIO object storage? (y/n) [y]:
Install pgAdmin database management? (y/n) [n]:
```

#### Step 8: Backup Configuration
```
Enable automated backups? (y/n) [y]:
Backup retention (days) [7]:
```

#### Step 9: Configuration Confirmation
```
📋 Configuration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  Environment:       Production
📍 Server IP:          116.118.85.41
🌍 Domain:             myapp.com
🚀 Deployment Type:    full
👤 SSH User:           root
🔐 SSH Key:            /home/user/.ssh/tazacore-prod
📦 Project Name:       tazacore
🐳 Docker Compose:     docker-compose.startkitv1.yml
🔒 SSL Enabled:        true
💾 Backup Enabled:     true

Save this configuration and proceed? (y/n) [y]:
Start deployment now? (y/n) [y]:
```

### 2. Environment-Based Workflow

For repeat deployments, use pre-configured environments:

#### Development Environment
```bash
# Quick development deployment
./deploy.sh deploy --env dev

# With custom server
./deploy.sh deploy --env dev --server 192.168.1.100
```

#### Staging Environment
```bash
# Deploy to staging
./deploy.sh deploy --env staging

# Deploy with interactive confirmation
./deploy.sh deploy --env staging --interactive
```

#### Production Environment
```bash
# Production deployment (requires confirmation)
./deploy.sh deploy --env prod --interactive

# Force production deployment (use with caution)
./deploy.sh deploy --env prod --force
```

### 3. Command-Line Workflow

For CI/CD and automated deployments:

#### Full Command-Line Deployment
```bash
./deploy.sh deploy \
  --server 116.118.85.41 \
  --domain myapp.com \
  --user root \
  --key ~/.ssh/tazacore-prod \
  --type full \
  --compose docker-compose.startkitv1.yml
```

#### Simple IP-Based Deployment
```bash
./deploy.sh deploy \
  --server 116.118.85.41 \
  --type simple \
  --user ubuntu
```

#### Dry Run (Preview Changes)
```bash
./deploy.sh deploy --env prod --dry-run
```

## Environment Management

### Configuration Files
Environment configurations are stored in `configs/environments/`:

- `dev.conf` - Development environment
- `staging.conf` - Staging environment  
- `prod.conf` - Production environment

### Creating Custom Environments
```bash
# Copy existing configuration
cp configs/environments/dev.conf configs/environments/testing.conf

# Edit the new configuration
nano configs/environments/testing.conf

# Deploy with custom environment
./deploy.sh deploy --env testing
```

### Configuration Variables
Each environment configuration includes:

```bash
# Server Configuration
SERVER_IP="116.118.85.41"
DOMAIN="myapp.com"
SSH_USER="root"
SSH_KEY_PATH="$HOME/.ssh/tazacore-prod"

# Deployment Configuration
DEPLOY_TYPE="full"
PROJECT_NAME="tazacore"
DOCKER_COMPOSE_FILE="docker-compose.startkitv1.yml"

# Feature Flags
INSTALL_API="true"
INSTALL_POSTGRES="true"
INSTALL_REDIS="true"
INSTALL_MINIO="true"
INSTALL_PGLADMIN="false"

# SSL Configuration
ENABLE_SSL="true"
SSL_EMAIL="admin@myapp.com"

# Backup Configuration
BACKUP_ENABLED="true"
BACKUP_RETENTION_DAYS="30"
```

## Advanced Configuration

### SSH Key Management
```bash
# Generate SSH key for specific environment
./scripts/setup/generate-ssh-key.sh ~/.ssh/tazacore-prod

# Generate and deploy to server
./scripts/setup/generate-ssh-key.sh \
  --server 116.118.85.41 \
  --user root \
  ~/.ssh/tazacore-prod
```

### Custom Docker Compose Files
```bash
# Use custom compose file
./deploy.sh deploy --compose docker-compose.custom.yml

# List available compose files
ls -la docker-compose*.yml
```

### Service-Specific Deployments
```bash
# Deploy only API and database
./deploy.sh deploy --env dev --services api,postgres

# Deploy minimal stack
./deploy.sh deploy --compose docker-compose.simple.yml
```

### SSL Certificate Management
```bash
# Force SSL certificate renewal
./deploy.sh update --env prod --force-ssl

# Check SSL certificate status
./deploy.sh status --env prod --check-ssl
```

## Command Reference

### Available Commands
```bash
./deploy.sh setup           # Interactive setup wizard
./deploy.sh deploy          # Deploy to environment
./deploy.sh update          # Update existing deployment
./deploy.sh rollback        # Rollback to previous version
./deploy.sh status          # Check deployment status
./deploy.sh logs            # View deployment logs
./deploy.sh cleanup         # Clean up resources
./deploy.sh test            # Run deployment tests
./deploy.sh ssh-config      # Configure SSH access
./deploy.sh health-check    # Check system health
```

### Global Options
```bash
--env ENV              # Target environment (dev|staging|prod)
--server SERVER_IP     # Target server IP address
--domain DOMAIN        # Domain name for full deployment
--user SSH_USER        # SSH username
--key SSH_KEY_PATH     # SSH private key path
--compose COMPOSE_FILE # Docker compose file to use
--type TYPE            # Deployment type (simple|full)
--force                # Force regeneration of configs
--dry-run              # Show what would be deployed
--interactive          # Enable interactive mode
--debug                # Enable debug logging
```

## Troubleshooting

### Common Issues

#### SSH Connection Problems
```bash
# Test SSH connection
./deploy.sh ssh-config --server 116.118.85.41 --test

# Reset SSH configuration
./deploy.sh ssh-config --server 116.118.85.41 --reset
```

#### Deployment Failures
```bash
# Check deployment logs
./deploy.sh logs --env prod

# Run health check
./deploy.sh health-check --env prod

# Rollback deployment
./deploy.sh rollback --env prod
```

#### Configuration Issues
```bash
# Validate configuration
./deploy.sh test --env prod

# Reset configuration
./deploy.sh setup --force
```

### Log Files
- Deployment logs: `logs/deployment-YYYYMMDD-HHMMSS.log`
- Error logs: `logs/deployment-errors-YYYYMMDD-HHMMSS.log`

### Support Commands
```bash
# View recent logs
tail -f logs/deployment-*.log

# Check system status
./deploy.sh status --env prod --verbose

# Run diagnostic tests
./deploy.sh test --env prod --full
```

## Best Practices

### Security
1. Use unique SSH keys for each environment
2. Enable SSL certificates for production
3. Regular backup verification
4. Monitor deployment logs

### Development Workflow
1. Test in development first
2. Deploy to staging for validation
3. Use interactive mode for production
4. Always run dry-run before production deployment

### Monitoring
1. Set up health checks
2. Monitor logs regularly  
3. Schedule backup verification
4. Test rollback procedures

## Success Indicators

After successful deployment, you should see:
- ✅ SSH connection works without password
- ✅ All services are running
- ✅ Web interface accessible
- ✅ API endpoints responding
- ✅ Database connections working
- ✅ SSL certificates valid (for full deployments)

## Getting Help

For additional support:
1. Check the troubleshooting section
2. Review deployment logs
3. Run diagnostic commands
4. Check the documentation in `docs/guides/`
