# syntax=docker/dockerfile:1
# TaxiFlash — imagen de producción (Next.js standalone + Prisma)

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org -g \
    && yarn config set network-timeout 600000 -g \
    && yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
ARG NEXT_PUBLIC_APP_URL=http://localhost:3500
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
