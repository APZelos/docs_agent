---
description: Setup or update Claude Code documentation agents and commands
agent: build
---

# Claude Code Documentation Setup

This command sets up or updates Claude Code commands and agents on your machine. It works as an upsert operation - updating existing files or creating new ones as needed.

## Instructions

Execute the following steps to initialize or update the Claude Code configuration:

### 1. Setup Claude Code Configuration

Create the Claude Code directories if they don't exist and copy all files from the docs_agent repository:

```bash
# Create directories if they don't exist
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/commands

# Copy agent files
cp -u $AI_AGENT_HOME/docs_agent/claudecode/agent/*.md ~/.claude/agents/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/claudecode/agent/*.md ~/.claude/agents/

# Copy command files
cp -u $AI_AGENT_HOME/docs_agent/claudecode/command/*.md ~/.claude/commands/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/claudecode/command/*.md ~/.claude/commands/
```

### 2. Verify Installation

Check that the files were copied successfully:

```bash
ls ~/.claude/agents/
ls ~/.claude/commands/
```

You should see:
- Agent files: `docs.md`
- Command files: All library-specific commands (e.g., `docs-convex.md`, `docs-tanstack-query.md`, etc.), plus `docs-add.md`, `docs-update.md`, and `docs-setup.md`

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer (fallback to regular `cp` if `-u` is not supported on macOS)
- All necessary parent directories will be created if they don't already exist
- After setup, you can use all Claude Code documentation commands (e.g., `/docs-convex`, `/docs-tanstack-query`, etc.)
- Run this command anytime there are updates to the documentation agents or commands

## What This Sets Up

This command installs:
- **Documentation Agent**: Allows you to use `docs:` prefix to query multiple documentation sources
- **Library Commands**: Individual slash commands for each library (e.g., `/docs-convex`, `/docs-effect`, `/docs-luxon`, etc.)
- **Utility Commands**: 
  - `/docs-add`: Add new documentation sources
  - `/docs-update`: Update all documentation repositories
  - `/docs-setup`: Re-run this setup (useful for updates)
