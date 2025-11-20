# Doc Agents

This is a really dumb but incredibly effective way to get better coding agent responses for libraries and frameworks.

Basically you just clone the entire source repo for the library/framework as a git subtree, and then you can ask the agent to search the codebase for the answer to a question, and it works really well.

## OpenCode Configuration

1. clone the repo
2. copy paste the following command into opencode (while it's open in your home directory)

And now you have slash commands for these libraries/frameworks in opencode. as well as a special agent in opencode that can search the codebase for the answer to a question.

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
cp -u $AI_AGENT_HOME/doc_agent/opencode/agent/*.md ~/.config/opencode/agent/

# Copy command files
cp -u $AI_AGENT_HOME/doc_agent/opencode/command/*.md ~/.config/opencode/command/
```

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer
- All necessary parent directories will be created if they don't already exist
- After setup, users can run OpenCode commands from their respective directories
````

# Claude Code

## Configuration

1. clone the repo
2. copy paste the following command into claude code (while it's open in your home directory)

And now you have slash commands for these libraries/frameworks in claude code, as well as a special agent that can search the codebase for the answer to a question.

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
cp -u $AI_AGENT_HOME/doc_agent/claudecode/agent/*.md ~/.claude/agents/

# Copy command files
cp -u $AI_AGENT_HOME/doc_agent/claudecode/command/*.md ~/.claude/commands/
```

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer
- All necessary parent directories will be created if they don't already exist
- After setup, users can run Claude Code commands from their respective directories
````

## Usage Examples

### Using Slash Commands

Once installed, you can use any of the library-specific slash commands:

```
/tanstack-query How do I set up a mutation with optimistic updates?
```

```
/convex What's the best way to implement real-time subscriptions?
```

```
/effect How do I compose multiple effects with error handling?
```

### Using the Doc Agent

The doc-agent has access to all library codebases and is perfect for cross-library questions or when you're not sure which library to use:

**Cross-library integration:**

```
Use doc-agent to explain how TanStack Query and Convex work together for caching
```

**Comparing libraries:**

```
Hey doc-agent, should I use Luxon or native JavaScript Date for timezone handling in my app?
```

**Architecture decisions:**

```
doc-agent: I'm building a full-stack React app with real-time features. Compare using
TanStack Start + Convex vs TanStack Start + TanStack Query + WebSockets
```

**Learning multiple libraries:**

```
Can you use doc-agent to create a mental model of how Effect, Convex, and TanStack Query
relate to each other in terms of data flow?
```

### Updating Library Codebases

Keep your library sources up to date:

```
/docs-update
```

This will pull the latest changes from all library repositories.

### Example Workflows

**Learning a new API:**

```
/luxon Show me how to parse and format dates in different timezones
```

**Implementing a feature:**

```
/tanstack-form How do I add field-level validation with custom error messages?
```

**Troubleshooting:**

```
/base-ui I'm getting accessibility warnings with the Select component, what am I missing?
```

**Comparing approaches:**

```
Use doc-agent to compare the state management patterns in TanStack Query vs Convex
```

## Using with Active Development

### Refactoring with Library Best Practices

```
/effect I'm refactoring this error handling code to use Effect. Here's my current implementation:
@src/api/users.ts

Can you show me how to rewrite this using Effect's error handling patterns?
```

### Implementing New Features

```
/tanstack-query I need to add infinite scroll to my user list component. Here's the current implementation:
@src/components/UserList.tsx

Can you help me convert this to use TanStack Query's useInfiniteQuery?
```

### Migrating Between Libraries

```
/convex I'm migrating from Firebase to Convex. Here's my current Firebase query:
@src/hooks/useMessages.ts

How would I rewrite this using Convex's query patterns?
```

### Debugging with Documentation Context

```
/luxon I'm getting incorrect dates in different timezones. Here's my code:
@src/utils/dateFormatter.ts

What am I doing wrong based on Luxon's documentation?
```

### Updating to Latest Patterns

```
/tanstack-form My form validation isn't working as expected. I'm using an older pattern:
@src/forms/LoginForm.tsx

Can you update this to use the latest TanStack Form validation approach?
```

### Building Complex Features

```
/convex /tanstack-start I'm building a real-time chat feature in my TanStack Start app.
Here's what I have so far:
@app/routes/chat.tsx
@convex/messages.ts

Can you help me wire up the Convex real-time subscriptions properly?
```

### Code Review with Library Guidelines

```
/base-ui I've implemented this custom Select component but want to ensure it follows
BaseUI's accessibility guidelines:
@src/components/CustomSelect.tsx

Can you review this against BaseUI's patterns and suggest improvements?
```

### Using Doc Agent for Architecture Decisions

**Choosing the right stack:**

```
doc-agent: I'm starting a new project that needs forms, data fetching, and real-time updates.
Looking at my requirements in @docs/requirements.md, which combination of libraries
(TanStack Form, TanStack Query, Convex) would work best?
```

**Integrating multiple libraries:**

```
Hey doc-agent, I have this data layer using Convex (@convex/schema.ts) and want to add
form handling with TanStack Form (@src/forms/CreatePost.tsx). How should I wire these
together following both libraries' best practices?
```

**Refactoring decisions:**

```
doc-agent: I'm using Effect for error handling and want to integrate Convex for the backend.
Here's my current Effect-based API layer: @src/api/
Can you show me how to best combine Effect and Convex patterns?
```

**Migration planning:**

```
Use doc-agent to analyze my current implementation (@src/state/) and create a migration
plan from my custom state management to TanStack Query + Convex
```
