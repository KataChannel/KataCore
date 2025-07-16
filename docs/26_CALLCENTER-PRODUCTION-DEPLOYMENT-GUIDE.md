# 26. Call Center Production Deployment Guide

## Overview
This guide covers the complete production deployment process for the Call Center system, including environment setup, configuration, monitoring, and maintenance procedures.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [SIP Server Configuration](#sip-server-configuration)
5. [Application Deployment](#application-deployment)
6. [Monitoring Setup](#monitoring-setup)
7. [Security Configuration](#security-configuration)
8. [Backup and Recovery](#backup-and-recovery)
9. [Maintenance Procedures](#maintenance-procedures)

---

## Pre-Deployment Checklist

### ✅ System Requirements
- [ ] Node.js 18+ installed
- [ ] PostgreSQL/MySQL database available
- [ ] SIP server (Asterisk/FreePBX) configured
- [ ] SSL certificates for HTTPS/WSS
- [ ] Load balancer configured (if needed)
- [ ] Monitoring tools setup

### ✅ Code Preparation
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Version tagged in Git
- [ ] Dependencies security audited
- [ ] Build optimization completed
- [ ] Environment variables documented

### ✅ Infrastructure Ready
- [ ] Production servers provisioned
- [ ] Network security configured
- [ ] Firewall rules applied
- [ ] DNS records configured
- [ ] CDN setup (if applicable)

---

## Environment Configuration

### 1. Production Environment Variables
Create `.env.production` file:
```bash
# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database

# SIP Configuration (Default values, can be overridden per user)
DEFAULT_SIP_SERVER=wss://pbx01.onepos.vn:5000
DEFAULT_SIP_DOMAIN=tazaspa102019

# API Configuration
API_BASE_URL=https://api.your-domain.com

# Redis Configuration (for session storage)
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=/var/log/callcenter/app.log

# Security Configuration
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Feature Flags
ENABLE_CALL_RECORDING=true
ENABLE_ANALYTICS=true
ENABLE_REAL_TIME_MONITORING=true
```

### 2. Docker Configuration
Create `Dockerfile.production`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 3. Docker Compose Production
Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  callcenter-app:
    build: 
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - database
      - redis
    networks:
      - callcenter-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: callcenter
      POSTGRES_USER: callcenter_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - callcenter-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - callcenter-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - callcenter-app
    networks:
      - callcenter-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  callcenter-network:
    driver: bridge
```

---

## Database Setup

### 1. Production Database Migration
```bash
# Navigate to site directory
cd /chikiet/kataoffical/tazagroup/site

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (if needed)
npm run db:seed:production
```

### 2. Database Schema for Call Center
```sql
-- Extensions table
CREATE TABLE IF NOT EXISTS extensions (
    id SERIAL PRIMARY KEY,
    extcode VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    display_name VARCHAR(100),
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    extension_id VARCHAR(10) REFERENCES extensions(extcode),
    direction VARCHAR(20) NOT NULL,
    number VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    recording_file VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call logs table for detailed tracking
CREATE TABLE IF NOT EXISTS call_logs (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES calls(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_calls_extension ON calls(extension_id);
CREATE INDEX idx_calls_date ON calls(start_time);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_extensions_active ON extensions(is_active);
```

---

## SIP Server Configuration

### 1. Asterisk Configuration
Update `/etc/asterisk/pjsip.conf`:
```ini
[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:5000
cert_file=/etc/ssl/certs/asterisk.crt
priv_key_file=/etc/ssl/private/asterisk.key
method=tlsv1_2

[9999]
type=endpoint
context=internal
disallow=all
allow=ulaw,alaw,g722
direct_media=no
force_rport=yes
rtp_symmetric=yes

[9999]
type=auth
auth_type=userpass
password=NtRrcSl8Zp
username=9999

[9999]
type=aor
max_contacts=5
contact_expiration_check_interval=30
```

### 2. FreePBX WebRTC Configuration
```bash
# Enable WebRTC in FreePBX
fwconsole setting ENABLEASTERISKHTTP 1
fwconsole setting HTTPTLSENABLE 1
fwconsole setting HTTPTLSBINDADDR 0.0.0.0:8089
fwconsole setting HTTPTLSCERTFILE /etc/ssl/certs/asterisk.crt
fwconsole setting HTTPTLSPRIVATEKEY /etc/ssl/private/asterisk.key

# Reload configuration
fwconsole reload
```

---

## Application Deployment

### 1. Build and Deploy Script
Create `deploy-callcenter.sh`:
```bash
#!/bin/bash

echo "🚀 Starting Call Center Production Deployment..."

# Set variables
APP_DIR="/opt/callcenter"
BACKUP_DIR="/opt/backups/callcenter"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/callcenter_$DATE.tar.gz $APP_DIR

# Stop current application
echo "⏹️ Stopping current application..."
docker-compose -f docker-compose.production.yml down

# Pull latest code
echo "📥 Pulling latest code..."
cd $APP_DIR
git pull origin main

# Build new images
echo "🏗️ Building new images..."
docker-compose -f docker-compose.production.yml build

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml run --rm callcenter-app npx prisma migrate deploy

# Start application
echo "▶️ Starting application..."
docker-compose -f docker-compose.production.yml up -d

# Health check
echo "🏥 Performing health check..."
sleep 30
if curl -f http://localhost:3000/api/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed! Rolling back..."
    docker-compose -f docker-compose.production.yml down
    tar -xzf $BACKUP_DIR/callcenter_$DATE.tar.gz -C /
    docker-compose -f docker-compose.production.yml up -d
    exit 1
fi

echo "🎉 Call Center deployment completed successfully!"
```

### 2. Health Check Endpoint
Create health check API at `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Check essential tables
    const extensionCount = await prisma.extensions.count();
    
    // Check SIP server connectivity (basic check)
    const sipStatus = await checkSipServer();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        extensions: extensionCount,
        sip: sipStatus
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}

async function checkSipServer(): Promise<string> {
  // Implement SIP server health check
  // This could be a simple WebSocket connection test
  return 'unknown';
}
```

---

## Monitoring Setup

### 1. Application Monitoring
Create monitoring configuration:
```javascript
// monitoring/config.js
module.exports = {
  metrics: {
    // Application metrics
    response_time: true,
    error_rate: true,
    throughput: true,
    
    // Call center specific metrics
    active_calls: true,
    sip_registrations: true,
    call_success_rate: true,
    average_call_duration: true
  },
  
  alerts: {
    high_error_rate: {
      threshold: 5, // percent
      duration: '5m'
    },
    sip_connection_failures: {
      threshold: 10,
      duration: '1m'
    },
    database_connectivity: {
      check_interval: '30s'
    }
  }
};
```

### 2. Logging Configuration
```javascript
// logging/winston.config.js
const winston = require('winston');

module.exports = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/callcenter/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/callcenter/combined.log' 
    })
  ]
});
```

### 3. Performance Monitoring
```typescript
// monitoring/performance.ts
export class PerformanceMonitor {
  static trackCallMetrics(callData: any) {
    // Track call-specific metrics
    console.log('Call metrics:', {
      duration: callData.duration,
      quality: callData.quality,
      status: callData.status
    });
  }
  
  static trackSIPMetrics(sipData: any) {
    // Track SIP-specific metrics
    console.log('SIP metrics:', {
      registrations: sipData.registrations,
      failures: sipData.failures,
      latency: sipData.latency
    });
  }
}
```

---

## Security Configuration

### 1. SSL/TLS Setup
```nginx
# nginx/nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/domain.crt;
    ssl_certificate_key /etc/ssl/private/domain.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://callcenter-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /ws {
        proxy_pass http://callcenter-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 2. Firewall Configuration
```bash
# Configure UFW firewall
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 5000/tcp   # SIP WSS
ufw allow 8089/tcp   # Asterisk HTTPS
ufw enable
```

---

## Backup and Recovery

### 1. Automated Backup Script
```bash
#!/bin/bash
# backup-callcenter.sh

BACKUP_DIR="/opt/backups/callcenter"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker exec callcenter-db pg_dump -U callcenter_user callcenter > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/callcenter

# Call recordings backup (if applicable)
tar -czf $BACKUP_DIR/recordings_$DATE.tar.gz /var/spool/asterisk/monitor

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 2. Recovery Procedures
```bash
#!/bin/bash
# restore-callcenter.sh

BACKUP_DATE=$1
BACKUP_DIR="/opt/backups/callcenter"

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 <backup_date>"
    echo "Available backups:"
    ls $BACKUP_DIR/db_*.sql | sed 's/.*db_\(.*\)\.sql/\1/'
    exit 1
fi

echo "Restoring from backup: $BACKUP_DATE"

# Stop application
docker-compose -f docker-compose.production.yml down

# Restore database
docker exec -i callcenter-db psql -U callcenter_user callcenter < $BACKUP_DIR/db_$BACKUP_DATE.sql

# Restore application files
tar -xzf $BACKUP_DIR/app_$BACKUP_DATE.tar.gz -C /

# Start application
docker-compose -f docker-compose.production.yml up -d

echo "Recovery completed"
```

---

## Maintenance Procedures

### 1. Regular Maintenance Tasks
```bash
#!/bin/bash
# maintenance.sh - Run weekly

echo "🔧 Starting weekly maintenance..."

# Update system packages
apt update && apt upgrade -y

# Clean Docker images
docker system prune -f

# Rotate logs
logrotate /etc/logrotate.d/callcenter

# Database maintenance
docker exec callcenter-db psql -U callcenter_user -d callcenter -c "VACUUM ANALYZE;"

# Check disk space
df -h

# Check memory usage
free -h

# Restart application (zero-downtime)
docker-compose -f docker-compose.production.yml up -d --force-recreate

echo "✅ Maintenance completed"
```

### 2. Performance Optimization
```bash
#!/bin/bash
# optimize.sh - Run monthly

# Database optimization
docker exec callcenter-db psql -U callcenter_user -d callcenter -c "
    REINDEX DATABASE callcenter;
    VACUUM FULL;
    ANALYZE;
"

# Clear old call logs (keep 6 months)
docker exec callcenter-db psql -U callcenter_user -d callcenter -c "
    DELETE FROM call_logs WHERE timestamp < NOW() - INTERVAL '6 months';
"

# Optimize application cache
docker exec callcenter-app npm run cache:clear

echo "Performance optimization completed"
```

---

## Deployment Commands

### Initial Deployment
```bash
# Clone repository
git clone https://github.com/your-org/callcenter.git /opt/callcenter
cd /opt/callcenter

# Set up environment
cp .env.example .env.production
# Edit .env.production with production values

# Deploy
chmod +x deploy-callcenter.sh
./deploy-callcenter.sh
```

### Updates
```bash
# Deploy new version
cd /opt/callcenter
./deploy-callcenter.sh
```

### Rollback
```bash
# Rollback to previous version
./restore-callcenter.sh 20250716_143000
```

---

## Monitoring Dashboard URLs

- **Application**: https://your-domain.com/admin/crm/callcenter
- **Health Check**: https://your-domain.com/api/health
- **Metrics**: https://your-domain.com/api/metrics
- **Logs**: `/var/log/callcenter/`

---

## Support and Troubleshooting

### Common Issues
1. **SIP Connection Failures**: Check firewall and SSL certificates
2. **Database Connection Issues**: Verify connection string and credentials
3. **High Memory Usage**: Check for memory leaks in call handling
4. **Slow Response Times**: Review database queries and caching

### Emergency Contacts
- **System Administrator**: admin@your-domain.com
- **SIP Provider Support**: sip-support@provider.com
- **Database Administrator**: dba@your-domain.com

---

**File**: `docs/26_CALLCENTER-PRODUCTION-DEPLOYMENT-GUIDE.md`
**Created**: July 16, 2025
**Purpose**: Complete production deployment guide with monitoring and maintenance
**Next**: Monitor production system and gather user feedback
