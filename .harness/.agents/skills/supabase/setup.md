# Supabase Setup

Set up Supabase for PostgreSQL database, authentication, and storage.

tags: [supabase]

## Setup

1. Go to https://supabase.com/dashboard/sign_up and create an account
2. Create a new project — choose a name, generate a strong database password
3. Wait for the project to provision (takes ~2 minutes)
4. Go to Project Settings → API to find your `Project Reference ID` and `URL`
5. Go to Project Settings → Access Tokens → New access token (with `project:read` and `project:write` scopes)
6. Add to `.env`:
   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   SUPABASE_ACCESS_TOKEN=<project-access-token>
   SUPABASE_PROJECT_REF=<project-ref>
   ```

## Usage

The Supabase MCP server provides tools for creating tables, columns, RLS policies, and querying data.

## Example Prompts

- "Create a waitlist table with columns: email, created_at, source"
- "Add an RLS policy allowing public inserts on the waitlist table"
- "Query all rows from the waitlist table"
- "Create a users table with email, name, and role columns"