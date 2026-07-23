# Service Catalog

Complete reference for all 12 supported services. Used by the bootstrap skill to present the catalog to the user.

Automated provisioning playbooks live in [`skills/bootstrap/playbooks/`](../skills/bootstrap/playbooks/). Shared rules (hybrid auth, human gates, `.env` writing): [`_protocol.md`](../skills/bootstrap/playbooks/_protocol.md).

---

## Always Active

### OpenRouter

- **Purpose:** AI model routing with free tier available
- **Provisioning:** Tier 2 — Agent browser ([playbooks/openrouter.md](../skills/bootstrap/playbooks/openrouter.md))
- **Signup:** https://openrouter.ai/signup
- **API Key:** Create at https://openrouter.ai/settings/keys
- **Env vars:** `OPENROUTER_API_KEY` (optional `OPENROUTER_ACCOUNT_PASSWORD`)
- **MCP server:** `@openrouter/mcp-server` or HTTP SSE transport to `https://openrouter.ai/api/v1`
- **Notes:** Use the `openrouter/free` endpoint for zero-cost inference with 200K token context. Human gates: CAPTCHA, email verification.

### Context7

- **Purpose:** Library documentation lookup
- **Provisioning:** Built-in (no signup needed — included with MCP servers)
- **Notes:** Always available as a tool. No credentials required.

---

## Optional Services

### Linear

- **Purpose:** Project management, issues, sprints, roadmaps
- **Provisioning:** Tier 2 — Agent browser ([playbooks/linear.md](../skills/bootstrap/playbooks/linear.md))
- **Signup:** https://linear.app/signup
- **API Key:** Settings → APIs → New API Key (Personal API key)
- **Env vars:** `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET` (optional `LINEAR_ACCOUNT_PASSWORD`)
- **MCP server:** `@linear-app/mcp-server`
- **Notes:** Most startups start with Linear for issue tracking. GraphQL API. Human gates: CAPTCHA, email verification, OAuth consent.

### Slack

- **Purpose:** Team communication, channel management
- **Provisioning:** Tier 3 — Human-assisted (workspace creation + app setup)
- **Signup:** https://slack.com/signup (workspace), https://api.slack.com/apps (app)
- **Bot Token:** Create app at https://api.slack.com/apps, enable bot scopes, install to workspace
- **Env vars:** `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_TEAM_ID`
- **MCP server:** `@modelcontextprotocol/slack`
- **Notes:** Requires creating a Slack app with bot scopes (channels:read, chat:write, etc.)

### Figma

- **Purpose:** Design file access, component library management
- **Provisioning:** Tier 3 — Human-assisted
- **Signup:** https://www.figma.com/signup
- **Access Token:** Settings → Account → Access tokens → Generate new token
- **Env vars:** `FIGMA_ACCESS_TOKEN`
- **MCP server:** `@anthropic/figma-mcp` or official Figma MCP
- **Notes:** Read-only access via API. Useful for design reviews and component audits.

### Notion

- **Purpose:** Documentation, wikis, knowledge base
- **Provisioning:** Tier 2 — Agent browser ([playbooks/notion.md](../skills/bootstrap/playbooks/notion.md))
- **Signup:** https://www.notion.so/signup
- **API Key:** Settings → My integrations → New integration, generate secret
- **Env vars:** `NOTION_API_KEY`, `NOTION_INTEGRATION_TYPE` (optional `NOTION_ACCOUNT_PASSWORD`)
- **MCP server:** `@modelcontextprotocol/notion`
- **Notes:** Each page/database must be shared with the integration explicitly (human gate after bootstrap).

### Supabase

- **Purpose:** PostgreSQL database, authentication, storage
- **Provisioning:** Tier 1 — Browser access token + Management API ([playbooks/supabase.md](../skills/bootstrap/playbooks/supabase.md))
- **Signup:** https://supabase.com/dashboard/sign_up
- **Access Token:** https://supabase.com/dashboard/account/tokens
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`
- **MCP server:** `@supabase/mcp`
- **Notes:** After a personal access token exists, bootstrap creates the project and fetches keys via the Management API.

### Resend

- **Purpose:** Transactional email, email templates
- **Provisioning:** Tier 2 — Agent browser ([playbooks/resend.md](../skills/bootstrap/playbooks/resend.md))
- **Signup:** https://resend.com/signup
- **API Key:** Keys → Create API key
- **Env vars:** `RESEND_API_KEY` (optional `RESEND_ACCOUNT_PASSWORD`)
- **MCP server:** `@anthropic/resend-mcp`
- **Notes:** Simple API. Good for welcome emails, notifications, password resets. Email verification is a common human gate.

### Xero

- **Purpose:** Accounting, invoices, contacts, bank feeds
- **Provisioning:** Tier 3 — Human-assisted (OAuth flow)
- **Signup:** https://developer.xero.com/applications
- **Credentials:** Create Xero application at https://developer.xero.com/applications
- **Env vars:** `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REFRESH_TOKEN`, `XERO_ORGANIZATION_ID`
- **MCP server:** `@xero-integration/mcp-server`
- **Notes:** Requires full OAuth 2.0 flow. Startups use for invoicing and bookkeeping.

### Shopify

- **Purpose:** E-commerce, inventory, order management
- **Provisioning:** Tier 3 — Human-assisted (Partner dashboard)
- **Signup:** https://partners.shopify.com/signup
- **Access Token:** Create custom app in partner dashboard → Admin API access tokens
- **Env vars:** `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_STORE_DOMAIN`
- **MCP server:** `@shopify/mcp-server`
- **Notes:** Admin REST/GraphQL API. Used for inventory sync and order processing.

### n8n

- **Purpose:** Workflow automation, event-driven pipelines
- **Provisioning:** Tier 1 — Docker Compose (local) ([playbooks/n8n.md](../skills/bootstrap/playbooks/n8n.md))
- **Signup:** Self-hosted via `docker-compose.n8n.yml` / `bash scripts/setup-n8n.sh`
- **API Key:** Settings → n8n API → Create key
- **Env vars:** `N8N_BASE_URL`, `N8N_API_KEY` (optional `N8N_ACCOUNT_PASSWORD`)
- **MCP server:** `@n8n-mcp` (community) or SSE transport
- **Notes:** Owner account is created in the browser on first run at http://localhost:5678. Cloud/self-hosted elsewhere remains a manual fallback.

### Google Workspace

- **Purpose:** Gmail, Drive, Calendar, Sheets
- **Provisioning:** Tier 3 — Human-assisted (Google Cloud console)
- **Signup:** https://console.cloud.google.com
- **Credentials:** Create OAuth 2.0 credentials or service account key
- **Env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_KEY`
- **MCP server:** `@anthropic/google-workspace-mcp`
- **Notes:** Requires enabling APIs in Google Cloud Console (Gmail, Drive, Calendar, Sheets).

### Airtable

- **Purpose:** Spreadsheet-database hybrid, project tracking
- **Provisioning:** Tier 3 — Human-assisted (browser / API)
- **Signup:** https://airtable.com/signup
- **Access Token:** Account settings → Personal access tokens → Create new token
- **Env vars:** `AIRTABLE_ACCESS_TOKEN`, `AIRTABLE_ORGANIZATION_ID`
- **MCP server:** `@airtable/mcp`
- **Notes:** Free tier limited. Enterprise API access for automation. Not in the Tier 2 pilot yet.

---

## Provisioning Tiers

| Tier | Method | Services |
|------|--------|----------|
| 1 | Automated via API or Docker | Supabase (token + Management API), n8n (Docker) |
| 2 | Agent browser (user-supervised; hybrid Google SSO → email+password; pauses for OTP/CAPTCHA) | OpenRouter, Resend, Linear, Notion |
| 3 | Human-assisted (deep links + guidance) | Slack, Figma, Xero, Shopify, Google Workspace, Airtable |

Playbooks: `skills/bootstrap/playbooks/<service>.md`. On automation failure, degrade to Tier 3 for that service.
