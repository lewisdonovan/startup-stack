# Getting Started

Get your agentic startup workspace set up in under 10 minutes. No CLI, no configuration files to edit by hand — just open this folder and let your AI assistant do the work.

---

## Quick Start

### 1. Install an AI harness

Pick any of these and install it:

| Harness | Link |
|---------|------|
| **Claude Code** (recommended) | https://claude.ai/code |
| **Gemini CLI** | `npm install -g @anthropic-ai/gemini-cli` |
| **OpenCode** | https://github.com/opencode-ai/opencode |
| **Dexto** | https://dexto.ai |

Claude Code gives the best experience since it natively reads `skills/` files and `CLAUDE.md` system prompts.

### 2. Clone and open

```bash
git clone https://github.com/lewisdonovan/startup-stack.git
cd startup-stack
```

Then open the folder in your harness:

```bash
claude          # Claude Code
gemini          # Gemini CLI
opencode        # OpenCode
```

### 3. Start the bootstrap

In the chat, type:

> "Run /bootstrap"

Or simply:

> "Set up my Startup Stack"

The assistant will:
1. Collect a short profile (name, email, company)
2. Show you the service catalog and ask which services you want
3. Provision accounts — browser automation for OpenRouter, Resend, Linear, and Notion; Docker for n8n; Management API for Supabase after an access token
4. Pause when email verification, CAPTCHA, or OAuth consent is needed
5. Write credentials to gitignored `.env`, generate MCP configs and skills
6. Verify everything is connected

For best results, use a harness with browser tools (e.g. Cursor + Chrome DevTools MCP) so Tier 2 services can be driven in your browser. Without a browser MCP, those services fall back to deep-link guidance.

That's it. Your workspace is ready.

---

## How It Works

```
You                     AI Harness                  Services
 │                      │                              │
 │  "Run /bootstrap"    │                              │
 ├─────────────────────►│                              │
 │                      │  Reads skills/bootstrap      │
 │                      │  Collects name/email/company │
 │  profile + services│                              │
 ├─────────────────────►│                              │
 │                      │  Browser / Docker / API      │
 │  (OTP / CAPTCHA)    │  playbooks as needed         │
 │◄─────────────────────┤─────────────────────────────►│
 │                      │  Writes .env (gitignored)    │
 │                      │  Generates .mcp.json         │
 │                      │  Generates CLAUDE.md         │
 │                      │  Runs verify-mcp.sh          │
 │  "All done!"        │                              │
 │◄─────────────────────┤                              │
```

---

## Service Selection Guide

Not sure which services to pick? Here's a cheat sheet:

### "I'm building a SaaS product"

| Service | Why |
|---------|-----|
| OpenRouter | Free AI inference |
| Linear | Bug tracking and sprint planning |
| Supabase | Database, auth, and storage |
| Resend | Welcome emails, password resets |
| Notion | Product docs and wikis |

### "I'm running an online store"

| Service | Why |
|---------|-----|
| OpenRouter | Free AI inference |
| Shopify | Your storefront |
| Xero | Accounting and invoicing |
| Notion | Store operations docs |
| Slack | Team communication |

### "I'm a solo founder (keep it simple)"

| Service | Why |
|---------|-----|
| OpenRouter | Free AI inference |
| Notion | Your entire operation (docs, tasks, CRM) |

### "I have no idea, just start"

Say "not sure" — it'll set up OpenRouter + Context7 by default. For a typical SaaS stack, ask for Linear, Supabase, and Resend as well.

---

## After Bootstrap

Once the setup is complete, you have a fully agentic workspace. Here's what you can ask the AI assistant to do:

### Project Management
- "Create a backlog project in Linear"
- "Set up a sprint for this week"
- "Triage the pending issues"

### Database
- "Create a users table with email, name, and role"
- "Add RLS policies so users can only see their own data"
- "Insert a test user into the database"

### Email
- "Send a welcome email to a new user"
- "Create a password reset email template"
- "Send a transactional receipt for order #123"

### Documentation
- "Create a product roadmap page in Notion"
- "Set up a team wiki with onboarding docs"

### Cross-Platform Workflows
- "Sync Notion feature requests to Linear issues"
- "Create Xero invoices for new Shopify orders"

---

## Adding New Services Later

You don't need to configure everything at the start. You can always add services later:

1. Get the credentials (see `docs/services.md` for signup instructions)
2. Add them to your `.env` file
3. Add the MCP server config to `.mcp.json`
4. Restart your AI harness

Or just ask the assistant: "Set up Slack" — it can walk you through adding a new service to the existing config.

---

## Troubleshooting

### "MCP server failed to connect"

Check that your `.env` file exists and has the right credentials for that service. Then run:

```bash
bash scripts/verify-mcp.sh
```

The script auto-loads `.env` from the project root when present. This will show which services are working and which are failing.

### "I don't have an API key for X"

Prefer re-running bootstrap for that service (see `skills/bootstrap/playbooks/`). Otherwise see `docs/services.md` for signup URLs. Tier 2 services may need you to complete email verification or a CAPTCHA in the browser; Tier 3 services are deep-link guided.

### "My AI harness doesn't read skills/"

Not all harnesses support the skills/ directory natively. If yours doesn't, open `skills/bootstrap/SKILL.md` and paste the contents into the chat. The assistant can still follow the instructions.

### "n8n won't start"

n8n requires Docker. Install Docker Desktop from https://docker.com, then run:

```bash
bash scripts/setup-n8n.sh
```

Open http://localhost:5678 to finish owner setup, create an API key in Settings → n8n API, and ensure `N8N_BASE_URL` / `N8N_API_KEY` are in `.env` (bootstrap does this when following the n8n playbook).

---

## Need Help?

- **Service signup questions:** See `docs/services.md` for detailed instructions
- **API reference:** Context7 is always available in the AI harness to look up current API docs
- **MCP server issues:** Run `bash scripts/verify-mcp.sh` to diagnose