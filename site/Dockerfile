FROM oven/bun:1-alpine AS base

# Install security updates and necessary packages 123
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
    bunx prisma generate

# Build stage
FROM shared-setup AS builder
WORKDIR /app

# Copy source code
COPY site/ .

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

# Setup Prisma client for Next.js build
RUN mkdir -p prisma && \
    cp shared/prisma/schema.prisma prisma/schema.prisma && \
    bunx prisma generate

# Build the Next.js application
RUN echo "Building Next.js application..." && \
    bun run build && \
    echo "Build completed successfully" && \
    ls -la .next/

# Validate .next build output
RUN if [ ! -d ".next" ]; then \
        echo "Error: .next directory not found after build"; \
        exit 1; \
    fi && \
    echo ".next directory contents:" && \
    ls -la .next/ && \
    echo "Build validation completed"

# Production stage
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

# Copy public files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/ 2>/dev/null || \ echo "No public directory found"

# Create necessary directories
RUN mkdir -p .next logs && \
    chown -R nextjs:nodejs .next logs

# Copy build output and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

# Ensure Prisma client is available
RUN mkdir -p node_modules/@prisma && \
    cp -r shared/node_modules/@prisma/client node_modules/@prisma/ 2>/dev/null || \
    echo "Prisma client available from shared"

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "start"]
