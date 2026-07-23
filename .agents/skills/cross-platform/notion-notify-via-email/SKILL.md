---
name: Notion → Email Notifications
description: Set up automated email notifications when Notion pages are updated.
tags: [notion, resend, n8n]
required: [notion, resend, n8n]
---

# Notion → Email Notifications

Set up automated email notifications when Notion pages are updated using n8n.

## Setup

1. Ensure both Notion and Resend MCP servers are connected
2. Use n8n to create a workflow:
   - Trigger: Webhook or schedule (cron)
   - Action 1: Query Notion database for updated pages since last run
   - Action 2: Format update summary
   - Action 3: Send email via Resend

## Steps

1. In n8n, create a new workflow
2. Add a **Schedule Trigger** node (e.g., every 6 hours)
3. Add a **Notion Read** node — query your database(s) for pages updated since the last run
4. Add a **Function** node to format the updates into a readable summary
5. Add a **Resend Send Email** node with the formatted content
6. Test the workflow and activate it

## Example Prompts

- "Set up a daily digest of Notion page updates sent via email"
- "Create a workflow that emails me when specific Notion pages are modified"
- "Build a notification workflow: Notion changes → Resend email"