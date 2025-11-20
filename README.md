# Doc Agents

This is a really dumb but incredibly effective way to get better coding agent responses for libraries and frameworks.

Basically you just clone the entire source repo for the library/framework as a git subtree, and then you can ask the agent to search the codebase for the answer to a question, and it works really well.

## Configuration

1. clone the repo
2. copy paste the following command into opencode (while it's open in your home directory)

And now you have slash commands for these libraries/frameworks in opencode. as well as a special agent in opencode that can search the codebase for the answer to a question.

````md
# Init Command

This command sets up opencode commands and agents on the user's machine. It works as an upsert operation - updating existing files or creating new ones as needed.

## Instructions

Execute the following steps to initialize the configurations:

### 1. Setup OpenCode Configuration

Create the OpenCode directories if they don't exist and copy all files from @OPENCODE_ASSETS/:

```bash
# Create directories if they don't exist
mkdir -p ~/.config/opencode/agent
mkdir -p ~/.config/opencode/command

# Copy agent files
cp -u $AI_AGENT_HOME/doc_agent/OPENCODE_ASSETS/agent/*.md ~/.config/opencode/agent/

# Copy command files
cp -u $AI_AGENT_HOME/doc_agent/OPENCODE_ASSETS/command/*.md ~/.config/opencode/command/
```

## Notes

- The `cp -u` flag ensures existing files are only overwritten if the source is newer
- All necessary parent directories will be created if they don't already exist
- After setup, users can run OpenCode commands from their respective directories
````
