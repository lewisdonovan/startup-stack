# Resend Setup

Set up Resend for transactional email and email templates.

tags: [resend]

## Setup

1. Go to https://resend.com/signup and create an account
2. Verify your email address
3. Go to API Keys → Create API key
4. Add to `.env`: `RESEND_API_KEY=<your-key>`

## Usage

The Resend MCP server provides tools for sending emails, creating templates, and managing domains.

## Example Prompts

- "Send a welcome email to user@example.com"
- "Create a welcome email template"
- "Send an email with HTML content"
- "List all email templates"