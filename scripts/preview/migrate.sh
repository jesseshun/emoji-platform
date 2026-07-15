#!/usr/bin/env bash
# Apply Prisma migrations to the Preview database (production-safe: migrate deploy).
# Runs INSIDE the api container so it uses the internal DATABASE_URL and schema.
# Idempotent: safe to re-run. Does NOT reset the database.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/config.sh"

# Run prisma directly (no pnpm workspace resolution) so it works regardless of
# which workspace package manifests are present in the api image.
# Use absolute paths inside the container (the api WORKDIR is /app).
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file "$ENV_FILE" \
  exec -T api ./apps/api/node_modules/.bin/prisma migrate deploy --schema /app/apps/api/prisma/schema.prisma
