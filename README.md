# Doc Agents

This is a really dumb but incredibly effective way to get better coding agent responses for libraries and frameworks.

**Acknowledgement:** This project is inspired by and built upon https://github.com/bmdavis419/.better-coding-agents/.

Basically you just clone the entire source repo for the library/framework as a git subtree, and then you can ask the agent to search the codebase for the answer to a question, and it works really well.

## OpenCode Configuration

1. clone the repo
2. copy paste the following command into opencode (while it's open in your home directory)

````md
# Init Command

This command sets up opencode commands and agents on the user's machine. It works as an upsert operation - updating existing files or creating new ones as needed.

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

## Claude Code Configuration

1. clone the repo
2. copy paste the following command into claude code (while it's open in your home directory)

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
