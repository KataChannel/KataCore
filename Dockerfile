# Multi-stage Dockerfile supporting both build and prebuilt modes
ARG BUILD_MODE=prebuilt

# ========================================
# STAGE 1: Dependencies (for build mode only)
# ========================================
FROM oven/bun:1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# ========================================
# STAGE 2: Builder (for build mode only)
# ========================================
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Disable linting and type checking for resource optimization
ENV SKIP_LINT=true
ENV SKIP_TYPE_CHECK=true

# Build the application with memory optimization
ENV DOCKER_BUILD=true
RUN bunx prisma generate
RUN NODE_OPTIONS="--max-old-space-size=384" bun run build

# ========================================
# STAGE 3: Runtime (for prebuilt mode)
# ========================================
FROM oven/bun:1-alpine AS runtime

# Install minimal runtime dependencies
RUN apk add --no-cache curl dumb-init && \
    rm -rf /var/cache/apk/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy pre-built application files (for prebuilt mode)
COPY --chown=nextjs:nodejs .next/standalone ./ 
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
# Copy app directory for App Router support
COPY --chown=nextjs:nodejs app ./app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "server.js"]

# ========================================
# STAGE 4: Runtime with build (for build mode)
# ========================================
FROM oven/bun:1-alpine AS runtime-build

# Install minimal runtime dependencies
RUN apk add --no-cache curl dumb-init && \
    rm -rf /var/cache/apk/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy app directory for App Router support
COPY --from=builder --chown=nextjs:nodejs /app/app ./app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "server.js"]
