---
name: Notion to Linear Sync
description: Keep Notion documentation in sync with Linear issues and projects.
tags: [notion, linear]
---

# Notion → Linear Sync

Keep Notion documentation in sync with Linear issues and projects.

## Description

This skill automates the workflow of converting Notion database entries into Linear issues and keeping them in sync. Useful for teams that document in Notion but track work in Linear.

## Steps

1. Use Notion MCP to query the source database (e.g., "Feature Ideas" or "Bug Tracker")
2. For each entry that needs a corresponding Linear issue, create a Linear issue with:
   - Title from Notion page title
   - Description from Notion page content (formatted as markdown)
   - Appropriate project and labels based on Notion properties
3. Create a property on the Notion page to store the Linear issue ID
4. Set up a bidirectional sync so updates in either system can be reflected in the other

## Example Prompts

- "Sync all untracked ideas from the Features database to Linear"
- "Create Linear issues for any Notion page marked 'Ready for Engineering'"
- "Update the status of Linear issues that have closed in Notion"