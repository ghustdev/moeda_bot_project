---
name: find-skills
description: Helps discover, search, evaluate, and install agent skills from the open skills ecosystem (skills.sh, GitHub, vercel-labs/skills) when looking to improve prompt quality, automate workflows, or add specialized domain capabilities.
---

# Find Skills

This skill enables the agent to discover, search, evaluate, and install skills from the open agent skills ecosystem ([skills.sh](https://skills.sh) / `vercel-labs/skills`).

## When to Use This Skill

Use this skill when:

- Seeking to improve agent prompts, system prompt engineering, or LLM output formatting for the project.
- Looking for tools, runbooks, or best-practice workflows (e.g., WhatsApp Baileys integration, Notion API workflows, Groq / Llama prompt optimization).
- The user asks "how do I do X", "find a skill for X", or "is there a skill for X".
- Needing specialized domain assistance (testing, database integration, security rules, performance, design).

## What is the Skills CLI?

The Skills CLI (`npx skills`) is the package manager for AI agent capabilities. Skills are modular packages containing `SKILL.md` runbooks, scripts, and documentation that extend the agent's behavior.

### Key Commands:

- `npx skills find [query]` — Search for skills interactively or by keyword.
- `npx skills add <package>` — Install a skill from GitHub or other sources (e.g., `npx skills add vercel-labs/skills --skill find-skills` or `npx skills add owner/repo`).
- `npx skills list` — List all installed skills in the current workspace.
- `npx skills update` — Update installed skills.

## Finding and Installing Skills Workflow

### 1. Understand the Domain & Need

Identify what capability or optimization is needed:

- **Prompt Engineering & Hardening**: E.g. structured outputs, JSON schema validation, zero-shot/few-shot prompt refinement, handling ambiguous user inputs.
- **Framework & API Skills**: E.g. Notion API integration, WhatsApp Baileys connection stability, Groq / Llama-3 model parameter tuning.
- **Testing & Code Quality**: E.g. automated message testing, error recovery, audio transcription validation.

### 2. Check the Skills Leaderboard & Registry

- Browse top skills at [skills.sh](https://skills.sh/).
- Look for verified, battle-tested skills with high adoption and proven utility.

### 3. Install or Scaffold Skills in the Workspace

To install a skill into this project:

- Using CLI: `npx skills add <owner/repo>` or `npx skills add <package> --skill <skill-name>`
- Structuring in workspace: Create `.agents/skills/<skill-name>/SKILL.md` with:
  - YAML frontmatter: `name` and `description`
  - Step-by-step procedures, guidelines, and reference links
  - Scripts in `scripts/` or references in `references/` if necessary

### 4. Evaluating Skill Quality

Before adopting a skill:

- Check that the `description` is specific about _what_ the skill does and _when_ to activate it.
- Ensure instructions provide concrete examples, edge-case handling, and verification steps.
- Verify compatibility with the current project stack (Node.js ESM, Baileys, Groq SDK, Notion SDK).
