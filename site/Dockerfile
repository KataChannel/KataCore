# Multi-stage build for Next.js Frontend - Fixed version with better error handling
FROM oven/bun:1-alpine AS base

# Install security updates and necessary packages for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat curl wget && \
    rm -rf /var/cache/apk/*

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files first
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Add required environment variables for build
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
# Provide a fallback DATABASE_URL for Prisma client generation during build
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client before building
RUN if [ -f "src/prisma/schema.prisma" ]; then \
    echo "Generating Prisma client..."; \
    cd src && bunx prisma generate --schema=prisma/schema.prisma || \
    bun run prisma generate --schema=src/prisma/schema.prisma || \
    bunx prisma generate --schema=src/prisma/schema.prisma; \
    cd ..; \
    fi

# Debug: Show environment and package info
RUN echo "Build environment:" && env | grep -E "(NODE_ENV|NEXT_|DOCKER_|DATABASE_)" && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 '"scripts"' && \
    echo "Checking for Prisma client:" && ls -la node_modules/.prisma/ 2>/dev/null || echo "Prisma client not found"

# Build the application with comprehensive error handling
RUN set -e; \
    echo "Starting Next.js build..."; \
    bun run build 2>&1 | tee /tmp/build.log && BUILD_SUCCESS=true || BUILD_SUCCESS=false; \
    \
    if [ "$BUILD_SUCCESS" = "false" ]; then \
        echo "=== BUILD FAILED ==="; \
        echo "Last 50 lines of build output:"; \
        tail -n 50 /tmp/build.log; \
        echo "=== Environment variables ==="; \
        env | sort; \
        echo "=== Disk space ==="; \
        df -h; \
        echo "=== Memory usage ==="; \
        free -h || true; \
        echo "=== Node modules check ==="; \
        ls -la node_modules/ | head -10; \
        echo "Retrying after cleaning up..."; \
        rm -rf node_modules/.cache .next; \
        bun install --force; \
        bun run build || { \
            echo "Second build attempt failed, trying without standalone mode"; \
            export DOCKER_BUILD=false; \
            bun run build; \
        }; \
    fi

# Prepare build output structure
RUN echo "Preparing build output..." && \
    ls -la .next/ && \
    echo "Build completed successfully"

# Create fallback structure for production
RUN if [ ! -d ".next/standalone" ]; then \
        echo "Creating standalone structure manually..."; \
        mkdir -p .next/standalone; \
        cp package.json .next/standalone/ || true; \
        cp -r .next/server .next/standalone/ 2>/dev/null || true; \
        cp -r public .next/standalone/ 2>/dev/null || true; \
        echo '{"name":"site","scripts":{"start":"next start"}}' > .next/standalone/package.json; \
        echo 'const { createServer } = require("http"); const { parse } = require("url"); const next = require("next"); const app = next({ dev: false }); const handle = app.getRequestHandler(); app.prepare().then(() => { createServer((req, res) => { const parsedUrl = parse(req.url, true); handle(req, res, parsedUrl); }).listen(3000, (err) => { if (err) throw err; console.log("> Ready on http://localhost:3000"); }); });' > .next/standalone/server.js; \
    fi && \
    if [ ! -d ".next/static" ]; then \
        echo "Creating static directory..."; \
        mkdir -p .next/static; \
    fi

# Production stage - Minimal image
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy public files if they exist
COPY --from=builder /app/public ./public

# Create .next directory and set permissions
RUN mkdir -p .next/static && chown -R nextjs:nodejs .next

# Copy build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/

# Copy node_modules if using non-standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]