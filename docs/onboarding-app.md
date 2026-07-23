# Onboarding app — local runbook

## Services

| Compose service | Port | Purpose |
|-----------------|------|---------|
| `db` | 5432 | Postgres |
| `mailpit` | 8025 (UI), 1025 (SMTP) | Magic-link inbox |
| `web` | 3000 | Next.js onboarding app |
| `n8n` (profile) | 5678 | Optional workflow engine |

## Dev loop

```bash
docker compose up -d db mailpit
cp apps/web/.env.example apps/web/.env   # first time
npm install
npm run build -w @startup-stack/catalog
npm run build -w @startup-stack/workspace-gen
npm run db:migrate -w @startup-stack/web
npm run dev
```

## OAuth (optional)

Register developer apps and set in `apps/web/.env`:

- Linear: `LINEAR_OAUTH_CLIENT_ID`, `LINEAR_OAUTH_CLIENT_SECRET`
  - Redirect: `http://localhost:3000/api/oauth/linear/callback`
- Notion: `NOTION_OAUTH_CLIENT_ID`, `NOTION_OAUTH_CLIENT_SECRET`
  - Redirect: `http://localhost:3000/api/oauth/notion/callback`

If unset, the UI falls back to API-key paste.

## Export security

Download creates a single-use token (10 minutes). The zip includes a filled `.env` streamed from memory — plaintext secrets are not written to durable disk on the server.
