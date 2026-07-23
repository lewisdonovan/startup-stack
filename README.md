# Startup Stack

A one-click toolkit bootstrapper for startups. Select your services, get a fully configured project folder with MCP servers, AI inference, and agentic skills wired up and ready to go.

## What It Does

1. **Provisions accounts** across your selected SaaS tools (OpenRouter, Linear, Slack, Figma, Notion, Supabase, etc.)
2. **Generates a project directory** with MCP server configs, an OpenRouter free-tier endpoint, and a customised system prompt
3. **Pulls relevant skills** from a managed skills repository — only those tagged with the platforms you selected
4. **Hands you an agentic workspace** that you can drive from your AI harness CLI (Claude Code, Gemini CLI, etc.)

## Architecture

```
User selects services
        │
        ▼
┌─────────────────────────────┐
│   Bootstrapper CLI / Web     │
│  1. Create project folder    │
│  2. Set up OpenRouter        │
│  3. Provision accounts        │
│     (API → browser →         │
│      human-in-loop)          │
│  4. Generate MCP configs     │
│  5. Pull tagged skills       │
│  6. Write CLAUDE.md           │
└───────────┬─────────────────┘
            │
            ▼
┌─────────────────────────────┐
│    Generated Project        │
│                             │
│  .mcp.json                  │ ← MCP server configs
│  .env                       │ ← API keys & secrets
│  .env.example               │ ← Template for user
│  CLAUDE.md                  │ ← System prompt for agent
│  skills/                    │ ← Platform-tagged skills
│    supabase/                │
│    linear/                  │
│    cross-platform/          │
│  scripts/                   │
│    verify-mcp.sh            │ ← Connectivity checks
│    setup-n8n.sh             │ ← Local n8n via Docker
│  docker-compose.n8n.yml     │ ← n8n Compose file
└─────────────────────────────┘
```

## Account Provisioning Strategy

Each service follows a tiered fallback (implemented in `skills/bootstrap/`):

| Tier | Method | Example Services |
|------|--------|-----------------|
| 1 | **API / Docker** — automated | n8n (`scripts/setup-n8n.sh`), Supabase (Management API after access token) |
| 2 | **Agent browser** — user-supervised in your browser (Google SSO → email+password) | OpenRouter, Resend, Linear, Notion |
| 3 | **Human-assisted** — deep-link URLs + step-by-step guidance | Slack, Figma, Xero, Shopify, Google Workspace, Airtable |

When the agent encounters an OTP, email verification, CAPTCHA, or OAuth consent step, it **pauses** and asks you to complete that step in the browser (or paste a code). Credentials are written to gitignored `.env` — treat that file as the vault for bootstrap-created account passwords.

## Supported Services

### Mandatory

- **OpenRouter** — AI model routing, free tier available (`openrouter/free` endpoint, $0/token)
- **Context7** — Up-to-date documentation for libraries and frameworks

### Optional

| Service | Provisioning Method | MCP Server |
|---------|--------------------|------------|
| Linear | Tier 2 browser / Tier 3 manual | Vendor-maintained |
| Slack | Tier 3 (workspace + app) | Available |
| Figma | Tier 3 manual | Official |
| Notion | Tier 2 browser / Tier 3 manual | Vendor-maintained |
| Airtable | Tier 3 manual | Available |
| n8n | Tier 1 Docker Compose (local) | Available |
| Google Workspace | Tier 3 (Google Cloud / OAuth) | Available |
| Resend | Tier 2 browser / Tier 3 manual | Available |
| Xero | Tier 3 OAuth | Available |
| Supabase | Tier 1 Management API (after token) | Vendor-maintained |
| OpenRouter | Tier 2 browser / Tier 3 manual | Available |
| Shopify | Tier 3 Partner dashboard | Available |

## Skills System

Skills are stored in a central repository, each tagged with one or more platforms:

```
skills/
  linear/
    create-sprint-from-roadmap.md      tags: [linear]
    triage-incoming-issues.md           tags: [linear]
  supabase/
    provision-new-table.md             tags: [supabase]
    create-auth-provider.md             tags: [supabase]
  cross-platform/
    shopify-orders-to-xero.md           tags: [shopify, xero]
    notion-sync-to-linear.md            tags: [notion, linear]
    supabase-backup-to-drive.md         tags: [supabase, google-workspace]
```

A skill is only pulled into the project if **all** its tagged platforms have been selected by the user.

## Quick Start — Onboarding Web App (local Docker)

```bash
# 1. Copy platform env
cp apps/web/.env.example apps/web/.env
# Edit AUTH_SECRET and ENCRYPTION_KEY

# 2. Start Postgres + Mailpit
docker compose up -d db mailpit

# 3. Install & migrate
npm install
npm run build -w @startup-stack/catalog
npm run build -w @startup-stack/workspace-gen
npm run db:migrate -w @startup-stack/web

# 4. Run the app
npm run dev
# Open http://localhost:3000
# Magic links appear in Mailpit: http://localhost:8025

# Optional local n8n
docker compose --profile n8n up -d
```

Full Docker (app + db + mailpit):

```bash
docker compose up --build
```

## Quick Start — Agent skill (harness-only)

Preferred path when working inside this repo with an AI harness:

```bash
git clone https://github.com/lewisdonovan/startup-stack.git
cd startup-stack
# Open in Cursor / Claude Code / Gemini CLI, then: "Run /bootstrap" or "Set up my Startup Stack"
```

See [docs/getting-started.md](docs/getting-started.md) for harness setup, profile collection, and OTP/CAPTCHA pauses.

Aspirational CLI (not shipped yet):

```bash
npx startup-stack bootstrap
```

The onboarding app / bootstrap skill will:
1. Collect name, email, and company name
2. Ask which services you want (and which accounts already exist)
3. Guide OAuth or API-key setup (local n8n via Docker profile)
4. Encrypt keys in Postgres; export a one-time workspace zip
5. Verify connectivity with `scripts/verify-mcp.sh`

## Using the Generated Project

Once bootstrapped, open the project in your AI harness:

```bash
cd my-startup
claude          # launches Claude Code with CLAUDE.md loaded
```

Your agent will have:
- Free AI inference via OpenRouter
- MCP servers connected to all your selected services
- Skills loaded for cross-platform workflows
- Full context about your business setup

## Project Structure

```
my-startup/
├── .mcp.json              # MCP server configurations
├── .env                   # API keys (gitignored)
├── .env.example           # Template with placeholders
├── .gitignore
├── CLAUDE.md              # System prompt for AI harness
├── README.md              # This file
├── skills/                # Pulled skills (platform-tagged)
│   ├── linear/
│   ├── supabase/
│   └── cross-platform/
└── scripts/
    ├── verify-mcp.sh      # Check MCP server connectivity (auto-loads .env)
    └── setup-n8n.sh       # Start local n8n via Docker Compose
```

Also at repo root: `docker-compose.n8n.yml`, and bootstrap playbooks under `skills/bootstrap/playbooks/`.

## License

MIT
