---
description: Setup or update OpenCode documentation agents and commands
agent: build
---

# OpenCode Documentation Setup

This command sets up or updates OpenCode commands and agents on your machine. It works as an upsert operation - updating existing files or creating new ones as needed.

## Instructions

Execute the following steps to initialize or update the OpenCode configuration:

### 1. Setup OpenCode Configuration

Create the OpenCode directories if they don't exist and copy all files from the docs_agent repository:

```bash
# Create directories if they don't exist
mkdir -p ~/.config/opencode/agent
mkdir -p ~/.config/opencode/command

# Copy agent files
cp -u $AI_AGENT_HOME/docs_agent/opencode/agent/*.md ~/.config/opencode/agent/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/opencode/agent/*.md ~/.config/opencode/agent/

# Copy command files
cp -u $AI_AGENT_HOME/docs_agent/opencode/command/*.md ~/.config/opencode/command/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/opencode/command/*.md ~/.config/opencode/command/
```

### 2. Verify Installation

Check that the files were copied successfully:

```bash
ls ~/.config/opencode/agent/
ls ~/.config/opencode/command/
```

You should see:

- Agent files: `docs.md` and `docs-plan.md`
- Command files: All library-specific commands (e.g., `docs-convex.md`, `docs-tanstack-query.md`, etc.), plus `docs-add.md`, `docs-update.md`, and `docs-setup.md`

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer (fallback to regular `cp` if `-u` is not supported on macOS)
- All necessary parent directories will be created if they don't already exist
- After setup, you can use all OpenCode documentation commands (e.g., `/docs-convex`, `/docs-tanstack-query`, etc.)
- Run this command anytime there are updates to the documentation agents or commands

## What This Sets Up

This command installs:

- **Documentation Agent**: Allows you to use `docs:` prefix to query multiple documentation sources
- **Library Commands**: Individual slash commands for each library (e.g., `/docs-convex`, `/docs-effect`, `/docs-luxon`, etc.)
- **Utility Commands**:
    - `/docs-add`: Add new documentation sources
    - `/docs-update`: Update all documentation repositories
    - `/docs-setup`: Re-run this setup (useful for updates)
