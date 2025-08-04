#!/bin/bash

echo "🔄 Migrating site/ to root directory..."

# Backup current structure
echo "📦 Creating backup..."
tar -czf site-backup-$(date +%Y%m%d_%H%M%S).tar.gz site/

# Create temporary directory
mkdir -p temp_migration

# Move site contents to temp
echo "📁 Moving site contents to temporary directory..."
cp -r site/* temp_migration/
cp -r site/.* temp_migration/ 2>/dev/null || true

# Move current root files to avoid conflicts
echo "📁 Backing up root files..."
mkdir -p root_backup
for file in package.json tsconfig.json next.config.* tailwind.config.* postcss.config.* eslint.config.*; do
    if [ -f "$file" ]; then
        mv "$file" root_backup/
    fi
done

# Move site contents to root
echo "🔄 Moving site contents to root..."
cp -r temp_migration/* .
cp -r temp_migration/.* . 2>/dev/null || true

# Update Dockerfile for new structure
echo "🔧 Updating Dockerfile..."
cat > Dockerfile << 'EOF'
FROM oven/bun:1-alpine AS base

# Install essential packages for Alpine + musl compatibility
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    ca-certificates \
    tzdata

# Dependencies stage with better caching
FROM base AS deps
WORKDIR /app

# Copy package files (now from root)
COPY package.json bun.lockb* ./

# Copy Prisma from root directory
COPY prisma ./prisma

# Install dependencies with Bun
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Generate Prisma client for Alpine/musl
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bunx prisma generate --schema=./prisma/schema.prisma

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies and generated Prisma client
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code (now from root)
COPY . .

# Build arguments
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
ARG DATABASE_URL
ARG NEXTAUTH_SECRET

# Build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# Build with Bun (faster compilation)
RUN --mount=type=cache,target=/app/.next/cache \
    NODE_OPTIONS="--max-old-space-size=4096" \
    SKIP_ENV_VALIDATION=true \
    bun run build && \
    rm -rf node_modules/.cache && \
    rm -rf .next/cache/webpack

# Production stage using Bun runtime
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    ca-certificates

# Create app user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma client
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Use dumb-init for proper signal handling and Bun for execution
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "server.js"]
EOF

# Clean up
rm -rf temp_migration

echo "✅ Migration completed!"
echo "📁 Original site/ directory preserved"
echo "📁 Root backup stored in root_backup/"
echo "🔧 Dockerfile updated for new structure"
echo ""
echo "Next steps:"
echo "1. Update docker-compose.yml"
echo "2. Test the new structure"
echo "3. Remove site/ directory when satisfied"
