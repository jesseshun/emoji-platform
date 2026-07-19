# syntax=docker/dockerfile:1
# Emoji Platform — Web (Next.js standalone) — multi-stage build for preview/production.
# - Node 22 LTS, pnpm via corepack.
# - output: 'standalone' (see apps/web/next.config.js): the built server is at
#   .next/standalone/server.js and app assets under apps/web/.next.
# - NEXT_PUBLIC_API_URL is a PUBLIC value baked at build time (no secret).

FROM node:22-alpine AS base
ENV PNPM_HOME=/usr/local/bin
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
# Copy the COMPLETE node_modules tree from deps (root + per-package), including
# the hoisted root .bin/tsc and the workspace symlinks. This lets us build the
# shared/types workspace deps (whose dist the web app imports at build time).
COPY --from=deps /app ./
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
# Public API origin baked into the client bundle at build time.
# Default "/" => the browser calls the API through the SAME origin (nginx proxies
# /api -> api:4000), avoiding cross-origin CORS and keeping the API internal.
ARG NEXT_PUBLIC_API_URL=/
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ADMIN_URL=http://localhost:8081
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}
ENV NEXT_TELEMETRY_DISABLED=1
# Build the workspace deps whose RUNTIME dist the web app consumes. `ui` is
# imported from source (main -> ./src/index.ts) and transpiled by Next, so it
# needs no separate build step.
RUN pnpm --filter @emoji-platform/types build \
 && pnpm --filter @emoji-platform/shared build \
 && pnpm --filter @emoji-platform/web build

FROM base AS runner
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ADMIN_URL=http://localhost:8081
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Standalone server + its pruned node_modules.
COPY --from=builder /app/apps/web/.next/standalone ./
# App assets referenced by the standalone server.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Next.js standalone server runs as the unprivileged `nextjs` user, but at
# runtime it writes the incremental/prerender cache to
# /app/apps/web/.next/cache. Create that directory and grant ownership to
# nextjs so SSR cache writes don't fail with EACCES (which surfaced as a
# 502 Bad Gateway from nginx on the first external request in prod).
RUN mkdir -p /app/apps/web/.next/cache && chown -R nextjs:nodejs /app/apps/web/.next

USER nextjs

EXPOSE 3000
ENV PORT=3000
# Standalone server is nested under apps/web/ in this monorepo layout.
CMD ["node", "apps/web/server.js"]
