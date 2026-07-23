#!/usr/bin/env bash
# verify-mcp.sh — Check connectivity for configured MCP servers.
# Run this after bootstrapping to verify all services are reachable.
# If a project-root .env exists, it is sourced automatically.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

PASS=0
FAIL=0
SKIP=0

pass() { echo -e "\033[32m✓\033[0m  $1"; PASS=$((PASS + 1)); }
fail() { echo -e "\033[31m✗\033[0m  $1"; FAIL=$((FAIL + 1)); }
skip() { echo -e "\033[33m⊘\033[0m  $1 (not configured)"; SKIP=$((SKIP + 1)); }

echo "========================================"
echo "  MCP Server Connectivity Check"
echo "========================================"
echo ""

# ── OpenRouter ──────────────────────────────────────────────
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  if curl -sf -X POST "https://openrouter.ai/api/v1/chat/completions" \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"openrouter/free","messages":[{"role":"user","content":"ping"}]}' >/dev/null 2>&1; then
    pass "OpenRouter is reachable"
  else
    fail "OpenRouter failed — check your API key"
  fi
else
  skip "OpenRouter (no OPENROUTER_API_KEY set)"
fi

# ── Resend ──────────────────────────────────────────────────
if [ -n "${RESEND_API_KEY:-}" ]; then
  if curl -sf -H "Authorization: Bearer $RESEND_API_KEY" \
    "https://api.resend.com/domains" >/dev/null 2>&1; then
    pass "Resend is reachable"
  else
    fail "Resend failed — check your API key"
  fi
else
  skip "Resend (no RESEND_API_KEY set)"
fi

# ── Linear ──────────────────────────────────────────────────
if [ -n "${LINEAR_API_KEY:-}" ]; then
  if curl -sf -X POST "https://api.linear.app/graphql" \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query":"{ organization { id name } }"}' >/dev/null 2>&1; then
    pass "Linear is reachable"
  else
    fail "Linear failed — check your API key"
  fi
else
  skip "Linear (no LINEAR_API_KEY set)"
fi

# ── Supabase ────────────────────────────────────────────────
if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] && [ -n "${SUPABASE_PROJECT_REF:-}" ]; then
  if curl -sf -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
    "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF" >/dev/null 2>&1; then
    pass "Supabase is reachable"
  else
    fail "Supabase failed — check your credentials"
  fi
else
  skip "Supabase (no SUPABASE_ACCESS_TOKEN set)"
fi

# ── Notion ──────────────────────────────────────────────────
if [ -n "${NOTION_API_KEY:-}" ]; then
  if curl -sf -H "Authorization: Bearer $NOTION_API_KEY" \
    -H "Content-Type: application/json" \
    -H "Notion-Version: 2022-06-28" \
    "https://api.notion.com/v1/users/me" >/dev/null 2>&1; then
    pass "Notion is reachable"
  else
    fail "Notion failed — check your API key"
  fi
else
  skip "Notion (no NOTION_API_KEY set)"
fi

# ── Slack ───────────────────────────────────────────────────
if [ -n "${SLACK_BOT_TOKEN:-}" ]; then
  if curl -sf -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    "https://slack.com/api/auth.test" >/dev/null 2>&1; then
    pass "Slack is reachable"
  else
    fail "Slack failed — check your bot token"
  fi
else
  skip "Slack (no SLACK_BOT_TOKEN set)"
fi

# ── Figma ───────────────────────────────────────────────────
if [ -n "${FIGMA_ACCESS_TOKEN:-}" ]; then
  if curl -sf -H "Authorization: Bearer $FIGMA_ACCESS_TOKEN" \
    "https://api.figma.com/v1/files/self" >/dev/null 2>&1; then
    pass "Figma is reachable"
  else
    fail "Figma failed — check your access token"
  fi
else
  skip "Figma (no FIGMA_ACCESS_TOKEN set)"
fi

# ── Xero ────────────────────────────────────────────────────
if [ -n "${XERO_CLIENT_ID:-}" ]; then
  pass "Xero credentials present (requires OAuth flow — manual check)"
else
  skip "Xero (no XERO_CLIENT_ID set)"
fi

# ── Shopify ─────────────────────────────────────────────────
if [ -n "${SHOPIFY_ACCESS_TOKEN:-}" ] && [ -n "${SHOPIFY_STORE_DOMAIN:-}" ]; then
  if curl -sf "https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-01/products.json?access_token=$SHOPIFY_ACCESS_TOKEN" >/dev/null 2>&1; then
    pass "Shopify is reachable"
  else
    fail "Shopify failed — check your credentials"
  fi
else
  skip "Shopify (no SHOPIFY_ACCESS_TOKEN set)"
fi

# ── n8n ─────────────────────────────────────────────────────
if [ -n "${N8N_BASE_URL:-}" ] && [ -n "${N8N_API_KEY:-}" ]; then
  if curl -sf -H "X-N8n-API-Key: $N8N_API_KEY" \
    "$N8N_BASE_URL/api/v1/credentials" >/dev/null 2>&1; then
    pass "n8n is reachable"
  else
    fail "n8n failed — check your credentials"
  fi
else
  skip "n8n (no N8N_BASE_URL set)"
fi

# ── Google Workspace ────────────────────────────────────────
if [ -n "${GOOGLE_CLIENT_ID:-}" ]; then
  pass "Google Workspace credentials present (requires OAuth flow — manual check)"
else
  skip "Google Workspace (no GOOGLE_CLIENT_ID set)"
fi

# ── Airtable ────────────────────────────────────────────────
if [ -n "${AIRTABLE_ACCESS_TOKEN:-}" ]; then
  if curl -sf -H "Authorization: Bearer $AIRTABLE_ACCESS_TOKEN" \
    "https://api.airtable.com/v0/meta/usage" >/dev/null 2>&1; then
    pass "Airtable is reachable"
  else
    fail "Airtable failed — check your access token"
  fi
else
  skip "Airtable (no AIRTABLE_ACCESS_TOKEN set)"
fi

echo ""
echo "========================================"
echo -e "  Results: \033[32m$PASS passed\033[0m  \033[33m$SKIP skipped\033[0m  \033[31m$FAIL failed\033[0m"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi