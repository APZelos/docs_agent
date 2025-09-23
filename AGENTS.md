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

## Convex Restrictions

- **Internal functions**: `internalQuery`, `internalMutation`, `internalAction` can ONLY be called from actions or HTTP actions, never from outside Convex runtime
- **Return types**: Convex functions (`query`, `mutation`, `action`, `httpAction`) CANNOT return Effect objects like `Option`, `Effect`, `Either` - they must return serializable values only
- **Context isolation**: Queries cannot call mutations, mutations cannot call other mutations directly
- **Serialization**: All function arguments and return values must be JSON-serializable (no functions, classes, or Effect types)
- **Database access**: Only mutations and actions can write to database; queries are read-only
- **External calls**: Only actions can make HTTP requests or call external APIs
- **Async boundaries**: Use `E.runPromise` or `E.runSync` to convert Effects to Promises/values at Convex function boundaries
- **File storage**: File operations (upload/delete) only available in mutations and actions
- **Scheduling**: `scheduler.runAfter` and `scheduler.runAt` only available in mutations and actions
- **Auth in scheduled jobs**: `getAuthUserId()` and `getUserIdentity()` ALWAYS return `null` in scheduled functions - use internal functions that don't require auth checks
- **Database limits**: Queries/mutations can read max 8MiB/16384 docs, mutations can write max 8MiB/8192 docs - design Effect chains to respect these limits
- **Function timeouts**: Queries/mutations timeout at 1 second, actions at 10 minutes - break long Effect computations accordingly
- **File storage patterns**: Store file IDs in database, never URLs; use `ctx.storage.getUrl()` to get signed URLs; query `_storage` system table for metadata
- **Validator usage**: ALWAYS use argument validators (`v.object()`, `v.string()`, etc.) for all Convex functions; NEVER use return validators when starting
- **Index constraints**: Never include `_creationTime` as last column in custom indexes; use built-in `by_creation_time` and `by_id` indexes
- **Query filtering**: Use indexes with `withIndex()` instead of `.filter()` for performance; define indexes in schema for common query patterns
- **Pagination**: Use `paginationOptsValidator` and `.paginate()` for large result sets; returns `{page, isDone, continueCursor}` object
