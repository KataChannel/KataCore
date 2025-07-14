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
    bun install --frozen-lockfile && \
    bunx prisma generate && \
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

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "start"]
