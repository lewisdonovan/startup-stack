# Resend Playbook (Tier 2)

Provision a Resend account and API key. Follow [_protocol.md](_protocol.md).

**Signup:** https://resend.com/signup  
**Login:** https://resend.com/login  
**API keys:** https://resend.com/api-keys

## Goal

Write `RESEND_API_KEY` (and `RESEND_ACCOUNT_PASSWORD` if email signup) to `.env`.

## Steps

### 1. Auth

- If `existing`: open login URL.
- If `new`: open signup URL; fill name/email from profile.
- Apply **hybrid auth** (Google SSO first, else email + generated password).
- **Email verification is common** — pause and ask the user to verify, then continue.

### 2. Create API key

1. Go to API Keys (https://resend.com/api-keys).
2. Create a key named `{company_name} Startup Stack` with full access (or send-only if that is the only option needed).
3. Copy the key (often shown once).

### 3. Persist

```bash
upsert_env RESEND_API_KEY "<captured-key>"
# if email signup:
# upsert_env RESEND_ACCOUNT_PASSWORD "<generated-password>"
```

Confirm key **names** only in chat.

### 4. Notes

- Domain verification is **not** required for bootstrap. Mention they can add a domain later for production From addresses.
- Fallback: https://resend.com/api-keys → user pastes key → upsert `.env`.
