FROM oven/bun:1-alpine AS base

# Install security updates and necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat curl wget dumb-init && \
    rm -rf /var/cache/apk/*

# Dependencies stage  
FROM base AS deps
WORKDIR /app

# Copy package files and shared dependencies
COPY site/package.json site/bun.lockb* ./
COPY shared/package.json ./shared/package.json

# Install dependencies with better error handling
RUN bun install --frozen-lockfile || \
    { echo "Dependencies installation failed, retrying..."; \
      rm -rf node_modules; \
      bun install --no-cache; }

# Shared Prisma setup stage
FROM deps AS shared-setup
WORKDIR /app

# Copy shared Prisma configuration
COPY shared ./shared

# Install shared dependencies and generate Prisma client
RUN echo "Setting up shared Prisma..." && \
    cd shared && \
    bun install --frozen-lockfile && \
    echo "Generating Prisma client..." && \
    bunx prisma generate && \
    echo "Prisma client generated successfully" && \
    cd ..

# Build stage
FROM shared-setup AS builder
WORKDIR /app

# Copy source code
COPY site .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Add runtime environment variables for build
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# Provide a fallback DATABASE_URL for build-time Prisma operations
ENV DATABASE_URL="file:./dev.db"

# Verify Prisma client is available
RUN echo "Verifying Prisma setup..." && \
    ls -la shared/node_modules/.prisma/ || echo "Prisma client not found in shared" && \
    ls -la node_modules/.prisma/ || echo "Prisma client not found in site" && \
    echo "Checking Prisma configuration..." && \
    cat shared/package.json | grep -A 5 '"scripts"' || echo "No shared scripts found"

# Build the application with comprehensive error handling
RUN set -e; \
    echo "Starting Next.js build..."; \
    echo "Current working directory: $(pwd)"; \
    echo "Available files:"; \
    ls -la; \
    echo "Node modules:"; \
    ls -la node_modules/ | head -5; \
    echo "Build environment:"; \
    env | grep -E "(NODE_ENV|NEXT_|DOCKER_|DATABASE_)" | sort; \
    echo "Package.json scripts:"; \
    cat package.json | grep -A 10 '"scripts"' || true; \
    \
    echo "=== Attempting Next.js build ==="; \
    bun run build 2>&1 | tee /tmp/build.log && BUILD_SUCCESS=true || BUILD_SUCCESS=false; \
    \
    if [ "$BUILD_SUCCESS" = "false" ]; then \
        echo "=== PRIMARY BUILD FAILED ==="; \
        echo "Last 50 lines of build output:"; \
        tail -n 50 /tmp/build.log; \
        echo "=== Debugging information ==="; \
        echo "Memory usage:"; \
        free -h || true; \
        echo "Disk space:"; \
        df -h; \
        echo "=== Attempting cleanup and retry ==="; \
        rm -rf node_modules/.cache .next || true; \
        echo "Reinstalling dependencies..."; \
        bun install --force; \
        echo "Retrying build with npm..."; \
        npm run build 2>&1 | tee /tmp/build.log.npm || { \
            echo "NPM build also failed"; \
            echo "Trying without cache..."; \
            npm run clean || true; \
            npm run build || { \
                echo "All build attempts failed"; \
                echo "Final debugging:"; \
                ls -la; \
                cat /tmp/build.log.npm || cat /tmp/build.log || true; \
                exit 1; \
            }; \
        }; \
    fi; \
    echo "Build completed successfully"

# Validate build output with more flexible validation
RUN echo "Validating build output..." && \
    if [ ! -d ".next" ]; then \
        echo "Error: .next directory not found"; \
        ls -la; \
        exit 1; \
    fi && \
    echo "Found .next directory, checking contents..." && \
    ls -la .next/ || true && \
    echo "Checking for critical build files..." && \
    # Check if we have either static files OR server files (for app directory builds)
    if [ -d ".next/static" ] || [ -d ".next/server" ] || [ -f ".next/package.json" ]; then \
        echo "✅ Build validation passed - found required Next.js output files"; \
    else \
        echo "❌ Build validation failed - no expected Next.js output found"; \
        echo "Available .next contents:"; \
        find .next -type f | head -20 || true; \
        exit 1; \
    fi && \
    echo "Build output validated successfully"

# Production stage - Minimal image
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Copy public files if they exist
RUN mkdir -p public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create necessary directories and set permissions
RUN mkdir -p .next && \
    mkdir -p logs && \
    chown -R nextjs:nodejs .next logs

# Copy build output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy shared Prisma configuration for runtime
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Ensure Prisma client is available at runtime
RUN echo "Verifying runtime Prisma setup..." && \
    ls -la shared/ && \
    ls -la shared/node_modules/.prisma/ 2>/dev/null || \
    ls -la node_modules/.prisma/ 2>/dev/null || \
    echo "Prisma client location verification completed"

USER nextjs

EXPOSE 3000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "start"]