#!/usr/bin/env bash
# Validate that .env.preview exists and required variables are non-empty.
# Does NOT print secret values. Exits non-zero on any problem.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$SCRIPT_DIR/config.sh"

if [ ! -f "$ENV_FILE" ]; then
  log "ERROR: .env.preview not found at $ENV_FILE"
  log "Copy .env.preview.example to .env.preview and fill in values on the server."
  exit 1
fi

# Always-required variables for the default (database) deployment.
REQUIRED="DATABASE_URL JWT_SECRET POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB"
missing=0
for v in $REQUIRED; do
  if [ -z "${!v:-}" ]; then
    log "ERROR: required variable '$v' is empty in .env.preview"
    missing=1
  fi
done

# If the optional search profile is requested, Meilisearch key is required.
if [ "${USE_SEARCH_PROFILE:-}" = "1" ]; then
  if [ -z "${MEILISEARCH_API_KEY:-}" ]; then
    log "ERROR: MEILISEARCH_API_KEY is required when USE_SEARCH_PROFILE=1"
    missing=1
  fi
  if [ -z "${MEILISEARCH_INDEX_PREFIX:-}" ]; then
    log "ERROR: MEILISEARCH_INDEX_PREFIX is required when USE_SEARCH_PROFILE=1"
    missing=1
  fi
fi

if [ "$missing" -ne 0 ]; then
  log "Validation FAILED. Fix the variables above in .env.preview."
  exit 1
fi

log "OK: .env.preview validation passed (required variables present)."
