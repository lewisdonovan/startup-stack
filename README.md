# Startup Stack

Startup Stack helps founders stand up an **agentic business workspace**: pick the SaaS tools you use, connect them (OAuth or API keys), and download a ready-to-open folder with MCP configs, skills, and env files for Claude Code, Cursor, or any MCP-capable harness.

This repo is the **onboarding app** that drives that flow — a Next.js front-end and API, Postgres for users and encrypted secrets, and Docker Compose for local development.

## Getting started (Docker)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

```bash
git clone https://github.com/lewisdonovan/startup-stack.git
cd startup-stack

cp apps/web/.env.example apps/web/.env
# Set AUTH_SECRET and ENCRYPTION_KEY to long random strings

docker compose up --build
```

| URL | What |
|-----|------|
| http://localhost:3000 | Onboarding app |
| http://localhost:8025 | Mailpit (magic-link emails) |

Sign up in the app, open the magic link from Mailpit, choose services, connect accounts, then download your workspace zip.

Optional local n8n:

```bash
docker compose --profile n8n up -d
```

More detail (env vars, OAuth, troubleshooting): [docs/getting-started.md](docs/getting-started.md).

## License

MIT
