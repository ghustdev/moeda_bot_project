---
name: security-credentials-and-isolation
description: >-
  Enforces credential safety, secret isolation, environment variable hygiene, and protection
  against committing API keys or sensitive financial data.
---

# Security: Credentials & Secret Isolation Skill

This skill enforces security rules for managing API tokens, credentials, and configuration secrets across development and production.

## 1. Secret Management Rules

- **Never Commit Secrets**: Ensure `.env` and `auth_info_baileys/` are explicitly listed in `.gitignore`.
- **Environment Isolation**:
  - Store tokens only in environment variables (`GEMINI_API_KEY`, `NOTION_API_KEY`, `NOTION_DESPESAS_DB_ID`).
  - Use `.env.example` as a sanitised template without actual secret values.
- **Log Hygiene**:
  - Never print full API keys, tokens, or WhatsApp auth credentials to logs or stdout.
  - Mask tokens in debug outputs (e.g., `secret_****...`).

## 2. Credential Verification Checklist

Before pushing commits or running remote jobs:

- [ ] Run `git status` to verify `auth_info_baileys/` or `.env` are untracked.
- [ ] Check `.gitignore` for `.env`, `*.log`, and credentials directory.
- [ ] Verify that third-party SDK calls pass API keys from `process.env` rather than hardcoded strings.

## 3. Notion Integration Token Scope

- Restrict Notion API integrations to **Internal Integration** mode.
- Only grant access to the specific database pages needed (do not grant workspace-wide read access).
