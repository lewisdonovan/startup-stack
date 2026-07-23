---
name: n8n Setup
description: Set up n8n for workflow automation, pipelines, and integrations.
tags: [n8n]
---

# n8n Setup

Set up n8n for workflow automation, pipelines, and integrations.

## Setup

1. Go to [n8n.io](https://n8n.io), create an account (or use your self-hosted instance)
2. Go to **Settings → Credentials** and create a new API key
3. Add to `.env`:
   - `N8N_BASE_URL=<your-n8n-instance-url>` (e.g., `https://n8n.lewisygrecia.com`)
   - `N8N_API_KEY=<your-api-key>`

## Usage

The n8n MCP server provides tools for creating workflows, triggering executions, and managing credentials. Use it to build automation workflows that connect your other services.

## Example Prompts

- "Create a workflow that sends a welcome email when a new Supabase row is added"
- "Trigger the 'New Lead' workflow"
- "List all active workflows"
- "Sync Notion pages to a Resend email digest"