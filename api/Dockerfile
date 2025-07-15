# Multi-stage build for NestJS API - Optimized for production with shared Prisma
FROM oven/bun:1-alpine AS base

# Install security updates and necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl wget git && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Dependencies stage
FROM base AS deps

# Copy package files for both API and shared
COPY api/package.json api/bun.lockb* ./
COPY shared/package.json ./shared/package.json

# Install dependencies with better error handling
RUN bun install --frozen-lockfile || \
    { echo "Dependencies installation failed, retrying..."; \
      rm -rf node_modules; \
      bun install --no-cache; }

# Shared Prisma setup stage
FROM deps AS shared-setup

# Copy shared Prisma configuration
COPY shared ./shared

# Install shared dependencies and generate Prisma client
RUN echo "Setting up shared Prisma for API..." && \
    cd shared && \
    bun install --no-cache && \
    echo "Generating Prisma client..." && \
    bunx prisma generate && \
    echo "Prisma client generated successfully" && \
    ls -la node_modules/.prisma/ && \
    cd ..

# Build stage
FROM shared-setup AS builder

# Copy API source code
COPY api .

# Create symlink to shared prisma for API
RUN ln -sf ../shared/prisma ./prisma

# Set build environment
ENV NODE_ENV=production

# Clean any existing dist directory and verify Prisma setup
RUN echo "Cleaning previous builds..." && \
    rm -rf dist && \
    echo "Verifying Prisma setup before build..." && \
    ls -la shared/ && \
    ls -la shared/node_modules/.prisma/ || echo "Shared Prisma client check" && \
    echo "Copying Prisma client to API node_modules..." && \
    mkdir -p node_modules/@prisma && \
    cp -r shared/node_modules/@prisma/client node_modules/@prisma/ && \
    ls -la node_modules/@prisma/ && \
    echo "Building NestJS application..." && \
    bun run build && \
    echo "Build completed successfully" && \
    ls -la dist/

# Production stage - Minimal image
FROM base AS production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs --ingroup nodejs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Create necessary directories and set permissions
RUN mkdir -p logs && \
    chown -R nestjs:nodejs logs

# Copy production files with proper permissions
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Copy shared Prisma configuration for runtime
COPY --from=builder --chown=nestjs:nodejs /app/shared ./shared

# Create prisma symlink for runtime
RUN ln -sf ../shared/prisma ./prisma

# Verify Prisma client is available at runtime
RUN echo "Verifying runtime Prisma setup..." && \
    ls -la shared/ && \
    ls -la shared/node_modules/.prisma/ 2>/dev/null || \
    ls -la node_modules/.prisma/ 2>/dev/null || \
    ls -la node_modules/@prisma/ 2>/dev/null || \
    echo "Prisma client runtime verification completed"

USER nestjs

EXPOSE 3001

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3001/health || curl -f http://localhost:3001/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "dist/main.js"]
