---
description: Update the linked codebases to the latest version
agent: build
---

# Update Command

This command updates all the linked codebases (svelte.dev, effect, and neverthrow) to their latest versions by pulling fresh changes from the upstream repositories.

You will need to run the following commands in this directory: `$AI_AGENT_HOME/doc_agent`

## Instructions

Execute the following git subtree pull commands in sequence to update each repository:

- **Update Effect.ts repository**

    ```bash
    git subtree pull --prefix resource/effect https://github.com/Effect-TS/effect.git main
    ```

- **Update Convex repository**

    ```bash
    git subtree pull --prefix resource/convex https://github.com/get-convex/convex-js.git main
    ```

- **Update Convex Helpers repository**

    ```bash
    git subtree pull --prefix resource/convex-helpers https://github.com/get-convex/convex-helpers.git main
    ```

- **Update Convex React Query repository**

    ```bash
    git subtree pull --prefix resource/convex-react-query https://github.com/get-convex/convex-react-query.git main
    ```

- **Update Concave repository**

    ```bash
    git subtree pull --prefix resource/concave https://github.com/APZelos/concave.git main
    ```

- **Update WorkOS TanStack Start repository**

    ```bash
    git subtree pull --prefix resource/workos-tanstack-start https://github.com/workos/authkit-tanstack-start.git main
    ```

- **Update Luxon repository**

    ```bash
    git subtree pull --prefix resource/luxon https://github.com/moment/luxon.git master
    ```

- **Update TanStack Start repository**

    ```bash
    git subtree pull --prefix resource/tanstack-start https://github.com/TanStack/router.git main
    ```

- **Update TanStack Form repository**

    ```bash
    git subtree pull --prefix resource/tanstack-form https://github.com/TanStack/form.git main
    ```

- **Update TanStack Query repository**

    ```bash
    git subtree pull --prefix resource/tanstack-query https://github.com/TanStack/query.git main
    ```

- **Update BaseUI repository**

    ```bash
    git subtree pull --prefix resource/base-ui https://github.com/mui/base-ui.git master
    ```

Each command will fetch the latest changes from the upstream repository and merge them into the local subtree. There should be no conflicts, if there are ask the user what they want to do.
