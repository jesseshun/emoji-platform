#!/usr/bin/env bash
# Shared configuration for Preview scripts.
# Sourced by every other script in scripts/preview/.
# Does NOT print secrets. Loads .env.preview (server-created, git-ignored) for
# variable checks and passes it to docker compose via --env-file.
set -euo pipefail

# Repo root = two levels up from scripts/preview/.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

COMPOSE_FILE="$REPO_ROOT/docker-compose.preview.yml"
# Default to repo .env.preview (server). Local validation may override with
# PREVIEW_ENV_FILE pointing at a temp file (e.g. /tmp/...env).
ENV_FILE="${PREVIEW_ENV_FILE:-$REPO_ROOT/.env.preview}"
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-emoji-platform-preview}"

export SCRIPT_DIR REPO_ROOT COMPOSE_FILE ENV_FILE PROJECT_NAME

# Load .env.preview into the environment for variable checks (NOT printed).
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

# Echo a message to stderr without leaking secret values.
log() {
  printf '%s\n' "$*" >&2
}
