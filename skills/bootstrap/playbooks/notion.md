# Notion Playbook (Tier 2)

Provision a Notion account and internal integration secret. Follow [_protocol.md](_protocol.md).

**Signup:** https://www.notion.so/signup  
**Integrations:** https://www.notion.so/my-integrations  
(Alternate: https://www.notion.so/profile/integrations)

## Goal

Write `NOTION_API_KEY` and `NOTION_INTEGRATION_TYPE=Internal` (and `NOTION_ACCOUNT_PASSWORD` if email signup) to `.env`.

## Steps

### 1. Auth

- If `existing`: open Notion and ensure the correct workspace is active.
- If `new`: open signup URL.
- Apply **hybrid auth** (Google SSO first).
- Pause for email verification / CAPTCHA / consent.

### 2. Create internal integration

1. Open https://www.notion.so/my-integrations (or My integrations from Settings).
2. **New integration**.
3. Name: `{company_name} Startup Stack`.
4. Associate with the user's workspace.
5. Capabilities: at minimum read content; enable update/insert if the agent should write pages.
6. Submit and **copy the Internal Integration Secret**.

### 3. Persist

```bash
upsert_env NOTION_API_KEY "<integration-secret>"
upsert_env NOTION_INTEGRATION_TYPE "Internal"
# if email signup:
# upsert_env NOTION_ACCOUNT_PASSWORD "<generated-password>"
```

Confirm key names only in chat.

### 4. Human gate — page access

Tell the user (do not skip):

> "Notion integrations cannot see pages until you share them. For each page or database the agent should use: open the page → ⋯ → Connect to → `{company_name} Startup Stack`."

You do not need to share pages during bootstrap unless the user wants an immediate smoke test.

### 5. Fallback (Tier 3)

User creates an integration at https://www.notion.so/my-integrations, pastes the secret, then upsert `.env`.
