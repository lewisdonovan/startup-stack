# OpenRouter Playbook (Tier 2)

Provision an OpenRouter account and API key. Follow [_protocol.md](_protocol.md).

**Signup:** https://openrouter.ai/signup  
**Login:** https://openrouter.ai/sign-in  
**API keys:** https://openrouter.ai/settings/keys

## Goal

Write `OPENROUTER_API_KEY` (and `OPENROUTER_ACCOUNT_PASSWORD` if email signup) to `.env`.

## Steps

### 1. Auth

- If `existing`: open login URL.
- If `new`: open signup URL.
- Apply **hybrid auth** (Google SSO first, else email + generated password).
- Pause for CAPTCHA / email verification / consent.

### 2. Create API key

1. Navigate to https://openrouter.ai/settings/keys (or Settings → Keys).
2. Create a new key named `{company_name} Startup Stack` (or similar).
3. Copy the key value immediately (it may only show once).

### 3. Persist

```bash
upsert_env OPENROUTER_API_KEY "<captured-key>"
# if email signup:
# upsert_env OPENROUTER_ACCOUNT_PASSWORD "<generated-password>"
```

Confirm in chat: wrote `OPENROUTER_API_KEY` (and password key if used). Do not re-print the secret.

### 4. Fallback (Tier 3)

If blocked: ask the user to visit https://openrouter.ai/settings/keys, create a key, and paste it. Then upsert `.env`.
