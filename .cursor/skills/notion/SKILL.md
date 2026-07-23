---
name: Notion Setup
description: Set up Notion for documentation, wikis, and knowledge base management.
tags: [notion]
---

# Notion Setup

Set up Notion for documentation, wikis, and knowledge base management.

## Setup

1. Go to https://www.notion.so/signup and create an account
2. Go to https://app.notion.com/developers/tokens and create a new API key
3. Give it a name (e.g., "Startup Stack"), select the workspace, and generate a secret
4. Copy the secret and add to `.env`: `NOTION_API_KEY=<secret>`
5. `NOTION_INTEGRATION_TYPE=internal`
6. **Important:** For each Notion page or database you want the integration to access, open the page, click `⋯` → `Connect to` → select your integration

## Usage

The Notion MCP server provides tools for creating pages, querying databases, and managing content.

## Example Prompts

- "Create a documentation page titled 'Product Roadmap'"
- "Query all pages in the 'Engineering' database"
- "Create a database for tracking meeting notes"
- "Add a new entry to the team wiki"