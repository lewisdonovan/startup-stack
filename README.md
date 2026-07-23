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
│    setup-openrouter.sh      │
└─────────────────────────────┘
```

## Account Provisioning Strategy

Each service follows a tiered fallback:

| Tier | Method | Example Services |
|------|--------|-----------------|
| 1 | **API** — fully automated | n8n (Docker), Supabase (Management API), Resend (API keys) |
| 2 | **Agent browser** — automated via headless browser | Services with simple signup flows |
| 3 | **Human-assisted** — deep-link URLs + step-by-step guidance | Services with OTP/CAPTCHA/OAuth requirements |

When the agent encounters an OTP or email verification step, it pauses and asks the user to either click the verification link or provide the code.

## Supported Services

### Mandatory

- **OpenRouter** — AI model routing, free tier available (`openrouter/free` endpoint, $0/token)
- **Context7** — Up-to-date documentation for libraries and frameworks

### Optional

| Service | Provisioning Method | MCP Server |
|---------|--------------------|------------|
| Linear | Browser / manual | Vendor-maintained |
| Slack | Workspace creation API / browser | Available |
| Figma | Browser / manual | Official |
| Notion | Browser / manual | Vendor-maintained |
| Airtable | API (Enterprise) / browser | Available |
| n8n | Docker Compose (local) | Available |
| Google Workspace | Admin SDK / browser | Available |
| Resend | API (keys) | Available |
| Xero | OAuth / browser | Available |
| Supabase | Management API / CLI | Vendor-maintained |
| Storybook | Local init | Available |
| Shopify | Partner dashboard / browser | Available |

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

## Quick Start

```bash
# Run the bootstrapper
npx startup-stack bootstrap

# Or clone and run locally
git clone https://github.com/lewisdonovan/startup-stack.git
cd startup-stack
npm install
npm run bootstrap
```

The bootstrapper will:
1. Ask which services you want
2. Create the project folder structure
3. Set up OpenRouter with the free endpoint
4. Begin account provisioning (with fallbacks)
5. Generate MCP configs and pull skills
6. Drop you into a ready-to-use agentic workspace

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
    ├── verify-mcp.sh      # Check MCP server connectivity
    └── setup-openrouter.sh # Configure OpenRouter free endpoint
```

## License

MIT
