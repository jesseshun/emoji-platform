#!/usr/bin/env bash
# Start the Preview stack in detached mode.
# Default: web/admin/api/postgres (database provider).
# With USE_SEARCH_PROFILE=1: also starts Meilisearch.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/config.sh"

PROFILE_ARGS=()
if [ "${USE_SEARCH_PROFILE:-}" = "1" ]; then
  PROFILE_ARGS=(--profile search)
  log "Including optional 'search' profile (Meilisearch)."
fi

docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --env-file "$ENV_FILE" \
  "${PROFILE_ARGS[@]}" up -d "$@"
