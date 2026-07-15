# Tencent Cloud Preview Server — Deployment Checklist (Phase 7C-2)

> This is the **pre-deployment checklist** for the real Tencent Cloud small-server preview.
> **No real values are filled in.** Replace every `<...>` on the actual server with project-owned
> strong random values generated there. Never write real IP / password / JWT / Meili key / GitHub PAT
> into this repo, commit messages, or any chat.

## 0. Before you start

- [ ] Phase 7C-1 artifacts merged and pushed (`main`); local Docker validation passed.
- [ ] You have explicit authorization to connect to the server and deploy (Phase 7C-2).
- [ ] A server (CVM) provisioned; OS = TencentOS / Ubuntu 22.04 LTS minimal.
- [ ] You will **not** submit a real `.env.preview`, real IP, or real secrets to git.

## 1. Server sizing (low-spec friendly)

- [ ] 1C2G: keep `SEARCH_PROVIDER=database` (Meilisearch off), add 2 GB swap.
- [ ] 2C4G: full stack incl. Meilisearch profile is comfortable.
- [ ] Disk: ≥ 20 GB system + Docker overlay; preview DB volume on the system disk is fine for preview.
- [ ] Swap file created (e.g. 2 GB) and enabled at boot for 1C2G.

## 2. Network & security group (expose as little as possible)

- [ ] **Only** Nginx ports are published: `80/tcp` (web), `8081/tcp` (admin), `8082/tcp` (api).
- [ ] **Do NOT** open `22/tcp` to `0.0.0.0/0` — restrict SSH to your IP, or use the console/VPN.
- [ ] **Do NOT** publish Postgres (`5432`) or Meilisearch (`7700`) — they stay internal.
- [ ] Inbound HTTPS (`443`) only if you have a valid cert + domain; otherwise HTTP on the three ports is acceptable for an internal preview. No self-signed cert in front of Nginx for now.
- [ ] Access mode chosen: **IP + port** (simplest, no ICP needed) **or** `preview.example.com` subdomain (needs the domain + ICP consideration). Document the chosen mode; Nginx uses `server_name _` so either works without config edits.

## 3. Host prerequisites

- [ ] Docker Engine + Docker Compose v2 installed.
- [ ] Non-root deploy user in the `docker` group; operations done as that user.
- [ ] Firewall (host `firewalld`/`ufw`) matches the security group above.
- [ ] Server time synced (NTP); timezone set.
- [ ] Repository cloned to a non-public path (e.g. `/srv/emoji-platform`); `git status` clean.

## 4. Secrets — generate on the server, never reuse

For each value below, run on the server and paste ONLY into the server's `.env.preview`:

```bash
# Strong random JWT secret (>= 32 bytes)
openssl rand -base64 32
# Strong random Postgres password
openssl rand -base64 24
# Strong random Meilisearch key (only if enabling the search profile)
openssl rand -base64 32
```

- [ ] `JWT_SECRET` = fresh random (>= 32 bytes); **not** reused from any other environment.
- [ ] `POSTGRES_PASSWORD` = fresh random; `DATABASE_URL` uses it and the internal `postgres:5432` host.
- [ ] `MEILISEARCH_API_KEY` = fresh random (only if using the `search` profile).
- [ ] `COOKIE_SECURE` = `true` if served over HTTPS, `false` for plain IP+port.
- [ ] `CORS_ORIGIN` / `WEB_BASE_URL` / `ADMIN_BASE_URL` / `ADMIN_ALLOWED_ORIGINS` match the chosen access mode.
- [ ] `PREVIEW_NOINDEX=true` (keep preview out of indexes).
- [ ] `.env.preview` is `chmod 600` and git-ignored (already in `.gitignore`).

## 5. Bring-up

```bash
cd /srv/emoji-platform
git pull origin main

# Build + start (preview project name avoids clobbering other stacks)
COMPOSE_PROJECT_NAME=emoji-platform-preview \
  docker compose -f docker-compose.preview.yml --env-file .env.preview up -d --build

# Wait for postgres healthy, then migrate + seed
COMPOSE_PROJECT_NAME=emoji-platform-preview \
  docker compose -f docker-compose.preview.yml --env-file .env.preview exec -T api \
  ./apps/api/node_modules/.bin/prisma migrate deploy --schema /app/apps/api/prisma/schema.prisma

COMPOSE_PROJECT_NAME=emoji-platform-preview \
  docker compose -f docker-compose.preview.yml --env-file .env.preview exec -T api \
  sh -c "cd /app/apps/api && ./node_modules/.bin/tsx prisma/seed.ts"

# Or use the wrappers (set PROJECT_NAME via COMPOSE_PROJECT_NAME):
COMPOSE_PROJECT_NAME=emoji-platform-preview bash scripts/preview/migrate.sh
COMPOSE_PROJECT_NAME=emoji-platform-preview bash scripts/preview/seed.sh
```

- [ ] All five core containers up; `api` health = `healthy` (`/api/v1/status` → `database:connected`).
- [ ] Migrations applied (one `init` migration); seed created emojis/topics/articles.

## 6. Smoke test (through Nginx)

- [ ] `curl -i http://<SERVER_IP>/api/v1/health` → 200.
- [ ] `curl -i http://<SERVER_IP>/api/v1/status` → `database:connected`.
- [ ] `curl -i http://<SERVER_IP>/` → 200 (web home).
- [ ] `curl -i http://<SERVER_IP>:8081/` → redirects to admin login.
- [ ] `curl -i http://<SERVER_IP>/robots.txt` → `Disallow: /admin/`.
- [ ] **`X-Robots-Tag: noindex, nofollow, noarchive`** present on `:80`, `:8081`, `:8082`.

## 7. Backup & operations

- [ ] Named volume `postgres_preview_data` holds the preview DB; snapshot/backup before any destructive op.
- [ ] `scripts/preview/status.sh` / `logs.sh` for day-2 ops.
- [ ] Log rotation already set (json-file, 10m × 3) in compose.
- [ ] Rollback = `git checkout <last-good>` + `up -d --build`; data volume persists.

## 8. After deploy

- [ ] Tag `phase-7c-complete` **only after** a successful real deployment (Phase 7C-2).
- [ ] Update HANDOFF: mark Phase 7C completed; note access URL/mode.
- [ ] Update CHANGELOG with the real-deploy summary (no secrets).
- [ ] Do NOT publish the preview URL to search engines; keep `noindex`.

## 9. Do NOT (guardrails)

- [ ] Do NOT open Postgres/Meili to the public internet.
- [ ] Do NOT commit `.env.preview` or any real secret.
- [ ] Do NOT reuse production secrets for preview.
- [ ] Do NOT put a GitHub PAT in `.env`, git config, or any file.
- [ ] Do NOT enable Meilisearch unless the server has the RAM; keep `database` fallback otherwise.
