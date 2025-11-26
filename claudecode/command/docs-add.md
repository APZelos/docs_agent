---
description: Add a new documentation source to the doc agents system
agent: build
---

# Add New Documentation Source

This command adds a new library/framework documentation source to the doc agents system.

## Required Information

Collect the following information from the user if not already provided:

1. **Command Name**: The slash command name (e.g., `docs-react-query`, `docs-prisma`) - should be lowercase with hyphens and prefixed with `docs-`
2. **Display Name**: Human-readable name (e.g., "React Query", "Prisma ORM")
3. **GitHub URL**: Full GitHub repository URL (e.g., `https://github.com/TanStack/query`)
4. **Main Branch**: The default branch name (usually `main` or `master`)
5. **Short Description**: Brief description of what this library does

## Instructions

After collecting the above information, execute these steps in order:

### Step 1: Add the Git Subtree

Navigate to the docs_agent directory and add the repository as a subtree:

```bash
cd $AI_AGENT_HOME/docs_agent
git subtree add --prefix resource/{command-name} {github-url}.git {branch} --squash
```

Replace `{command-name}`, `{github-url}`, and `{branch}` with the actual values.

### Step 2: Discover Documentation Structure

Explore the newly added repository to find documentation:

```bash
# Check for common documentation locations
ls -la resource/{command-name}/
ls -la resource/{command-name}/docs/ 2>/dev/null
ls -la resource/{command-name}/README.md 2>/dev/null
ls -la resource/{command-name}/examples/ 2>/dev/null
ls -la resource/{command-name}/packages/*/docs/ 2>/dev/null
ls -la resource/{command-name}/packages/*/README.md 2>/dev/null
```

Based on what you find, note the documentation paths for the special instructions.

### Step 3: Create Command Files

Create the command file for **OpenCode** at `opencode/command/docs-{command-name}.md`:

```md
---
description: Get up to date information about {Display Name}
---

You have access to the {Display Name} documentation and source code at `$AI_AGENT_HOME/docs_agent/resource/{command-name}`.

Use this codebase to provide accurate, up-to-date information about {Display Name} and {short description}.

## Instructions

- When you are searching the codebase, be very careful that you do not read too much at once. Only read a small amount at a time as you're searching, avoid reading dozens of files at once...
{special-instructions-if-any}
```

Create the command file for **Claude Code** at `claudecode/command/docs-{command-name}.md` with the same content.

### Step 4: Update Agent Files

Add the new library to the codebase list in **both** agent files:

**OpenCode** (`opencode/agent/docs.md`):
- Add to the "Currently you have access to the following codebases:" list:
  ```
  - {Display Name} - `$AI_AGENT_HOME/docs_agent/resource/{command-name}`
  ```

**Claude Code** (`claudecode/agent/docs.md`):
- Add the same entry to the codebases list

If special instructions are needed (based on Step 2), add a new section to both agent files:
```md
## Special instructions for {Display Name}:

- Before searching through the codebase, check the `{docs-path}` directory to see if you can answer the question based on the documentation. If you can, then answer the question based on the documentation. If you cannot, then search through the codebase.
```

### Step 5: Update docs-update.md Command

Add the update command to **both** `opencode/command/docs-update.md` and `claudecode/command/docs-update.md`:

```md
- **Update {Display Name} repository**

    ```bash
    git subtree pull --prefix resource/{command-name} {github-url}.git {branch}
    ```
```

### Step 6: Determine Special Instructions

Based on the documentation structure found in Step 2, create appropriate special instructions:

| If you find... | Special instruction template |
|---|---|
| `docs/` directory | "Generally just search the docs for the answer to the question, don't search the codebase unless you absolutely have to" |
| `README.md` only | "Before searching through the codebase, check the `README.md` file to see if you can answer..." |
| `examples/` directory | "Before searching through the codebase, check the `examples/` directory to see if you can answer..." |
| `packages/*/docs/` | "Before searching through the codebase, check the `packages/{package-name}/docs/` directory..." |
| Multiple sources | List all: "check the `docs/` directory, `README.md`, and `examples/`..." |
| Unusual structure | Describe the specific path where docs are located |

### Step 7: Verify Setup

1. Confirm the subtree was added: `ls resource/{command-name}/`
2. Confirm command files exist in both `opencode/command/docs-{command-name}.md` and `claudecode/command/docs-{command-name}.md`
3. Confirm agent files were updated in both `opencode/agent/` and `claudecode/agent/`
4. Confirm docs-update.md was updated in both locations

## Example

For adding "Drizzle ORM" with GitHub URL `https://github.com/drizzle-team/drizzle-orm`:

1. Command: `docs-drizzle`
2. Display Name: `Drizzle ORM`  
3. GitHub: `https://github.com/drizzle-team/drizzle-orm`
4. Branch: `main`
5. Description: "type-safe SQL ORM for TypeScript"

Would result in:
- Subtree at `resource/drizzle/`
- Commands at `opencode/command/docs-drizzle.md` and `claudecode/command/docs-drizzle.md`
- Updated agent files with Drizzle in the list
- Special instructions based on discovered docs structure
