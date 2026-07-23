# Provisioning Protocol

Shared rules for all bootstrap playbooks. Follow these before and during every service provisioning run.

This is **user-supervised agent automation** in the user's browser — not unattended headless spam. Pause whenever a human gate appears.

---

## Prerequisites

1. Profile collected: `full_name`, `email`, `company_name`
2. Per-service flag: user already has an account? (`existing` vs `new`)
3. Browser MCP available (e.g. Chrome DevTools / Cursor browser tools)

If no browser MCP is available, skip Tier 2 playbooks and use Tier 3 deep-link guidance from `docs/services.md`. Tier 1 Docker (n8n) may still proceed.

---

## Hybrid Auth (SSO → email+password)

For every SaaS signup/login:

1. Open the signup or login URL from the service playbook.
2. Prefer **Continue with Google** / **Sign in with Google** if shown.
3. If Google SSO works (Chrome already logged into the right account), continue after any consent gate.
4. If Google SSO is unavailable, fails, or the user prefers email:
   - Generate a password: `openssl rand -base64 24`
   - Store it in `.env` as `<SERVICE>_ACCOUNT_PASSWORD` (e.g. `OPENROUTER_ACCOUNT_PASSWORD`)
   - Fill name, email, company fields from the profile
   - Submit the form
5. Never reuse one generated password across services unless the user explicitly asks.

---

## Human Gates (mandatory pause)

Stop and ask the user when you hit any of:

| Gate | What to tell the user |
|------|------------------------|
| CAPTCHA / bot check | "There's a CAPTCHA in the browser. Please solve it, then reply when done." |
| Email verification / magic link | "Check your inbox for a verification email from [service]. Click the link or paste the code here." |
| OTP / 2FA code | "Enter the code from your email/authenticator (or paste it here and I'll fill it)." |
| OAuth consent | "Approve the permissions screen in the browser, then reply when done." |
| Notion page sharing | After creating the integration: "Share any pages/databases the agent should access via ⋯ → Connect to → [integration]." |

Do **not** invent CAPTCHA solutions or guess OTPs. Wait for the user.

---

## Browser Interaction Rules

- Use accessibility snapshots / DOM inspection to find controls — **do not** hard-code brittle CSS selectors that will rot.
- Prefer role + visible name (button "Create API key", link "Settings").
- After each major navigation, re-snapshot before clicking.
- If the UI does not match the playbook, adapt once; if still blocked, fall back to Tier 3.

---

## Writing Secrets

1. Write credentials only to the project-root **gitignored** `.env` file.
2. Create `.env` from `.env.example` if missing (`cp .env.example .env`).
3. Upsert keys (replace existing line for that key, or append). Prefer a small shell snippet:

```bash
# upsert KEY=VALUE into .env without printing the value
upsert_env() {
  local key="$1" value="$2" file=".env"
  touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    # portable-ish in-place replace
    awk -v k="$key" -v v="$value" 'BEGIN{FS=OFS="="} $1==k{$0=k"="v} {print}' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}
```

4. After writing, confirm only the **env var names** in chat (e.g. "Wrote `RESEND_API_KEY`"). Never re-print secret values.
5. Never commit `.env`. Never put live secrets into `.mcp.json` — use env var references / placeholders that the harness resolves from the environment.
6. Account passwords for email signups go in `.env` as `<SERVICE>_ACCOUNT_PASSWORD`. Treat `.env` as the password vault for bootstrap-created accounts.

---

## Failure → Tier 3 Fallback

If automation fails (blocked UI, unsupported flow, repeated errors):

1. Tell the user what failed and why.
2. Give the signup URL and exact steps from `docs/services.md`.
3. Ask them to paste the credential back when ready.
4. Continue provisioning other services; do not abort the whole bootstrap.

---

## Framing

Describe actions as: "I'll drive your browser to set this up; I'll pause when you need to verify email or solve a CAPTCHA." Do not claim fully unattended account creation.
