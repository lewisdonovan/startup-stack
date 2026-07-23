# Onboarding app — ops notes

Canonical setup steps live in [getting-started.md](getting-started.md). This page is a quick reference.

## Compose services

| Service | Port | Purpose |
|---------|------|---------|
| `db` | 5432 | Postgres |
| `mailpit` | 8025 (UI), 1025 (SMTP) | Magic-link inbox |
| `web` | 3000 | Next.js onboarding app |
| `n8n` (profile) | 5678 | Optional workflow engine |

## OAuth redirects

- Linear: `http://localhost:3000/api/oauth/linear/callback`
- Notion: `http://localhost:3000/api/oauth/notion/callback`

Unset OAuth client env vars → UI falls back to API-key paste.

## Export security

Download issues a single-use token (~10 minutes). The zip includes a filled `.env` built in memory; plaintext secrets are not written to durable disk on the server.
