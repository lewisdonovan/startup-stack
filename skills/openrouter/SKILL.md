---
name: OpenRouter Setup
description: Set up OpenRouter for free AI inference via the openrouter/free endpoint.
tags: [openrouter]
---

# OpenRouter Setup

Set up OpenRouter for free AI inference via the `openrouter/free` endpoint.

## Setup

1. Go to https://openrouter.ai/signup and create an account
2. Go to https://openrouter.ai/settings/keys and generate a new API key
3. Add the key to `.env`: `OPENROUTER_API_KEY=<your-key>`
4. OpenRouter is configured to use the free tier by default — no model selection needed

## Usage

Once configured, any AI inference requests will route through `openrouter/free` at $0/token with a 200K token context window.

## Example Prompts

- "Answer this question using OpenRouter"
- "Run an analysis on this codebase"