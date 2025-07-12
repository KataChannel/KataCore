# 🔄 Shared Prisma Cloud Deployment Guide

Hướng dẫn chi tiết để deploy TazaCore với shared Prisma configuration lên cloud server.

## 🎯 Tổng Quan

Dockerfile đã được tối ưu hóa để sử dụng shared Prisma configuration giữa Next.js (site) và NestJS (api) khi deploy lên cloud server. Cấu hình này đảm bảo:

- **Shared Database Schema**: Cùng một schema Prisma cho cả frontend và backend
- **Consistent Build Process**: Build process ổn định với error handling
- **Optimized Docker Images**: Multi-stage build để giảm kích thước image
- **Runtime Reliability**: Proper health checks và error recovery

## 📁 Cấu Trúc Files

```
tazagroup/
├── shared/                          # Shared Prisma configuration
│   ├── lib/prisma.ts               # Prisma client
│   ├── package.json                # Shared dependencies
│   └── prisma/                     # Database schema & migrations
├── site/
│   ├── Dockerfile                  # Optimized Next.js Dockerfile
│   └── Dockerfile.simple          # Fallback Dockerfile
├── api/
│   └── Dockerfile                  # Optimized NestJS Dockerfile
├── docker-compose.yml              # Enhanced compose configuration
├── pre-deploy-prisma.sh           # Pre-deployment setup
├── deploy-shared-prisma.sh         # Enhanced deployment script
└── .env.prod                       # Production environment
```

## 🚀 Quick Deployment

### 1. Chuẩn Bị Environment

```bash
# Copy và chỉnh sửa environment file
cp .env.prod.example .env.prod
nano .env.prod
```

### 2. Chạy Enhanced Deployment

```bash
# Deploy với shared Prisma support
./deploy-shared-prisma.sh
```

### 3. Verify Deployment

```bash
# Kiểm tra deployment status
./verify-deployment.sh
```

## 🔧 Manual Deployment Steps

### Step 1: Pre-deployment Setup

```bash
# Chuẩn bị shared Prisma
./pre-deploy-prisma.sh
```

### Step 2: Build Docker Images

```bash
# Build với shared Prisma support
docker-compose -f docker-compose.yml --env-file .env.prod build --no-cache
```

### Step 3: Deploy Services

```bash
# Start infrastructure first
docker-compose -f docker-compose.yml --env-file .env.prod up -d postgres redis minio

# Wait for infrastructure
sleep 30

# Start application services
docker-compose -f docker-compose.yml --env-file .env.prod up -d api site
```

## 🏗️ Dockerfile Improvements

### Site Dockerfile (Next.js)

**Tính năng mới:**
- Multi-stage build với separate shared setup stage
- Better error handling trong build process
- Optimized Prisma client generation
- Enhanced health checks
- Fallback Dockerfile option

**Key improvements:**
```dockerfile
# Shared Prisma setup stage
FROM deps AS shared-setup
COPY shared ./shared
RUN cd shared && bun install && bunx prisma generate

# Enhanced build stage with error handling
RUN set -e; \
    bun run build 2>&1 | tee /tmp/build.log && BUILD_SUCCESS=true || BUILD_SUCCESS=false; \
    if [ "$BUILD_SUCCESS" = "false" ]; then \
        # Comprehensive error debugging and retry logic
    fi
```

### API Dockerfile (NestJS)

**Tính năng mới:**
- Separated dependency installation and Prisma setup
- Better build verification
- Enhanced runtime configuration
- Improved health checks

**Key improvements:**
```dockerfile
# Shared Prisma setup stage
FROM deps AS shared-setup
COPY shared ./shared
RUN cd shared && bun install && bunx prisma generate

# Verify Prisma setup before building
RUN echo "Verifying Prisma setup..." && \
    ls -la shared/node_modules/.prisma/
```

## 🐳 Docker Compose Enhancements

### Service Dependencies

```yaml
depends_on:
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
  minio:
    condition: service_healthy
```

### Enhanced Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 15s
  retries: 5
  start_period: 60s
```

### Shared Volume Mounts

```yaml
volumes:
  - ./shared:/app/shared:ro  # Runtime access to shared config
```

## 🔧 Troubleshooting

### Build Issues

**Problem**: Prisma client generation fails
```bash
# Solution: Clear cache and regenerate
cd shared
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

**Problem**: Site build fails
```bash
# Solution: Use fallback Dockerfile
cp site/Dockerfile.simple site/Dockerfile
docker-compose build site
```

### Runtime Issues

**Problem**: Database connection errors
```bash
# Check database status
docker-compose exec postgres pg_isready

# Check environment variables
docker-compose exec api env | grep DATABASE_URL
```

**Problem**: Prisma client not found
```bash
# Verify Prisma client in container
docker-compose exec api ls -la shared/node_modules/.prisma/
docker-compose exec site ls -la shared/node_modules/.prisma/
```

### Performance Issues

**Problem**: Slow startup times
```bash
# Check container resources
docker stats

# Optimize health check timing
# Increase start_period in docker-compose.yml
```

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Check all services
docker-compose ps

# View service logs
docker-compose logs -f api
docker-compose logs -f site

# Monitor resource usage
docker stats --no-stream
```

### Database Maintenance

```bash
# Run migrations
cd shared && npx prisma migrate deploy

# Seed database
cd shared && npm run db:seed

# Backup database
docker-compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
```

### Application Updates

```bash
# Update application
git pull
./deploy-shared-prisma.sh

# Or update specific service
docker-compose build --no-cache api
docker-compose up -d api
```

## 🔐 Security Considerations

### Environment Variables

```bash
# Secure environment file permissions
chmod 600 .env.prod

# Use strong passwords
grep -E "(PASSWORD|SECRET)" .env.prod
```

### Container Security

```bash
# Run as non-root user (already configured)
docker-compose exec api whoami  # Should return "nestjs"
docker-compose exec site whoami # Should return "nextjs"

# Check for security updates
docker-compose pull
```

## 📈 Performance Optimization

### Image Size Optimization

- Multi-stage builds để giảm image size
- Alpine Linux base images
- Chỉ copy required files vào production stage

### Build Time Optimization

- Cached layer strategy
- Shared dependency installation
- Parallel build stages where possible

### Runtime Optimization

- Health check tuning
- Resource limit configuration
- Proper restart policies

## 🎯 Best Practices

### Development Workflow

1. **Local Development**: Sử dụng `bun run dev`
2. **Testing**: Build local trước khi deploy
3. **Staging**: Test trên staging environment trước
4. **Production**: Sử dụng automated deployment script

### Backup Strategy

1. **Database**: Daily automated backups
2. **Application**: Version control với Git tags
3. **Environment**: Secure backup của .env.prod

### Monitoring Setup

1. **Application Logs**: Centralized logging
2. **Health Checks**: Automated monitoring
3. **Performance**: Resource usage tracking

## 🚀 Advanced Deployment Options

### Cloud Provider Specific

**AWS ECS/Fargate:**
```bash
# Adapt docker-compose for ECS task definition
# Use AWS RDS for database
# Configure ALB for load balancing
```

**Google Cloud Run:**
```bash
# Build and push to GCR
docker build -t gcr.io/PROJECT_ID/tazacore-api ./api
docker push gcr.io/PROJECT_ID/tazacore-api
```

**Azure Container Instances:**
```bash
# Use Azure Container Registry
# Configure Azure Database for PostgreSQL
```

### Kubernetes Deployment

```yaml
# Example k8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tazacore-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tazacore-api
  template:
    spec:
      containers:
      - name: api
        image: tazacore/api:latest
        ports:
        - containerPort: 3001
```

---

## 📞 Support

Nếu gặp vấn đề trong quá trình deployment:

1. Kiểm tra logs: `docker-compose logs -f`
2. Verify environment: `./verify-deployment.sh`
3. Check documentation trong `docs/` directory
4. Run cleanup nếu cần: `./deploy-shared-prisma.sh clean`

🎉 **Happy Deploying with Shared Prisma!**
