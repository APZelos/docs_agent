import type {
  GenericActionCtx as ConvexGenericActionCtx,
  GenericMutationCtx as ConvexGenericMutationCtx,
  GenericQueryCtx as ConvexGenericQueryCtx,
  Expand,
  FunctionReference,
  FunctionReturnType,
  FunctionVisibility,
  GenericDataModel,
  NamedTableInfo,
  OptionalRestArgs,
  TableNamesInDataModel,
  VectorIndexNames,
  VectorSearchQuery,
} from "convex/server"
import type {GenericId} from "convex/values"

import {Context, Effect as E} from "effect"

import {Auth} from "./auth"
import {GenericDatabaseReader, GenericDatabaseWriter} from "./database"
import {Scheduler} from "./scheduler"
import {StorageActionWriter, StorageReader, StorageWriter} from "./storage"

/**
 * A set of services for use within Convex query functions.
 *
 * This Effect-based wrapper provides query context through Effect's Context system,
 * enabling dependency injection and composable service access. All services return
 * Effects instead of Promises for functional composition.
 *
 * The query context is injected into Effect handlers using `yield* QueryCtx`.
 *
 * This differs from the {@link MutationCtx} because all of the services are
 * read-only.
 */
export class GenericQueryCtx<DataModel extends GenericDataModel> {
  convexQueryCtx: ConvexGenericQueryCtx<DataModel>

  /**
   * Information about the currently authenticated user.
   */
  auth: Auth

  /**
   * A utility for reading data in the database.
   */
  db: GenericDatabaseReader<DataModel>

  /**
   * A utility for reading files in storage.
   */
  storage: StorageReader

  constructor(convexQueryCtx: ConvexGenericQueryCtx<DataModel>) {
    this.convexQueryCtx = convexQueryCtx
    this.auth = new Auth(convexQueryCtx.auth)
    this.db = new GenericDatabaseReader(convexQueryCtx.db)
    this.storage = new StorageReader(convexQueryCtx.storage)
  }

  /**
   * Call a query function within the same transaction.
   *
   * NOTE: often you can call the query's function directly instead of using this.
   * `runQuery` incurs overhead of running argument and return value validation,
   * and creating a new isolated JS context.
   */
  runQuery<Query extends FunctionReference<"query", FunctionVisibility>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): E.Effect<FunctionReturnType<Query>> {
    return E.promise(async () => this.convexQueryCtx.runQuery(query, ...args))
  }
}

/**
 * Effect Context tag for GenericQueryCtx.
 *
 * This type represents the Context tag used for dependency injection
 * of query context services into Effect computations.
 */
export type QueryCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericQueryCtx<DataModel>,
  GenericQueryCtx<DataModel>
>

/**
 * Create a Context tag for query context dependency injection.
 *
 * This function creates a typed Context tag that enables Effect-based
 * dependency injection of query context services.
 *
 * @returns A Context tag for GenericQueryCtx that can be used with
 * `yield* QueryCtx` to access query services.
 *
 * @example
 * ```typescript
 * const QueryCtx = createQueryCtx<DataModel>()
 *
 * const handler = E.fn(function* () {
 *   const {db} = yield* QueryCtx
 *   return yield* db.query("users").collect()
 * })
 * ```
 */
export function createQueryCtx<DataModel extends GenericDataModel>(): QueryCtxTag<DataModel> {
  return Context.GenericTag<GenericQueryCtx<DataModel>>("QueryCtx")
}

/**
 * A set of services for use within Convex mutation functions.
 *
 * This Effect-based wrapper provides mutation context through Effect's Context system,
 * enabling dependency injection and composable service access. All services return
 * Effects instead of Promises for functional composition.
 *
 * The mutation context is injected into Effect handlers using `yield* MutationCtx`.
 */
export class GenericMutationCtx<DataModel extends GenericDataModel> {
  convexMutationCtx: ConvexGenericMutationCtx<DataModel>

  /**
   * Information about the currently authenticated user.
   */
  auth: Auth

  /**
   * A utility for reading and writing data in the database.
   */
  db: GenericDatabaseWriter<DataModel>

  /**
   * A utility for reading and writing files in storage.
   */
  storage: StorageWriter

  /**
   * A utility for scheduling Convex functions to run in the future.
   */
  scheduler: Scheduler

  constructor(convexMutationCtx: ConvexGenericMutationCtx<DataModel>) {
    this.convexMutationCtx = convexMutationCtx
    this.auth = new Auth(convexMutationCtx.auth)
    this.db = new GenericDatabaseWriter(convexMutationCtx.db)
    this.storage = new StorageWriter(convexMutationCtx.storage)
    this.scheduler = new Scheduler(convexMutationCtx.scheduler)
  }

  /**
   * Call a query function within the same transaction.
   *
   * NOTE: often you can call the query's function directly instead of using this.
   * `runQuery` incurs overhead of running argument and return value validation,
   * and creating a new isolated JS context.
   */
  runQuery<Query extends FunctionReference<"query", FunctionVisibility>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): E.Effect<FunctionReturnType<Query>> {
    return E.promise(async () => this.convexMutationCtx.runQuery(query, ...args))
  }

  /**
   * Call a mutation function within the same transaction.
   *
   * NOTE: often you can call the mutation's function directly instead of using this.
   * `runMutation` incurs overhead of running argument and return value validation,
   * and creating a new isolated JS context.
   *
   * The mutation runs in a sub-transaction, so if the mutation throws an error,
   * all of its writes will be rolled back. Additionally, a successful mutation's
   * writes will be serializable with other writes in the transaction.
   */
  runMutation<Mutation extends FunctionReference<"mutation", FunctionVisibility>>(
    mutation: Mutation,
    ...args: OptionalRestArgs<Mutation>
  ): E.Effect<FunctionReturnType<Mutation>> {
    return E.promise(async () => this.convexMutationCtx.runMutation(mutation, ...args))
  }
}

/**
 * Effect Context tag for GenericMutationCtx.
 *
 * This type represents the Context tag used for dependency injection
 * of mutation context services into Effect computations.
 */
export type MutationCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericMutationCtx<DataModel>,
  GenericMutationCtx<DataModel>
>

/**
 * Create a Context tag for mutation context dependency injection.
 *
 * This function creates a typed Context tag that enables Effect-based
 * dependency injection of mutation context services.
 *
 * @returns A Context tag for GenericMutationCtx that can be used with
 * `yield* MutationCtx` to access mutation services.
 *
 * @example
 * ```typescript
 * const MutationCtx = createMutationCtx<DataModel>()
 *
 * const handler = E.fn(function* (args) {
 *   const {db} = yield* MutationCtx
 *   return yield* db.insert("users", args)
 * })
 * ```
 */
export function createMutationCtx<DataModel extends GenericDataModel>(): MutationCtxTag<DataModel> {
  return Context.GenericTag<GenericMutationCtx<DataModel>>("MutationCtx")
}

/**
 * A set of services for use within Convex action functions.
 *
 * This Effect-based wrapper provides action context through Effect's Context system,
 * enabling dependency injection and composable service access. All services return
 * Effects instead of Promises for functional composition.
 *
 * The action context is injected into Effect handlers using `yield* ActionCtx`.
 */
export class GenericActionCtx<DataModel extends GenericDataModel> {
  convexActionCtx: ConvexGenericActionCtx<DataModel>

  /**
   * Information about the currently authenticated user.
   */
  auth: Auth

  /**
   * A utility for reading and writing files in storage.
   */
  storage: StorageActionWriter

  /**
   * A utility for scheduling Convex functions to run in the future.
   */
  scheduler: Scheduler

  constructor(convexActionCtx: ConvexGenericActionCtx<DataModel>) {
    this.convexActionCtx = convexActionCtx
    this.auth = new Auth(convexActionCtx.auth)
    this.storage = new StorageActionWriter(convexActionCtx.storage)
    this.scheduler = new Scheduler(convexActionCtx.scheduler)
  }

  /**
   * Run the Convex query with the given name and arguments.
   *
   * Consider using an {@link internalQuery} to prevent users from calling the
   * query directly.
   *
   * @param query - A {@link FunctionReference} for the query to run.
   * @param args - The arguments to the query function.
   * @returns An Effect that yields the query's result.
   */
  runQuery<Query extends FunctionReference<"query", FunctionVisibility>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): E.Effect<FunctionReturnType<Query>> {
    return E.promise(async () => this.convexActionCtx.runQuery(query, ...args))
  }

  /**
   * Run the Convex mutation with the given name and arguments.
   *
   * Consider using an {@link internalMutation} to prevent users from calling
   * the mutation directly.
   *
   * @param mutation - A {@link FunctionReference} for the mutation to run.
   * @param args - The arguments to the mutation function.
   * @returns An Effect that yields the mutation's result.
   */
  runMutation<Mutation extends FunctionReference<"mutation", FunctionVisibility>>(
    mutation: Mutation,
    ...args: OptionalRestArgs<Mutation>
  ): E.Effect<FunctionReturnType<Mutation>> {
    return E.promise(async () => this.convexActionCtx.runMutation(mutation, ...args))
  }

  /**
   * Run the Convex action with the given name and arguments.
   *
   * Consider using an {@link internalAction} to prevent users from calling the
   * action directly.
   *
   * @param action - A {@link FunctionReference} for the action to run.
   * @param args - The arguments to the action function.
   * @returns An Effect that yields the action's result.
   */
  runAction<Action extends FunctionReference<"action", FunctionVisibility>>(
    action: Action,
    ...args: OptionalRestArgs<Action>
  ): E.Effect<FunctionReturnType<Action>> {
    return E.promise(async () => this.convexActionCtx.runAction(action, ...args))
  }

  /**
   * Perform vector search on the specified table and index.
   *
   * @param tableName - The name of the table to search.
   * @param indexName - The name of the vector index to use.
   * @param query - The vector search query configuration.
   * @returns An Effect that yields an array of search results with scores.
   */
  vectorSearch<
    TableName extends TableNamesInDataModel<DataModel>,
    IndexName extends VectorIndexNames<NamedTableInfo<DataModel, TableName>>,
  >(
    tableName: TableName,
    indexName: IndexName,
    query: Expand<VectorSearchQuery<NamedTableInfo<DataModel, TableName>, IndexName>>,
  ): E.Effect<{_id: GenericId<TableName>; _score: number}[]> {
    return E.promise(async () => this.convexActionCtx.vectorSearch(tableName, indexName, query))
  }
}

/**
 * Effect Context tag for GenericActionCtx.
 *
 * This type represents the Context tag used for dependency injection
 * of action context services into Effect computations.
 */
export type ActionCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericActionCtx<DataModel>,
  GenericActionCtx<DataModel>
>

/**
 * Create a Context tag for action context dependency injection.
 *
 * This function creates a typed Context tag that enables Effect-based
 * dependency injection of action context services.
 *
 * @returns A Context tag for GenericActionCtx that can be used with
 * `yield* ActionCtx` to access action services.
 *
 * @example
 * ```typescript
 * const ActionCtx = createActionCtx<DataModel>()
 *
 * const handler = E.fn(function* (args) {
 *   const {runQuery} = yield* ActionCtx
 *   return yield* runQuery(api.queries.getUser, {id: args.userId})
 * })
 * ```
 */
export function createActionCtx<DataModel extends GenericDataModel>(): ActionCtxTag<DataModel> {
  return Context.GenericTag<GenericActionCtx<DataModel>>("ActionCtx")
}

/**
 * Pre-configured Context tag for HTTP Action context.
 *
 * This is a ready-to-use Context tag for HTTP actions that use the
 * generic data model. Use this for HTTP actions that don't need
 * a specific typed data model.
 *
 * @example
 * ```typescript
 * const httpHandler = E.fn(function* (request: Request) {
 *   const {storage} = yield* HttpActionCtx
 *   return yield* storage.generateUploadUrl()
 * })
 * ```
 */
export const HttpActionCtx = Context.GenericTag<GenericActionCtx<GenericDataModel>>("HttpActionCtx")
