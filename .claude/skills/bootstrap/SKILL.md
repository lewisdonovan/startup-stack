---
name: Bootstrap
description: Set up a complete agentic workspace with AI inference, MCP servers, and platform skills for a new startup.
---

# Bootstrap

Run this skill to set up a complete agentic workspace with AI inference, MCP servers, and platform skills for a new startup.

Provisioning is **agent-driven**: collect a profile, open the user's browser (when available), create accounts / API keys, write gitignored `.env`, generate configs, and verify connectivity. Follow [playbooks/_protocol.md](playbooks/_protocol.md) for hybrid auth, human gates, and secret handling.

## Entry

When the user wants to bootstrap a new startup, say:

> "Let's bootstrap your Startup Stack. I'll collect a short profile, help you pick services, then provision accounts (browser + API/Docker where possible), write your `.env`, and wire up MCP + skills.
>
> I'll pause whenever email verification, CAPTCHA, or OAuth consent is needed."

Then run the flow below.

---

## Service Catalog

### Always Active

| Service | Purpose | Tier |
|---------|---------|------|
| **OpenRouter** | AI model routing (free tier, $0/token) | 2 |
| **Context7** | Library documentation lookup | Built-in |

### Optional Services

| Service | Purpose | Tier |
|---------|---------|------|
| **Linear** | Project management, issues, sprints | 2 |
| **Supabase** | PostgreSQL database, auth, storage | 1 |
| **Resend** | Transactional email, templates | 2 |
| **Notion** | Documentation, wikis, knowledge base | 2 |
| **Slack** | Team communication, channels | 3 |
| **Figma** | Design files, component library | 3 |
| **Shopify** | E-commerce, inventory, orders | 3 |
| **Xero** | Accounting, invoices, contacts | 3 |
| **n8n** | Workflow automation, pipelines | 1 |
| **Google Workspace** | Gmail, Drive, Calendar, Sheets | 3 |
| **Airtable** | Spreadsheet-database hybrid | 3 |

**Tier key:**
- **Tier 1** — Automated via API or Docker (`skills/bootstrap/playbooks/`)
- **Tier 2** — Agent browser (hybrid Google SSO → email+password; human gates for OTP/CAPTCHA)
- **Tier 3** — Human-assisted deep links + step-by-step guidance (`docs/services.md`)

Default if the user is unsure: **OpenRouter + Context7** only. Suggest Linear + Supabase + Resend for a typical SaaS stack.

---

## Flow

### Step 0: Collect Profile

Ask for:

1. `full_name`
2. `email`
3. `company_name`

Confirm a **browser MCP** is available (Chrome DevTools / Cursor browser tools). If not:

> "I don't have browser tools in this session. I'll use deep-link guidance for signup services. n8n Docker can still be automated locally."

### Step 1: Select Services + Existing Accounts

Present the catalog. After selection, for each Tier 1/2 service ask whether they **already have an account** (`existing` vs `new`). Record answers.

### Step 2: Provision Each Service

Process services one at a time (or in a clear sequence). For each:

| Service | Playbook |
|---------|----------|
| OpenRouter | [playbooks/openrouter.md](playbooks/openrouter.md) |
| Resend | [playbooks/resend.md](playbooks/resend.md) |
| Linear | [playbooks/linear.md](playbooks/linear.md) |
| Notion | [playbooks/notion.md](playbooks/notion.md) |
| Supabase | [playbooks/supabase.md](playbooks/supabase.md) |
| n8n | [playbooks/n8n.md](playbooks/n8n.md) |
| Slack, Figma, Shopify, Xero, Google Workspace, Airtable | Tier 3 — `docs/services.md` |

Always load [playbooks/_protocol.md](playbooks/_protocol.md) first.

On failure: degrade that service to Tier 3; continue with the rest.

### Step 3: Generate Config Files

Once selected services have credentials (or are deferred to manual):

#### `.env`

- If `.env` is missing: `cp .env.example .env`
- Upsert all collected secrets using the protocol's `upsert_env` pattern
- Update `.env.example` placeholders for every selected service (names only, empty values)
- Confirm written **key names** in chat — never re-print secret values

#### `.mcp.json`

Write MCP server entries for all selected services. Map packages:

- OpenRouter → `@openrouter/mcp-server` / `OPENROUTER_API_KEY`
- Linear → `@linear-app/mcp-server` / `LINEAR_API_KEY`
- Slack → `@modelcontextprotocol/slack` / `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_TEAM_ID`
- Figma → `@anthropic/figma-mcp` / `FIGMA_ACCESS_TOKEN`
- Notion → `@modelcontextprotocol/notion` / `NOTION_API_KEY`
- Supabase → `@supabase/mcp` / `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`
- Resend → `@anthropic/resend-mcp` (or `resend-mcp`) / `RESEND_API_KEY`
- Xero → `@xero-integration/mcp-server` / Xero OAuth env vars
- Shopify → `@shopify/mcp-server` / Shopify env vars
- n8n → SSE/`curl` with `N8N_BASE_URL`, `N8N_API_KEY`
- Google Workspace → `@anthropic/google-workspace-mcp`
- Airtable → `@airtable/mcp`

Prefer env placeholders like `"<OPENROUTER_API_KEY>"` or harness env substitution — **do not** embed live secrets in committed `.mcp.json` if the file will be committed. Local-only `.mcp.json` may reference env vars the harness injects.

#### `CLAUDE.md`

Rewrite with:

1. Active services list
2. MCP server list
3. Available skills for selected services
4. Existing operating principles, error handling, workflows

#### Skills directory

Ensure `skills/<service>/SKILL.md` exists for each selected service (use repo templates). Create cross-platform skills only when both sides were selected:

- Linear + Notion → `skills/cross-platform/notion-sync-to-linear/SKILL.md`
- Shopify + Xero → `skills/cross-platform/shopify-orders-to-xero/SKILL.md`
- Notion + Resend (+ n8n) → `skills/cross-platform/notion-notify-via-email/SKILL.md`

### Step 4: Verify

```bash
set -a && source .env && set +a
bash scripts/verify-mcp.sh
```

Report pass / skip / fail. For failures, point at the relevant playbook or `docs/services.md`.

---

## Config File Templates

### `.mcp.json` — Full Reference

```json
{
  "mcpServers": {
    "openrouter": {
      "command": "npx",
      "args": ["-y", "@openrouter/mcp-server"],
      "env": { "OPENROUTER_API_KEY": "<OPENROUTER_API_KEY>" }
    },
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear-app/mcp-server"],
      "env": { "LINEAR_API_KEY": "<LINEAR_API_KEY>" }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/slack"],
      "env": {
        "SLACK_BOT_TOKEN": "<SLACK_BOT_TOKEN>",
        "SLACK_SIGNING_SECRET": "<SLACK_SIGNING_SECRET>",
        "SLACK_TEAM_ID": "<SLACK_TEAM_ID>"
      }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic/figma-mcp"],
      "env": { "FIGMA_ACCESS_TOKEN": "<FIGMA_ACCESS_TOKEN>" }
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/notion"],
      "env": { "NOTION_API_KEY": "<NOTION_API_KEY>" }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<SUPABASE_ACCESS_TOKEN>",
        "SUPABASE_PROJECT_REF": "<SUPABASE_PROJECT_REF>"
      }
    },
    "resend": {
      "command": "npx",
      "args": ["-y", "@anthropic/resend-mcp"],
      "env": { "RESEND_API_KEY": "<RESEND_API_KEY>" }
    },
    "xero": {
      "command": "npx",
      "args": ["-y", "@xero-integration/mcp-server"],
      "env": {
        "XERO_CLIENT_ID": "<XERO_CLIENT_ID>",
        "XERO_CLIENT_SECRET": "<XERO_CLIENT_SECRET>",
        "XERO_REFRESH_TOKEN": "<XERO_REFRESH_TOKEN>"
      }
    },
    "shopify": {
      "command": "npx",
      "args": ["-y", "@shopify/mcp-server"],
      "env": {
        "SHOPIFY_API_KEY": "<SHOPIFY_API_KEY>",
        "SHOPIFY_ACCESS_TOKEN": "<SHOPIFY_ACCESS_TOKEN>",
        "SHOPIFY_STORE_DOMAIN": "<SHOPIFY_STORE_DOMAIN>"
      }
    },
    "n8n": {
      "command": "curl",
      "args": [],
      "env": {
        "N8N_BASE_URL": "<N8N_BASE_URL>",
        "N8N_API_KEY": "<N8N_API_KEY>"
      },
      "transport": "sse"
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic/google-workspace-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "<GOOGLE_CLIENT_ID>",
        "GOOGLE_CLIENT_SECRET": "<GOOGLE_CLIENT_SECRET>",
        "GOOGLE_REFRESH_TOKEN": "<GOOGLE_REFRESH_TOKEN>"
      }
    },
    "airtable": {
      "command": "npx",
      "args": ["-y", "@airtable/mcp"],
      "env": { "AIRTABLE_ACCESS_TOKEN": "<AIRTABLE_ACCESS_TOKEN>" }
    }
  }
}
```

### `.env.example`

See the project-root `.env.example`. After bootstrap, it should list placeholders for every selected service.

### `CLAUDE.md`

Include full agent instructions plus populated Active Services, MCP Servers, and Available Skills sections.

---

## Error Handling

- **Human gate:** Pause with a clear ask; resume after the user replies.
- **Missing browser MCP:** Tier 2 → Tier 3 for that service.
- **API / Docker failure:** Check auth, rate limits, or missing resources; retry once; then inform the user.
- **MCP package missing:** `npx -y <package>` usually suffices; otherwise guide install.
- **n8n Docker fails:** Ensure Docker is running; fall back to cloud/self-hosted steps in `docs/services.md` / `skills/n8n/SKILL.md`.

---

## Completion

Summarize:

> "Bootstrap complete!
>
> - **Services configured:** [list]
> - **MCP servers:** [list from .mcp.json]
> - **Skills:** [list]
> - **Config files:** `.mcp.json`, `.env` (gitignored), `CLAUDE.md`
>
> Treat `.env` as your password vault for any accounts created during bootstrap.
>
> Try: 'Set up my project tracking in Linear', 'Create a waitlist table in Supabase', 'Send a welcome email template'."
