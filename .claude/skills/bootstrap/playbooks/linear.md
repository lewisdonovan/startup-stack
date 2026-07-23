# Linear Playbook (Tier 2)

Provision a Linear account, workspace, and personal API key. Follow [_protocol.md](_protocol.md).

**Signup:** https://linear.app/signup  
**Login:** https://linear.app/login  
**API keys:** Workspace Settings → API → Personal API keys (path may be Settings → Account → Security & access)

## Goal

Write `LINEAR_API_KEY` (and optional `LINEAR_WEBHOOK_SECRET`, plus `LINEAR_ACCOUNT_PASSWORD` if email signup) to `.env`.

## Steps

### 1. Auth

- If `existing`: open login URL.
- If `new`: open signup URL.
- Apply **hybrid auth** (Google SSO first — Linear commonly uses Google/email).
- Pause for CAPTCHA / email verification / consent.

### 2. Workspace

- On first signup, create a workspace named `{company_name}` (or use an existing one the user chooses).
- If the user already has a workspace, skip creation.

### 3. Create personal API key

1. Open Settings → APIs / API → Personal API keys (use snapshot to find the current label).
2. Create a key labeled `{company_name} Startup Stack`.
3. Copy the key immediately.

### 4. Persist

```bash
upsert_env LINEAR_API_KEY "<captured-key>"
# optional webhook secret if UI offers one during setup:
# upsert_env LINEAR_WEBHOOK_SECRET "<secret>"
# if email signup:
# upsert_env LINEAR_ACCOUNT_PASSWORD "<generated-password>"
```

Confirm key names only in chat.

### 5. Fallback (Tier 3)

Guide the user: https://linear.app/signup → Settings → API → New personal API key → paste into chat → upsert `.env`.
