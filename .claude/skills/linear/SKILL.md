---
name: Linear Setup
description: Set up Linear for project management, issue tracking, and sprint planning.
tags: [linear]
---

# Linear Setup

Set up Linear for project management, issue tracking, and sprint planning.

## Setup

1. Go to https://linear.app/signup and create an account (or use existing)
2. Create a workspace for your startup (Settings → Workspaces → New workspace)
3. Go to Settings → APIs → New API Key → Personal API key
4. Add to `.env`: `LINEAR_API_KEY=<your-key>`
5. (Optional) Generate a webhook secret for event integrations: `LINEAR_WEBHOOK_SECRET=<secret>`

## Usage

The Linear MCP server provides tools for creating issues, projects, teams, and sprints.

## Example Prompts

- "Create a backlog project in Linear"
- "Triage all incoming issues and label them by priority"
- "Create a sprint from the roadmap"
- "List all open issues assigned to me"