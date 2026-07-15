# Phase 7C — Preview Docker Deployment

> Status: **Phase 7C-1 completed** (repository deployment artifacts + local Docker validation passed).
> **Phase 7C-2 pending** (real Tencent Cloud deployment — NOT performed in this phase, no real server connected).
> This document and all referenced files contain **placeholders only**. No real IP / password / token / JWT / Meilisearch key / GitHub PAT is written anywhere.

## 1. Scope split

| Sub-phase | What it covers | Status |
| --- | --- | --- |
| **7C-1** | Turn the preview compose/Dockerfiles from templates into **executable artifacts**, add ops scripts, and **validate locally** with a throwaway project + random test credentials. | ✅ Done this turn |
| **7C-2** | Deploy the built artifacts to a real **Tencent Cloud** small server (security group, DNS/access mode, `.env.preview` with strong random secrets, `git push`, bring-up, smoke test). | ⏳ Pending (separate authorization) |

Phase 7C-1 deliberately does **not**: connect to real servers, run SSH, modify security groups, configure DNS, write real IP/domain/password/JWT/Meili-key/PAT, create a real `.env.preview`, create the `phase-7c-complete` tag, or mark HANDOFF as Phase 7C completed.

## 2. Access architecture (three-port Nginx)

A single low-spec server exposes **only Nginx** on three host ports; everything else stays on the internal `preview` bridge network.

| Host port | Nginx → container | App |
| --- | --- | --- |
| `80`  | `web:3000`   | Frontend (web) |
| `8081`| `admin:3001` | Admin CMS |
| `8082`| `api:4000`   | API |

Rationale: single-port path routing collides with Next.js `/_next` static assets and would require `basePath` changes per app. The three-port scheme keeps each app on its own origin with zero `basePath`/rewrite surgery. Server names use `server_name _` (catch-all) so the preview works on a bare IP, a `preview` subdomain, or an SSH tunnel without editing the config.

## 3. Repository artifacts produced in 7C-1

| File | Purpose |
| --- | --- |
| `docker-compose.preview.yml` | **Executable** compose: `nginx`, `web`, `admin`, `api`, `postgres` always up; `meilisearch` behind the optional `search` profile. Env-driven, required-var guards (`${VAR:?...}`), healthchecks, `service_healthy` ordering, json-file log rotation, named volumes. |
| `apps/web/Dockerfile` | Next.js `standalone` multi-stage build. Bakes `NEXT_PUBLIC_*` (public only) at build time. Non-root `nextjs` user. Builds the `shared`/`types` workspace `dist` it consumes. |
| `apps/admin/Dockerfile` | Mirror of web (port `3001`). |
| `apps/api/Dockerfile` | NestJS multi-stage build. Builds `types`→`shared`→`api` (the API imports their **runtime `dist`**). Non-root `appuser`. Regenerates the Prisma client. Calls `prisma`/`tsx` via direct binaries (no pnpm workspace validation). |
| `.dockerignore` | Excludes `.git`, `node_modules`, `.next`, `dist`, `coverage`, logs, **all real `.env*`** (keeps `*.example`), local DB/Meili data, and `scripts/preview/*.env`. |
| `nginx/preview.conf.template` | Official Nginx envsubst template. Three server blocks, `server_tokens off`, WebSocket upgrade, `X-Forwarded-*`, `client_max_body_size 20m`, and `X-Robots-Tag: noindex, nofollow, noarchive` on **every** port. No HTTPS/cert, no PG/Meili exposure. |
| `scripts/preview/*.sh` | `validate-env`, `config`, `build`, `up`, `down`, `status`, `logs`, `migrate`, `seed`. All `set -euo pipefail`, no secret output, check `.env.preview` + required vars, use `docker compose -f docker-compose.preview.yml -p <project>`, `prisma migrate deploy`, explicit seed. |
| `package.json` (`preview:*`) | `preview:validate/config/build/up/down/status/logs/migrate/seed` wrappers (existing scripts untouched). |

## 4. Key engineering decisions (and the traps avoided)

- **Workspace `dist` for the API.** The API imports `@emoji-platform/shared`/`@emoji-platform/types` at runtime, so their `dist` must be built inside the image. `packages/types`/`shared` declared no `typescript` dependency, so `tsc` was not resolvable during the filtered build. Fix: each lib now declares `typescript` as its own `devDependency` (also correct in general).
- **Complete `node_modules` copy.** pnpm stores per-package `.bin`/symlinks under `packages/*/node_modules`, **not** only root `node_modules`. The builder copies the **entire** `/app` from the `deps` stage (root + per-package) so `tsc` and workspace links resolve.
- **No `pnpm prune --prod`.** Pruning a *partial* workspace (only `api`/`shared`/`types` installed in the deps stage) mis-classifies packages and strips the **prod** `prisma` bin. The api deps stage only installs the api subgraph (no `web`/`admin`/`ui` deps), so the unpruned image is already lean — and smaller than pulling `web`/`admin` prod deps in.
- **Direct `prisma`/`tsx` binaries for migrate/seed.** `pnpm --filter @emoji-platform/api exec ...` triggers pnpm's workspace "deps status check", which fails when sibling manifests are absent. The scripts (and the Dockerfile generate) call `./apps/api/node_modules/.bin/prisma` / `./apps/api/node_modules/.bin/tsx` directly — no pnpm resolution needed.
- **`prisma generate` as root.** The runner copies `node_modules` (root-owned) then runs generate as root before switching to the `appuser` runtime user.
- **Lib `package.json` copied to the api runtime.** The api's `node_modules` symlinks (`@emoji-platform/shared|types`) resolve to `packages/*`; Node needs their `package.json` (`main → ./dist/index.js`) to load them.

## 5. Security & SEO boundaries

- **No secrets in images.** Dockerfiles copy only `node_modules` / `dist` / `prisma` / `package.json`. No `.env`, no `ARG` secrets, no API secrets at build time; API secrets are injected at runtime via compose `environment`.
- **No public DB / search.** Postgres (`5432`) and Meilisearch (`7700`) are `expose` only — never published to the host. Only Nginx `80/8081/8082` are mapped.
- **`noindex` everywhere.** Nginx adds `X-Robots-Tag: noindex, nofollow, noarchive` to web, admin, and api. `robots.txt` disallows `/admin/` and `/api/v1/admin/`. No SEO submission, no domestic CDN.
- **Default `database` search provider.** `SEARCH_PROVIDER=database` by default; Meilisearch is an opt-in profile and the API falls back to the database automatically when Meili is unavailable.

## 6. Local validation results (7C-1)

Validated with a throwaway project `emoji-platform-preview-test` and random test credentials in `/tmp` (never committed):

- `docker compose config` ✅
- Build `web` / `admin` / `api` images ✅
- `up -d` → `ps`: nginx/web/admin/api healthy, postgres healthy, **meilisearch down** by default ✅
- `preview:migrate` (`prisma migrate deploy`) ✅ · `preview:seed` (idempotent upserts) ✅
- Web: `/`, `/zh/`, `/en/`, `/zh/search?q=开心`, `/en/search?q=happy`, `/robots.txt`, `/sitemap.xml` ✅
- Admin: login redirect, `/admin/search/infrastructure`, `/admin/search/analytics` ✅
- API: `/api/v1/health` (200), `/api/v1/status` (`database:connected`), `/api/v1/search` (provider `database`), `/api/v1/discovery/home`, `/api/v1/recommendations?entityType=emoji&slug=…` (200), admin endpoints **401** unauthenticated ✅
- `X-Robots-Tag: noindex, nofollow, noarchive` on all three ports ✅
- Postgres / Meilisearch **not** on host ports ✅
- Optional Meilisearch profile: `config` valid, service boots healthy ✅
- **DB fallback**: `SEARCH_PROVIDER=meilisearch` with Meili down → `provider:database, fallbackUsed:true` ✅
- **Secret scan**: test credentials absent from repo; `.env.*` gitignored; no secrets baked into images; no DB URL in logs ✅

## 7. Local run (reference)

```bash
# 1) Create a throwaway .env (server side this would be .env.preview with strong random values)
cp .env.preview.example /tmp/preview-test.env
#    edit /tmp/preview-test.env: set DATABASE_URL/JWT_SECRET/POSTGRES_* with `openssl rand -base64 32`
#    keep SEARCH_PROVIDER=database, NGINX_LISTEN_WEB=80, NGINX_LISTEN_ADMIN=8081, NGINX_LISTEN_API=8082

# 2) Build + bring up
PREVIEW_ENV_FILE=/tmp/preview-test.env COMPOSE_PROJECT_NAME=emoji-platform-preview-test \
  bash scripts/preview/build.sh
PREVIEW_ENV_FILE=/tmp/preview-test.env COMPOSE_PROJECT_NAME=emoji-platform-preview-test \
  bash scripts/preview/up.sh

# 3) Migrate + seed (inside the api container)
PREVIEW_ENV_FILE=/tmp/preview-test.env COMPOSE_PROJECT_NAME=emoji-platform-preview-test \
  bash scripts/preview/migrate.sh
PREVIEW_ENV_FILE=/tmp/preview-test.env COMPOSE_PROJECT_NAME=emoji-platform-preview-test \
  bash scripts/preview/seed.sh

# 4) Smoke test via Nginx
curl -i http://localhost/api/v1/health
curl -i http://localhost/robots.txt

# 5) Tear down (keeps volumes). Add `down` only when you also want volumes removed.
PREVIEW_ENV_FILE=/tmp/preview-test.env COMPOSE_PROJECT_NAME=emoji-platform-preview-test \
  bash scripts/preview/down.sh
```

> The `scripts/preview/*.sh` wrappers default `PROJECT_NAME=emoji-platform-preview`. When validating
> with a separate project name, pass `COMPOSE_PROJECT_NAME` (the scripts read it) so `exec` targets the
> right containers.

## 8. Known limitations / follow-ups

- `robots.txt` `Sitemap:` line currently reflects the app's internal base URL; for a real preview domain it should point at the public origin. App-level, not a Docker blocker.
- Full Meilisearch search path requires an authenticated admin **index rebuild** (`POST /api/v1/admin/search/index/rebuild`); unauthenticated local validation only confirms the profile boots and the DB fallback works.
- Phase 7C-2 (real Tencent Cloud) is tracked separately and must be explicitly authorized before any server connection.
