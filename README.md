# Doc Agents

This is a really dumb but incredibly effective way to get better coding agent responses for libraries and frameworks.

**Acknowledgement:** This project is inspired by and built upon https://github.com/bmdavis419/.better-coding-agents/.

Basically you just clone the entire source repo for the library/framework as a git subtree, and then you can ask the agent to search the codebase for the answer to a question, and it works really well.

## Prerequisites

Before setting up the documentation agents, you need to export the `AI_AGENT_HOME` environment variable. This variable should point to the directory where you cloned this repository.

### Setting the Environment Variable

Add the export command to your shell configuration file:

**Bash** (`~/.bashrc` or `~/.bash_profile`):

```bash
echo 'export AI_AGENT_HOME="/path/to/where/you/cloned"' >> ~/.bashrc
source ~/.bashrc
```

**Zsh** (`~/.zshrc`):

```bash
echo 'export AI_AGENT_HOME="/path/to/where/you/cloned"' >> ~/.zshrc
source ~/.zshrc
```

**Fish** (`~/.config/fish/config.fish`):

```fish
echo 'set -gx AI_AGENT_HOME "/path/to/where/you/cloned"' >> ~/.config/fish/config.fish
source ~/.config/fish/config.fish
```

> **Note:** Replace `/path/to/where/you/cloned` with the actual path. For example, if you cloned to `/Users/john/Developer`, then `AI_AGENT_HOME` should be `/Users/john/Developer` (the parent directory containing `docs_agent`).

To verify the variable is set correctly:

```bash
echo $AI_AGENT_HOME
```

## OpenCode Configuration

### Initial Setup

1. Clone the repo
2. Copy and paste the following command into OpenCode (while it's open in your home directory):

````md
# Init Command

This command sets up OpenCode commands and agents on the user's machine. It works as an upsert operation - updating existing files or creating new ones as needed.

## Instructions

Execute the following steps to initialize the configurations:

### 1. Setup OpenCode Configuration

Create the OpenCode directories if they don't exist and copy all files from @opencode/:

```bash
# Create directories if they don't exist
mkdir -p ~/.config/opencode/agent
mkdir -p ~/.config/opencode/command

# Copy agent files
cp -u $AI_AGENT_HOME/docs_agent/opencode/agent/*.md ~/.config/opencode/agent/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/opencode/agent/*.md ~/.config/opencode/agent/

# Copy command files
cp -u $AI_AGENT_HOME/docs_agent/opencode/command/*.md ~/.config/opencode/command/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/opencode/command/*.md ~/.config/opencode/command/
```

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer (fallback to regular `cp` if `-u` is not supported on macOS)
- All necessary parent directories will be created if they don't already exist
- After setup, users can run OpenCode commands from their respective directories
````

### Updating After Initial Setup

Once you've completed the initial setup, you can easily update to the latest agents and commands by running:

```
/docs-setup
```

This command will automatically update all documentation agents and commands without needing to copy the prompt again.

## Claude Code Configuration

### Initial Setup

1. Clone the repo
2. Copy and paste the following command into Claude Code (while it's open in your home directory):

````md
# Init Command

This command sets up Claude Code commands and agents on the user's machine. It works as an upsert operation - updating existing files or creating new ones as needed.

## Instructions

Execute the following steps to initialize the configurations:

### 1. Setup Claude Code Configuration

Create the Claude Code directories if they don't exist and copy all files from @claudecode/:

```bash
# Create directories if they don't exist
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/commands

# Copy agent files
cp -u $AI_AGENT_HOME/docs_agent/claudecode/agent/*.md ~/.claude/agents/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/claudecode/agent/*.md ~/.claude/agents/

# Copy command files
cp -u $AI_AGENT_HOME/docs_agent/claudecode/command/*.md ~/.claude/commands/ 2>/dev/null || cp $AI_AGENT_HOME/docs_agent/claudecode/command/*.md ~/.claude/commands/
```

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer (fallback to regular `cp` if `-u` is not supported on macOS)
- All necessary parent directories will be created if they don't already exist
- After setup, users can run Claude Code commands from their respective directories
````

### Updating After Initial Setup

Once you've completed the initial setup, you can easily update to the latest agents and commands by running:

```
/docs-setup
```

This command will automatically update all documentation agents and commands without needing to copy the prompt again.

## Usage Examples

### Using Slash Commands

```
/tanstack-query How do I set up a mutation with optimistic updates?
/convex What's the best way to implement real-time subscriptions?
/luxon Show me how to parse and format dates in different timezones
```

### Using the Doc Agent

```
docs: Compare TanStack Query vs Convex for state management
Use docs to explain how Effect and Convex work together
docs: Should I use Luxon or native Date for timezone handling?
```

_Note: In Claude Code, use `docs:` prefix. In OpenCode, you can also use `Use docs`._

### Active Development

```
/effect Refactor this error handling code to use Effect patterns: @src/api/users.ts
/tanstack-form Add field validation to this form: @src/forms/LoginForm.tsx
/base-ui Review this component for accessibility: @src/components/CustomSelect.tsx
```

### Updating Libraries

```
/docs-update
```

## Adding New Documentation Sources

To add a new library/framework documentation source, use the `/docs-add` command:

**OpenCode:**

```
/docs-add
```

**Claude Code:**

```
/docs-add
```

The command will guide you through the process of:

1. Adding the library's GitHub repository as a git subtree
2. Creating command files for both OpenCode and Claude Code
3. Updating the docs agent configuration
4. Setting up automatic updates

You'll need to provide:

- Command name (e.g., `react-query`, `prisma`)
- Display name (e.g., "React Query", "Prisma ORM")
- GitHub URL (e.g., `https://github.com/TanStack/query`)
- Main branch (usually `main` or `master`)
- Short description of what the library does
