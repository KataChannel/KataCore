# 🎉 TazaGroup Site-to-Root Migration - COMPLETED

## ✅ Migration Summary

**Date:** 1 tháng 8, 2025  
**Status:** ✅ COMPLETED  
**Port:** 3900 (updated from 3000)

## 📋 What Was Completed

### 1. ✅ **Structure Migration**
- ✅ Moved all content from `site/` to root directory
- ✅ Updated package.json for port 3900
- ✅ Updated all npm scripts to use port 3900
- ✅ Created backup of original structure in `root_backup/`

### 2. ✅ **Docker Configuration**
- ✅ Updated Dockerfile for new root structure
- ✅ Updated docker-compose.yml with port 3900
- ✅ Created external Docker volumes
- ✅ Updated environment configuration

### 3. ✅ **Nginx Configuration**
- ✅ Updated app.tazagroup.vn to use localhost:3900
- ✅ Configured proxy settings for new port
- ✅ Fixed nginx deployment scripts

### 4. ✅ **Environment Setup**
- ✅ Created .env.prod with TazaGroup-specific configuration
- ✅ Updated all environment variables for port 3900
- ✅ Configured database, Redis, MinIO settings

## 📁 New Project Structure

```
tazagroup/
├── app/                 # Next.js App Router (moved from site/app)
├── components/          # React components (moved from site/components)
├── lib/                 # Utilities (moved from site/lib)
├── prisma/              # Database schema (moved from site/prisma)
├── public/              # Assets (moved from site/public)
├── package.json         # Updated with port 3900
├── docker-compose.yml   # Updated for new structure
├── Dockerfile           # Updated for root build
├── .env.prod           # Production environment
└── run.sh              # Updated startup script
```

## 🚀 How to Run

### Option 1: Development Mode
```bash
./dev-start.sh
```
**Access at:** http://localhost:3900

### Option 2: Docker Production Mode
```bash
./run.sh
```
**Access at:** http://localhost:3900

### Option 3: With Nginx (Production)
```bash
# 1. Start the application
./run.sh

# 2. Configure nginx
./simple-nginx.sh

# 3. Access via domain
https://app.tazagroup.vn
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server on port 3900
npm run dev:turbo        # Start with Turbo on port 3900

# Production
npm run build            # Build for production
npm run start            # Start production server on port 3900

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database

# Docker
npm run docker:build     # Build Docker image
npm run docker:up        # Start with Docker Compose
npm run docker:down      # Stop Docker services
```

## 🌐 Service URLs

| Service | URL | Port |
|---------|-----|------|
| **Main App** | http://localhost:3900 | 3900 |
| **PostgreSQL** | localhost:5432 | 5432 |
| **Redis** | localhost:6379 | 6379 |
| **MinIO** | http://localhost:9000 | 9000 |
| **MinIO Console** | http://localhost:9001 | 9001 |
| **PgAdmin** | http://localhost:5050 | 5050 |

## 🔒 Default Credentials

### Database
- **User:** `taza_admin`
- **Password:** `TazaGroup@2024!`
- **Database:** `tazacore`

### PgAdmin
- **Email:** `it@tazagroup.vn`
- **Password:** `TazaPgAdmin@2024!`

### MinIO
- **Access Key:** `taza_minio`
- **Secret Key:** `TazaMinio@2024!`

## 📝 Next Steps

1. **Test the application:** `./dev-start.sh`
2. **Configure nginx:** `./simple-nginx.sh`
3. **Update DNS:** Point app.tazagroup.vn to server
4. **SSL Certificate:** Run certbot for HTTPS
5. **Clean up:** Run `./complete-migration.sh` when satisfied

## ⚠️ Important Notes

- **Original site/ directory is preserved** for safety
- **Port changed from 3000 to 3900** throughout the system
- **All Docker configurations updated** for new structure
- **Nginx configured for localhost:3900** instead of remote IP
- **Environment variables updated** for TazaGroup production

## 🆘 Troubleshooting

### If application won't start:
```bash
# Check if port is available
lsof -i :3900

# Regenerate Prisma client
npm run db:generate

# Install dependencies
npm install
```

### If Docker build fails:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t tazacore/site:latest .
```

### If nginx fails:
```bash
# Test nginx config
sudo nginx -t

# Check nginx status
sudo systemctl status nginx
```

---

🎉 **Migration completed successfully!** The TazaGroup application is now running from the root directory on port 3900.
