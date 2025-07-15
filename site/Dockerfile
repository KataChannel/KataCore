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

# Install dependencies
RUN bun install --frozen-lockfile || \
    { rm -rf node_modules; \
      bun install --no-cache; }

# Shared Prisma setup stage
FROM deps AS shared-setup
WORKDIR /app

# Copy shared Prisma configuration
COPY shared ./shared

# Install shared dependencies and generate Prisma client
RUN cd shared && \
    bun install --no-cache && \
    bunx prisma generate && \
    cd .. && \
    # Also generate in the main app directory for Next.js build
    echo "Setting up Prisma for Next.js..." && \
    mkdir -p prisma && \
    cp shared/prisma/schema.prisma prisma/schema.prisma && \
    bunx prisma generate && \
    echo "Verifying Prisma client generation:" && \
    ls -la node_modules/@prisma/ && \
    ls -la node_modules/@prisma/client/ && \
    echo "Prisma client setup completed in shared-setup stage"

# Build stage
FROM shared-setup AS builder
WORKDIR /app

# Copy source code (use . for all contents, not site specifically) 
COPY site/ .

# Remove any prisma symlink and directory to avoid conflicts
RUN rm -rf prisma && \
    echo "Prisma symlink/directory removed"

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

# Ensure Prisma client is available and regenerate if needed
RUN echo "Setting up Prisma client for Next.js build..." && \
    echo "Current working directory: $(pwd)" && \
    echo "Directory contents:" && \
    ls -la && \
    echo "Copying Prisma schema to site directory..." && \
    mkdir -p prisma && \
    cp shared/prisma/schema.prisma prisma/schema.prisma && \
    echo "Generating Prisma client directly in site..." && \
    bunx prisma generate && \
    echo "Verifying Prisma client generation:" && \
    ls -la node_modules/@prisma/ && \
    ls -la node_modules/@prisma/client/ && \
    echo "Prisma client setup completed"

# Build the application
RUN bun run build 2>&1 | tee /tmp/build.log || \
    { echo "Build failed. Error log:"; \
      cat /tmp/build.log; \
      exit 1; }

# Validate build output
RUN if [ ! -d ".next" ]; then \
        echo "Error: .next directory not found"; \
        exit 1; \
    fi && \
    if [ ! -d ".next/static" ] && [ ! -d ".next/server" ] && [ ! -f ".next/package.json" ]; then \
        echo "Error: No expected Next.js output found"; \
        exit 1; \
    fi

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

# Ensure Prisma client is available in production
RUN echo "Setting up Prisma client for production..." && \
    mkdir -p node_modules/@prisma && \
    cp -r shared/node_modules/@prisma/client node_modules/@prisma/ 2>/dev/null || \
    echo "Prisma client will be available from shared directory"

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "start"]
