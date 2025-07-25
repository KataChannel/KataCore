FROM oven/bun:1-alpine AS base

# Install only essential packages
RUN apk add --no-cache libc6-compat dumb-init

# Dependencies stage with better caching
FROM base AS deps
WORKDIR /app

# Copy only package files first for better layer caching
COPY site/package.json site/bun.lockb* ./

# Install dependencies including devDependencies for build stage
RUN --mount=type=cache,target=/root/.bun \
    bun install --frozen-lockfile

# Copy prisma schema after dependencies
COPY site/prisma ./prisma

# Generate Prisma client with explicit binary path
RUN bun add prisma @prisma/client && \
    bunx prisma generate

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
# Copy prisma generated files from deps stage
COPY --from=deps /app/prisma ./prisma
COPY site/ .

# Build arguments
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000

# Build with optimizations
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# Skip Prisma generation in build since it's already done in deps stage
# Build with standalone output and optimize
RUN NODE_OPTIONS="--max-old-space-size=4096" bun run build:optimized && \
    rm -rf .next/cache && \
    rm -rf node_modules/@next/swc-* && \
    rm -rf node_modules/.cache

# Production stage - Ultra minimal
FROM oven/bun:1-distroless AS production
WORKDIR /app

# Copy only necessary files
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma runtime files only
COPY --from=deps /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /app/prisma ./prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Use dumb-init for signal handling
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["bun", "run", "server.js"]
