# Simple Dockerfile for Next.js Site - Fallback option
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache libc6-compat curl wget dumb-init
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY site/package.json site/package-lock.json* site/yarn.lock* site/pnpm-lock.yaml* ./
COPY shared/package.json ./shared/package.json

# Install dependencies
RUN npm ci --only=production || npm install --production

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY shared ./shared
COPY site .

# Generate Prisma client
RUN cd shared && npm install && npx prisma generate && cd ..

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

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

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/shared ./shared

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
