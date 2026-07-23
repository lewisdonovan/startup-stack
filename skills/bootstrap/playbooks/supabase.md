# Supabase Playbook (Tier 1 — browser token + Management API)

Create (or reuse) a Supabase account, obtain a personal access token, then create a project and fetch API keys via the Management API. Follow [_protocol.md](_protocol.md).

**Signup:** https://supabase.com/dashboard/sign_up  
**Login:** https://supabase.com/dashboard/sign-in  
**Access tokens:** https://supabase.com/dashboard/account/tokens  
**Management API base:** `https://api.supabase.com`

## Goal

Write to `.env`:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (legacy `anon` or publishable key)
- `SUPABASE_SERVICE_ROLE_KEY` (legacy `service_role` or secret key)
- `SUPABASE_DB_PASSWORD` (generated project DB password)
- `SUPABASE_ACCOUNT_PASSWORD` (only if email signup)

## Part A — Browser: account + access token

### 1. Auth

- If `existing`: sign in.
- If `new`: sign up with hybrid auth (Google SSO first).
- Pause for email verification / CAPTCHA / consent.

### 2. Personal access token

1. Open https://supabase.com/dashboard/account/tokens
2. **Generate new token** named `{company_name} Startup Stack`
3. Copy the token (shown once)
4. Persist immediately:

```bash
upsert_env SUPABASE_ACCESS_TOKEN "<token>"
```

If the user already has a token, ask them to paste it (or reuse from `.env`) and skip creation.

## Part B — Management API: project + keys

Load the token into the shell (do not echo it):

```bash
set -a && source .env && set +a
```

### 1. Resolve organization

```bash
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  https://api.supabase.com/v1/organizations
```

Pick the org that matches the user (or the only org). Use its `id` as `ORG_ID`. If none exists, create one via the dashboard or `POST /v1/organizations` if available, then re-list.

### 2. Create project (skip if user wants an existing project)

Generate DB password: `openssl rand -base64 24` → `SUPABASE_DB_PASSWORD`.

```bash
curl -sS -X POST https://api.supabase.com/v1/projects \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"$ORG_ID\",
    \"name\": \"${COMPANY_NAME:-startup-stack}\",
    \"region\": \"us-east-1\",
    \"password\": \"$SUPABASE_DB_PASSWORD\"
  }"
```

Ask the user for preferred region if they care; default `us-east-1`. Capture `id` / `ref` from the response as `SUPABASE_PROJECT_REF`.

```bash
upsert_env SUPABASE_PROJECT_REF "<ref>"
upsert_env SUPABASE_DB_PASSWORD "<db-password>"
upsert_env SUPABASE_URL "https://<ref>.supabase.co"
```

If using an **existing** project: set `SUPABASE_PROJECT_REF` from the dashboard or `GET /v1/projects`, and still fetch keys below. DB password may be unknown — do not invent it; leave `SUPABASE_DB_PASSWORD` empty unless the user provides it.

### 3. Poll until healthy

```bash
# Repeat until status is ACTIVE_HEALTHY (or equivalent active state), ~30–120s
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF"
```

### 4. Fetch API keys

```bash
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/api-keys?reveal=true"
```

Map response entries:

| Response | Env var |
|----------|---------|
| `anon` or publishable / `sb_publishable_…` | `SUPABASE_ANON_KEY` |
| `service_role` or secret / `sb_secret_…` | `SUPABASE_SERVICE_ROLE_KEY` |

If only new-style keys exist, store those in the same env vars (MCP and skills expect these names).

```bash
upsert_env SUPABASE_ANON_KEY "<anon-or-publishable>"
upsert_env SUPABASE_SERVICE_ROLE_KEY "<service-role-or-secret>"
```

Confirm **names only** in chat.

## Part C — Fallback (Tier 3)

If Management API fails:

1. Dashboard → New project
2. Settings → API for URL / anon / service_role
3. Account → Access tokens for `SUPABASE_ACCESS_TOKEN`
4. User pastes values → upsert `.env`
