---
name: Bootstrap
description: Set up a complete agentic workspace with AI inference, MCP servers, and platform skills for a new startup.
---

# Bootstrap

Run this skill to set up a complete agentic workspace with AI inference, MCP servers, and platform skills for a new startup.

## Entry

When the user wants to bootstrap a new startup, say:

> "Let's bootstrap your startup toolkit. I'll walk you through setting up your services, generate all the config files, and get your agentic workspace ready.
>
> Here are the services you can choose from:"

Then present the service catalog (below) and ask the user to select which services they want.

---

## Service Catalog

### Always Active

| Service | Purpose | Tier |
|---------|---------|------|
| **OpenRouter** | AI model routing (free tier, $0/token) | 1 |
| **Context7** | Library documentation lookup | Built-in |

### Optional Services

| Service | Purpose | Tier |
|---------|---------|------|
| **Linear** | Project management, issues, sprints | 3 |
| **Supabase** | PostgreSQL database, auth, storage | 1 |
| **Resend** | Transactional email, templates | 1 |
| **Notion** | Documentation, wikis, knowledge base | 3 |
| **Slack** | Team communication, channels | 3 |
| **Figma** | Design files, component library | 3 |
| **Shopify** | E-commerce, inventory, orders | 3 |
| **Xero** | Accounting, invoices, contacts | 3 |
| **n8n** | Workflow automation, pipelines | 1 |
| **Google Workspace** | Gmail, Drive, Calendar, Sheets | 3 |
| **Airtable** | Spreadsheet-database hybrid | 3 |

**Tier key:**
- **Tier 1** — Fully automated via API or Docker
- **Tier 3** — Human-assisted (you'll provide deep links and step-by-step guidance)

Ask the user which services they want. Default to only OpenRouter + Context7 if they say "not sure" or "set up the basics."

---

## Flow

For each selected service, follow the provisioning guide in `docs/services.md`. Collect any required credentials from the user. Then proceed to config generation.

### Step 1: Collect Credentials

As the user provides credentials, record them in a dictionary. For Tier 3 services the user may need to sign up first — guide them through the signup process, then collect the credentials.

For each service, tell the user exactly what to do:

**Tier 1 (API):**
> "Go to [signup URL], [specific instructions], then paste back your [credential type]."

**Tier 3 (Human-assisted):**
> "Go to [signup URL], create an account, then [specific instructions to get API key/token]. Paste it back here when ready."

### Step 2: Generate Config Files

Once all selected services have credentials (or are queued for manual setup), generate these files:

#### `.mcp.json`

Write this file with the configured MCP servers for all selected services:

```json
{
  "mcpServers": {
    "openrouter": {
      "command": "npx",
      "args": ["-y", "@openrouter/mcp-server"],
      "env": {
        "OPENROUTER_API_KEY": "<OPENROUTER_API_KEY>"
      }
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
      "env": {
        "RESEND_API_KEY": "<RESEND_API_KEY>"
      }
    }
  }
}
```

Map each selected service to its MCP server. Use `@linear-app/mcp-server` for Linear, `@modelcontextprotocol/slack` for Slack, `@modelcontextprotocol/notion` for Notion, `@anthropic/figma-mcp` for Figma, `@xero-integration/mcp-server` for Xero, `@shopify/mcp-server` for Shopify, `@n8n-mcp` for n8n, `@anthropic/google-workspace-mcp` for Google Workspace, `@airtable/mcp` for Airtable. For n8n, use `command: "<n8n_base_url>"` with transport `sse`.

#### `.env`

Instruct the user to copy `.env.example` to `.env` and fill in their credentials. Do NOT write `.env` yourself — never commit secrets.

> "Copy `.env.example` to `.env` in this directory and fill in your credentials. This file is gitignored and should never be committed."

#### `.env.example`

Ensure `.env.example` exists in the project root. It should list all env var placeholders for every service the user selected (and always include the full list for reference).

### Step 3: Generate CLAUDE.md

Rewrite the `CLAUDE.md` file with the user's selected services populated. Replace the placeholder comments with actual service listings:

1. Add the active services list with names and brief descriptions
2. List each MCP server with its config name
3. List available skills based on selected services
4. Keep all the existing operating principles, error handling, and workflow sections

Example of the active services section:

```markdown
### Active Services
- OpenRouter — AI inference via `openrouter/free` endpoint
- Context7 — Library documentation lookup
- Linear — Project management and issue tracking
- Supabase — PostgreSQL database with authentication
- Resend — Transactional email
```

Example of MCP servers section:

```markdown
### MCP Servers
- Linear (`@linear-app/mcp-server`)
- Supabase (`@supabase/mcp`)
- Resend (`@anthropic/resend-mcp`)
```

Example of available skills section:

```markdown
### Available Skills
- [Set up project tracking](skills/linear/SKILL.md)
- [Create a database table](skills/supabase/SKILL.md)
- [Send a transactional email](skills/resend/SKILL.md)
```

### Step 4: Create Skills Directory

Create the skills directory structure for all selected services. For each selected service, create a `skills/<service>/SKILL.md` file with:

1. A one-line description
2. Required platforms tag
3. Step-by-step setup instructions
4. Example prompts to trigger workflows

Use the existing skill files as templates (see skill directories in this repo). For services without a pre-written skill, create a minimal one with the structure above.

Also create cross-platform skills for any service pairs that have synergies:
- Linear + Notion → `skills/cross-platform/notion-sync-to-linear/SKILL.md`
- Shopify + Xero → `skills/cross-platform/shopify-orders-to-xero/SKILL.md`

Only create cross-platform skills if both required services were selected.

### Step 5: Run Verification

Run `bash scripts/verify-mcp.sh` to check connectivity for all configured services. Report the results.

---

## Config File Templates

### .mcp.json — Full Reference

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
      "env": { "SLACK_BOT_TOKEN": "<SLACK_BOT_TOKEN>", "SLACK_SIGNING_SECRET": "<SLACK_SIGNING_SECRET>", "SLACK_TEAM_ID": "<SLACK_TEAM_ID>" }
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
      "env": { "SUPABASE_ACCESS_TOKEN": "<SUPABASE_ACCESS_TOKEN>", "SUPABASE_PROJECT_REF": "<SUPABASE_PROJECT_REF>" }
    },
    "resend": {
      "command": "npx",
      "args": ["-y", "@anthropic/resend-mcp"],
      "env": { "RESEND_API_KEY": "<RESEND_API_KEY>" }
    },
    "xero": {
      "command": "npx",
      "args": ["-y", "@xero-integration/mcp-server"],
      "env": { "XERO_CLIENT_ID": "<XERO_CLIENT_ID>", "XERO_CLIENT_SECRET": "<XERO_CLIENT_SECRET>", "XERO_REFRESH_TOKEN": "<XERO_REFRESH_TOKEN>" }
    },
    "shopify": {
      "command": "npx",
      "args": ["-y", "@shopify/mcp-server"],
      "env": { "SHOPIFY_API_KEY": "<SHOPIFY_API_KEY>", "SHOPIFY_ACCESS_TOKEN": "<SHOPIFY_ACCESS_TOKEN>", "SHOPIFY_STORE_DOMAIN": "<SHOPIFY_STORE_DOMAIN>" }
    },
    "n8n": {
      "command": "curl",
      "args": [],
      "env": { "N8N_BASE_URL": "<N8N_BASE_URL>", "N8N_API_KEY": "<N8N_API_KEY>" },
      "transport": "sse"
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic/google-workspace-mcp"],
      "env": { "GOOGLE_CLIENT_ID": "<GOOGLE_CLIENT_ID>", "GOOGLE_CLIENT_SECRET": "<GOOGLE_CLIENT_SECRET>", "GOOGLE_REFRESH_TOKEN": "<GOOGLE_REFRESH_TOKEN>" }
    },
    "airtable": {
      "command": "npx",
      "args": ["-y", "@airtable/mcp"],
      "env": { "AIRTABLE_ACCESS_TOKEN": "<AIRTABLE_ACCESS_TOKEN>" }
    }
  }
}
```

### .env.example — Template

See the `.env.example` file in the project root. It contains placeholders for all 12 services.

### CLAUDE.md — Template

The generated CLAUDE.md should include:
- The full agent instructions (from this repo's CLAUDE.md)
- Active services list (populated from user selection)
- MCP server list (populated from user selection)
- Available skills list (populated from user selection)
- All existing operating principles, error handling, and workflow sections

---

## Error Handling

- **Missing credentials:** Tell the user exactly which key is needed and where to find it. Reference `docs/services.md` for detailed signup instructions.
- **API call fails:** Check if the error is authentication-related (guide to refresh token), rate-limiting (implement backoff), or a missing resource (create it or inform the user).
- **MCP server not found:** The user may need to install the server package first. Run `npm install -g <package-name>` and retry.
- **n8n Docker setup fails:** Guide the user through manual Docker Compose setup with the n8n image.

---

## Completion

After all steps are done, summarize:

> "Bootstrap complete! Here's what was set up:
>
> - **Services configured:** [list]
> - **MCP servers:** [list from .mcp.json]
> - **Skills created:** [list]
> - **Config files:** `.mcp.json`, `.env` (you need to fill in), `CLAUDE.md`
>
> Your agentic workspace is ready. Open this directory in Claude Code (or your preferred harness) and start chatting.
>
> Try saying things like:
> - 'Set up my project tracking in Linear'
> - 'Create a waitlist table in Supabase'
> - 'Send a welcome email template'
> - 'Sync my Notion notes to Linear issues'"