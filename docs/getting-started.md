# Getting Started

Run the Startup Stack onboarding app locally with Docker, then walk through signup → service setup → workspace download.

---

## What you get

1. **Web app** at http://localhost:3000 — magic-link auth, service picker, guided/OAuth connect, secure key storage
2. **Postgres** — users, workspaces, encrypted API keys
3. **Mailpit** — catch magic-link emails in local dev (http://localhost:8025)
4. **Workspace zip** — `.mcp.json`, filled `.env`, skills, and scripts for your AI harness

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Git

Node.js is only needed if you run the app outside Docker (see [Dev without rebuilding the web image](#dev-without-rebuilding-the-web-image)).

---

## 1. Clone and configure

```bash
git clone https://github.com/lewisdonovan/startup-stack.git
cd startup-stack

cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` and set at least:

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | Long random string (session signing) |
| `ENCRYPTION_KEY` | Long random string (encrypts SaaS keys at rest) |

Defaults for `DATABASE_URL`, `EMAIL_SERVER`, and `APP_URL` work with Compose as shipped. Inside the `web` container, Compose overrides the DB/email hosts to `db` and `mailpit`.

Optional OAuth (otherwise the UI uses API-key paste):

| Variable | Redirect URI to register |
|----------|--------------------------|
| `LINEAR_OAUTH_CLIENT_ID` / `LINEAR_OAUTH_CLIENT_SECRET` | `http://localhost:3000/api/oauth/linear/callback` |
| `NOTION_OAUTH_CLIENT_ID` / `NOTION_OAUTH_CLIENT_SECRET` | `http://localhost:3000/api/oauth/notion/callback` |

---

## 2. Start with Docker Compose

```bash
docker compose up --build
```

This starts:

| Service | Port | Role |
|---------|------|------|
| `web` | 3000 | Next.js onboarding app |
| `db` | 5432 | Postgres |
| `mailpit` | 8025 (UI), 1025 (SMTP) | Magic-link inbox |

Migrations run when the web container starts.

Optional n8n (automation):

```bash
docker compose --profile n8n up -d
```

Then open http://localhost:5678, finish owner setup, and create an API key when the app asks for it.

---

## 3. Use the onboarding flow

1. Open http://localhost:3000
2. Sign up with name, company, and email
3. Open http://localhost:8025 and click the magic link
4. Select services (OpenRouter is required; Context7 is always included)
5. For each service: connect via OAuth if configured, or follow on-screen signup steps and paste keys
6. On the review page, download the workspace zip (single-use link, ~10 minutes)

Unpack the zip, then:

```bash
bash scripts/sync-skills.sh   # copy skills into harness folders
bash scripts/verify-mcp.sh    # check API connectivity
```

Open the folder in Claude Code, Cursor, or your preferred harness.

---

## Services in v1

| Service | How you connect |
|---------|-----------------|
| OpenRouter | API key (required) |
| Context7 | Built-in (no key) |
| Linear | OAuth or API key |
| Notion | OAuth or integration secret |
| Resend | API key |
| Supabase | Access token + project ref |
| n8n | Local Docker profile + API key |

---

## Dev without rebuilding the web image

Useful while iterating on the Next.js app:

```bash
docker compose up -d db mailpit

cp apps/web/.env.example apps/web/.env   # first time only
npm install
npm run build -w @startup-stack/catalog
npm run build -w @startup-stack/workspace-gen
npm run db:migrate -w @startup-stack/web
npm run dev
```

App: http://localhost:3000 · Mailpit: http://localhost:8025

---

## Troubleshooting

### Magic link never arrives

Confirm Mailpit is up (`docker compose ps`) and open http://localhost:8025. Check `EMAIL_SERVER` points at Mailpit (`smtp://localhost:1025` for host-run `npm run dev`, or `smtp://mailpit:1025` inside Compose).

### `docker compose up` fails on `env_file`

Ensure `apps/web/.env` exists (`cp apps/web/.env.example apps/web/.env`).

### Download says not all services are ready

Finish every selected service on its connect page until status is **Ready**, then retry export.

### Push / port already in use

Something else may be bound to 3000, 5432, or 8025. Stop the other process or change the published ports in `docker-compose.yml`.

### n8n won't start

```bash
docker compose --profile n8n up -d
docker compose --profile n8n logs -f n8n
```

---

## Further reading

- [docs/onboarding-app.md](onboarding-app.md) — short ops notes (ports, OAuth, export security)
- [docs/services.md](services.md) — broader service catalog reference
- [skills/](../skills/) — source skills packaged into downloaded workspaces
