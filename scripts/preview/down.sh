#!/usr/bin/env bash
# Stop the Preview stack. By default volumes (database data) are PRESERVED.
# To also remove volumes, run manually:
#   docker compose -f docker-compose.preview.yml -p emoji-platform-preview down -v
# (Dangerous: deletes preview database data. Not provided as a default script.)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/config.sh"

# No -v: data volumes (postgres_preview_data, meilisearch_preview_data) survive.
docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file "$ENV_FILE" \
  down "$@"
