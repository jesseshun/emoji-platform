FROM node:22-alpine AS base

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
RUN pnpm --filter @emoji-platform/api build

FROM base AS runner
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
RUN pnpm install --frozen-lockfile --prod

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
