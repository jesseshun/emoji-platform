#!/usr/bin/env bash
# Seed the Preview database with public/sample data (categories, admin user, ...).
# Runs INSIDE the api container. Explicit only — never automatic.
# Idempotent via Prisma upserts (safe to re-run). Does NOT import production data.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/config.sh"

# Run the seed via tsx directly (no pnpm workspace resolution). The seed uses
# Prisma upserts, so it is idempotent and safe to re-run.
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file "$ENV_FILE" \
  exec -T api sh -c "cd /app/apps/api && ./node_modules/.bin/tsx prisma/seed.ts"
