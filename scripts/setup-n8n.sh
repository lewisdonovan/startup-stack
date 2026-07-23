#!/usr/bin/env bash
# setup-n8n.sh — Start local n8n via Docker Compose and wait until healthy.
# Usage: bash scripts/setup-n8n.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker-compose.n8n.yml"
BASE_URL="${N8N_BASE_URL:-http://localhost:5678}"
HEALTH_URL="${BASE_URL%/}/healthz"
MAX_WAIT_SECONDS="${N8N_HEALTH_TIMEOUT:-120}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on PATH." >&2
  echo "Install Docker Desktop (or Engine), then re-run this script." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but not running. Start Docker and re-run." >&2
  exit 1
fi

echo "Starting n8n (docker compose -f docker-compose.n8n.yml up -d)..."
docker compose -f "$COMPOSE_FILE" up -d

echo "Waiting for n8n health at $HEALTH_URL (timeout ${MAX_WAIT_SECONDS}s)..."
elapsed=0
while [ "$elapsed" -lt "$MAX_WAIT_SECONDS" ]; do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    echo "n8n is healthy at $BASE_URL"
    echo "Next: complete owner setup in the browser and create an API key (see skills/bootstrap/playbooks/n8n.md)."
    exit 0
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo "Timed out waiting for n8n to become healthy." >&2
echo "Check: docker compose -f $COMPOSE_FILE logs" >&2
exit 1
