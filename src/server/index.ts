/**
 * @fileoverview Concave Server - Effect-based Convex Backend Integration
 *
 * This module provides Effect-based wrappers for Convex backend services,
 * enabling functional programming patterns with type-safe error handling,
 * composable operations, and dependency injection through Effect's Context system.
 *
 * Key features:
 * - **Type Safety**: All operations return Effects with typed errors
 * - **Composability**: Chain operations using Effect combinators (pipe, flatMap, etc.)
 * - **Dependency Injection**: Access services through Context tags (yield* QueryCtx)
 * - **Structured Error Handling**: Use typed errors instead of exceptions
 * - **Option Types**: Database operations return Option<T> instead of null
 *
 * @example Basic Usage
 * ```typescript
 * import {createQueryCtx, createMutationCtx, createFunctions} from "concave/server"
 * import {Effect as E, Option} from "effect"
 *
 * const QueryCtx = createQueryCtx<DataModel>()
 * const MutationCtx = createMutationCtx<DataModel>()
 * const {query, mutation} = createFunctions({QueryCtx, MutationCtx})
 *
 * export const getUser = query({
 *   args: {id: v.id("users")},
 *   handler: E.fn(function* (args) {
 *     const {db} = yield* QueryCtx
 *     return yield* db.get(args.id).pipe(
 *       E.flatMap(Option.match({
 *         onNone: () => E.fail(new DocNotFoundError()),
 *         onSome: (user) => E.succeed(user)
 *       }))
 *     )
 *   })
 * })
 * ```
 *
 * @module concave/server
 */

export * from "./auth"
export * from "./context"
export * from "./database"
export * from "./error"
export * from "./model"
export * from "./query"
export * from "./scheduler"
export * from "./server"
export * from "./storage"
