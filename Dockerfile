# syntax=docker/dockerfile:1
# TaxiFlash — imagen de producción (Next.js standalone + Prisma)

FROM node:22-alpine AS base
RUN npm install -g pnpm@11
WORKDIR /app

# ------------------------------------------------------------
# Dependencias
# ------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------
# Build (también lo usa el servicio "migrate" del docker-compose,
# que necesita el CLI de prisma, tsx y el código fuente)
# ------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
# Variables NEXT_PUBLIC_* se hornean en el bundle en build-time.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3500
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm build

# ------------------------------------------------------------
# Runtime mínimo
# ------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
