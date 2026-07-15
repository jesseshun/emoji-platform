# syntax=docker/dockerfile:1
# Emoji Platform — Admin (Next.js standalone) — multi-stage build for preview/production.
# Mirror of apps/web/Dockerfile (separate Next app, port 3001).

FROM node:22-alpine AS base
ENV PNPM_HOME=/usr/local/bin
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
# Copy the COMPLETE node_modules tree from deps (root + per-package), including
# the hoisted root .bin/tsc and the workspace symlinks. This lets us build the
# shared/types workspace deps (whose dist the admin app consumes at build time).
COPY --from=deps /app ./
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin ./apps/admin
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
# Build the workspace deps whose RUNTIME dist the admin app consumes. `ui` is
# imported from source (main -> ./src/index.ts) and transpiled by Next, so it
# needs no separate build step.
RUN pnpm --filter @emoji-platform/types build \
 && pnpm --filter @emoji-platform/shared build \
 && pnpm --filter @emoji-platform/admin build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3001
ENV PORT=3001
# Standalone server is nested under apps/admin/ in this monorepo layout.
CMD ["node", "apps/admin/server.js"]
