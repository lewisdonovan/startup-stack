---
name: n8n Setup
description: Set up n8n for workflow automation, pipelines, and integrations.
tags: [n8n]
---

# n8n Setup

Set up n8n for workflow automation, pipelines, and integrations.

## Setup

**Prefer bootstrap:** follow [skills/bootstrap/playbooks/n8n.md](../bootstrap/playbooks/n8n.md) — local Docker via `bash scripts/setup-n8n.sh`, then browser owner + API key. Manual fallback:

1. Local: `bash scripts/setup-n8n.sh` then open http://localhost:5678
2. Or use [n8n Cloud](https://n8n.io) / your own self-hosted instance
3. Go to **Settings → n8n API** and create a new API key
4. Add to `.env`:
   - `N8N_BASE_URL=<your-n8n-instance-url>` (e.g. `http://localhost:5678`)
   - `N8N_API_KEY=<your-api-key>`

## Usage

The n8n MCP server provides tools for creating workflows, triggering executions, and managing credentials. Use it to build automation workflows that connect your other services.

## Example Prompts

- "Create a workflow that sends a welcome email when a new Supabase row is added"
- "Trigger the 'New Lead' workflow"
- "List all active workflows"
- "Sync Notion pages to a Resend email digest"
