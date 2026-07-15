# syntax=docker/dockerfile:1
# Emoji Platform - API (NestJS) - multi-stage build for preview/production.
# - Node 22 LTS (matches engines + dev host).
# - pnpm via corepack.
# - Builds the workspace deps (@emoji-platform/types, @emoji-platform/shared)
#   because the API imports their RUNTIME dist output.
# - Runtime image contains only prod deps + built dist. No .env, no secrets, non-root.

FROM node:22-alpine AS base
ENV PNPM_HOME=/usr/local/bin
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# deps: resolve full workspace graph once (root + per-package node_modules).
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

# builder: reuse the COMPLETE node_modules tree from deps (including the
# per-package node_modules that hold the pnpm workspace symlinks and the
# hoisted root .bin/tsc), then compile workspace deps + api.
FROM base AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
# Copy the whole /app from deps: node_modules (root + packages/*/node_modules)
# plus the manifests. This is what makes `tsc` resolvable for workspace builds.
COPY --from=deps /app ./
# Now overlay the actual source trees on top of the manifests.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma client is required by the API at runtime and by migrate/seed.
RUN pnpm --filter @emoji-platform/api exec prisma generate
# Build order: types -> shared -> api (dependency order).
RUN pnpm --filter @emoji-platform/types build \
 && pnpm --filter @emoji-platform/shared build \
 && pnpm --filter @emoji-platform/api build
# NOTE: we intentionally do NOT `pnpm prune --prod` here. The deps stage only
# installed the api/shared/types subgraph (no web/admin/ui), so this image's
# node_modules already contains just the api's own prod+dev tooling. Pruning a
# PARTIAL workspace mis-classifies packages (e.g. strips the prod `prisma` bin),
# so keeping the full subgraph is both correct and smaller than pulling web/
# admin prod deps into the api image.

# runner: lean prod image.
FROM base AS runner
RUN corepack enable && corepack prepare pnpm@10 --activate
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
WORKDIR /app

# api package.json (prisma db seed reads `prisma.seed`; harmless otherwise).
# We intentionally do NOT copy the other workspace manifests: the migrate/seed
# tooling calls the prisma/tsx binaries directly (no pnpm workspace resolution),
# so there is no pnpm "deps status check" to satisfy.
COPY apps/api/package.json ./apps/api/

# Copy the prod node_modules. The root .pnpm store (with the engines)
# plus the per-package node_modules symlinks are both required at runtime.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Built outputs (workspace dist + api dist).
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist
# Workspace package.json files for shared/types are REQUIRED at runtime: the
# api's node_modules symlinks (@emoji-platform/shared|types) resolve to these
# dirs, and Node needs their package.json (main -> ./dist/index.js) to load them.
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
# Prisma schema + migrations: required for `prisma migrate deploy` executed
# inside this container (migrate/seed scripts).
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Regenerate the Prisma client (direct binary; avoids pnpm workspace deps check).
# Runs as root because node_modules is root-owned by COPY; the runtime user
# (appuser) only needs read access to the generated client.
RUN ./apps/api/node_modules/.bin/prisma generate --schema ./apps/api/prisma/schema.prisma

# Non-root user for runtime.
USER appuser

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000
CMD ["node", "apps/api/dist/main.js"]
