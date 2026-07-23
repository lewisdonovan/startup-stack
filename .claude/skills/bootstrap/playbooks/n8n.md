# n8n Playbook (Tier 1 — Docker + browser owner setup)

Provision local n8n via Docker, create the owner account, and capture an API key. Follow [_protocol.md](_protocol.md).

**UI:** http://localhost:5678  
**Compose:** `docker-compose.n8n.yml`  
**Helper:** `bash scripts/setup-n8n.sh`

## Goal

Write `N8N_BASE_URL=http://localhost:5678` and `N8N_API_KEY` (plus `N8N_ACCOUNT_PASSWORD` for the owner) to `.env`.

## Steps

### 1. Start Docker

```bash
bash scripts/setup-n8n.sh
```

If Docker is missing or not running, stop and tell the user how to install/start it. Do not invent a cloud account unless they ask for n8n Cloud instead (then use Tier 3 / `skills/n8n/SKILL.md`).

### 2. Owner account (browser)

1. Open http://localhost:5678
2. On first-run setup, create the owner with:
   - Email: profile `email`
   - Name: profile `full_name`
   - Password: generated via `openssl rand -base64 24` → store as `N8N_ACCOUNT_PASSWORD`
3. Complete any onboarding screens (skip optional product tours when possible).

If an owner already exists (`existing` local instance), log in with credentials the user provides (or from `.env` if previously written).

### 3. Create API key

1. Open Settings → n8n API (or Settings → API).
2. Create an API key labeled `{company_name} Startup Stack`.
3. Copy the key.

### 4. Persist

```bash
upsert_env N8N_BASE_URL "http://localhost:5678"
upsert_env N8N_API_KEY "<captured-key>"
upsert_env N8N_ACCOUNT_PASSWORD "<owner-password>"
```

Confirm key names only in chat.

### 5. MCP note

Wire the n8n MCP entry in `.mcp.json` with `N8N_BASE_URL` and `N8N_API_KEY` (SSE/`curl` transport as in the bootstrap template). Restart the harness MCP session if needed after `.env` is loaded.

### 6. Fallback

- Cloud: https://n8n.io → Settings → API → paste key + base URL.
- Self-hosted elsewhere: same env vars pointing at that instance.
