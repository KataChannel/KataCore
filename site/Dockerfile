# Multi-stage build for Next.js Frontend - Optimized for production
FROM oven/bun:1-alpine AS base

# Install security updates and necessary packages for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat curl wget && \
    rm -rf /var/cache/apk/*

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Set build environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client before building
RUN if [ -f "src/prisma/schema.prisma" ]; then \
    echo "Generating Prisma client..."; \
    bun run prisma generate --schema=src/prisma/schema.prisma || \
    bunx prisma generate --schema=src/prisma/schema.prisma; \
    fi

# Build the application
RUN bun run build

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
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
