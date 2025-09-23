# Agent Guidelines for Concave

## Project Overview

**Concave** is an npm library that integrates the Effect functional programming library with Convex backend services. It provides type-safe, composable abstractions over Convex's database operations, auth, storage, and scheduling using Effect's functional programming paradigm.

**Philosophy**: Bridge Effect's powerful functional programming primitives (Effect, Option, Context) with Convex's backend services, enabling:

- **Type safety**: Full TypeScript support with proper error handling
- **Composability**: Functions return Effects that can be chained, mapped, and composed
- **Dependency injection**: Use Effect's Context system for clean service management
- **Functional error handling**: Replace try/catch with Effect's structured error handling

**Architecture**: Wraps Convex's native context objects (QueryCtx, MutationCtx, ActionCtx) in Effect-aware wrappers that return Effects instead of Promises. All database operations return `Effect<T, E, never>` where errors are typed and handled functionally.

## Build/Test/Lint Commands

- `pnpm test` - Run all tests with vitest
- `pnpm test -- --run` - Run tests once (no watch mode)
- `pnpm test -- src/test/query.test.ts` - Run single test file
- `pnpm build` - Build with tsup
- `pnpm typecheck` - Type check with tsc
- `pnpm lint` - Lint with eslint
- `pnpm checks` - Run typecheck, lint, and prettier check
- `pnpm format` - Format code with prettier

## Code Style

- **Imports**: Type imports with `type` keyword, sorted by prettier plugin
- **Functions**: Use function declarations (`func-style: declaration`), no arrow functions
- **Objects**: Use object shorthand (`object-shorthand: error`)
- **Types**: Prefer type imports (`@typescript-eslint/consistent-type-imports`)
- **Line length**: Max 120 chars (eslint), 100 chars (prettier)
- **Formatting**: No semicolons, 2 spaces, no bracket spacing
- **Async**: Functions returning promises must be async (`promise-function-async`)
- **Unused vars**: Prefix with `_` to ignore
- **Effect**: Uses Effect library for functional programming patterns
- **Convex**: Built for Convex backend, follow Convex patterns for queries/mutations

## Effect-Convex Patterns

- **Handlers**: Use `E.fn(function* () { ... })` generator syntax for Effect handlers
- **Context access**: Use `yield* QueryCtx` or `yield* MutationCtx` to access services
- **Error handling**: Use typed errors (DocNotFoundError, DocNotUniqueError) instead of throwing
- **Option handling**: Database operations return Options, use `Option.getOrNull` when needed
- **Service injection**: All Convex operations wrapped to use Effect's Context system
