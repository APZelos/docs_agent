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
 * The query context is passed as the first argument to any Convex query
 * function run on the server.
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
}

export type QueryCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericQueryCtx<DataModel>,
  GenericQueryCtx<DataModel>
>

export function createQueryCtx<DataModel extends GenericDataModel>(): QueryCtxTag<DataModel> {
  return Context.GenericTag<GenericQueryCtx<DataModel>>("QueryCtx")
}

/**
 * A set of services for use within Convex mutation functions.
 *
 * The mutation context is passed as the first argument to any Convex mutation
 * function run on the server.
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
}

export type MutationCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericMutationCtx<DataModel>,
  GenericMutationCtx<DataModel>
>

export function createMutationCtx<DataModel extends GenericDataModel>(): MutationCtxTag<DataModel> {
  return Context.GenericTag<GenericMutationCtx<DataModel>>("MutationCtx")
}

/**
 * A set of services for use within Convex action functions.
 *
 * The context is passed as the first argument to any Convex action
 * run on the server.
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
   * @returns A promise of the query's result.
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
   * @returns A promise of the mutation's result.
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
   * @returns A promise of the action's result.
   */
  runAction<Action extends FunctionReference<"action", FunctionVisibility>>(
    action: Action,
    ...args: OptionalRestArgs<Action>
  ): E.Effect<FunctionReturnType<Action>> {
    return E.promise(async () => this.convexActionCtx.runAction(action, ...args))
  }

  /**
   * Run the Convex action with the given name and arguments.
   *
   * Consider using an {@link internalAction} to prevent users from calling the
   * action directly.
   *
   * @param action - A {@link FunctionReference} for the action to run.
   * @param args - The arguments to the action function.
   * @returns A promise of the action's result.
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

export type ActionCtxTag<DataModel extends GenericDataModel> = Context.Tag<
  GenericActionCtx<DataModel>,
  GenericActionCtx<DataModel>
>

export function createActionCtx<DataModel extends GenericDataModel>(): ActionCtxTag<DataModel> {
  return Context.GenericTag<GenericActionCtx<DataModel>>("ActionCtx")
}

export const HttpActionCtx = Context.GenericTag<GenericActionCtx<GenericDataModel>>("HttpActionCtx")
