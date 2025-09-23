import type {
  GenericDatabaseReader as ConvexGenericDatabaseReader,
  GenericDatabaseWriter as ConvexGenericDatabaseWriter,
  DocumentByName,
  GenericDataModel,
  NamedTableInfo,
  TableNamesInDataModel,
  WithOptionalSystemFields,
  WithoutSystemFields,
} from "convex/server"
import type {GenericId} from "convex/values"

import {Effect as E, Option, pipe} from "effect"

import {DocInvalidId} from "./error"
import {QueryInitializer} from "./query"

/**
 * An interface to read from the database within Convex query functions.
 *
 * This Effect-based wrapper provides type-safe database operations that return
 * Effects instead of Promises. Operations can be composed using Effect's
 * functional combinators like pipe(), flatMap(), and map().
 *
 * The two entry points are:
 *   - {@link GenericDatabaseReader.get}, which returns an Effect<Option<T>>
 *   - {@link GenericDatabaseReader.query}, which returns composable query Effects
 *
 * @example
 * ```typescript
 * const user = yield* db.get(userId).pipe(
 *   E.flatMap(Option.match({
 *     onNone: () => E.fail(new DocNotFoundError()),
 *     onSome: (user) => E.succeed(user)
 *   }))
 * )
 * ```
 */
export class GenericDatabaseReader<DataModel extends GenericDataModel> {
  convexDb: ConvexGenericDatabaseReader<DataModel>

  constructor(convexDb: ConvexGenericDatabaseReader<DataModel>) {
    this.convexDb = convexDb
  }

  /**
   * Fetch a single document from the database by its {@link values.GenericId}.
   *
   * @param id - The {@link values.GenericId} of the document to fetch from the database.
   * @returns An Effect that yields an Option containing the document if it exists,
   * or Option.None if the document is not found. The Effect never fails.
   */
  get<TableName extends TableNamesInDataModel<DataModel>>(
    id: GenericId<TableName>,
  ): E.Effect<Option.Option<DocumentByName<DataModel, TableName>>, never, never> {
    return E.promise(async () => this.convexDb.get(id)).pipe(E.map(Option.fromNullable))
  }

  /**
   * Begin a query for the given table name.
   *
   * Queries don't execute immediately, so calling this method and extending its
   * query are free until the results are actually used.
   *
   * @param tableName - The name of the table to query.
   * @returns - A {@link QueryInitializer} object to start building a query.
   */
  query<TableName extends TableNamesInDataModel<DataModel>>(
    tableName: TableName,
  ): QueryInitializer<NamedTableInfo<DataModel, TableName>> {
    return new QueryInitializer(this.convexDb.query(tableName))
  }

  /**
   * Returns the string ID format for the ID in a given table.
   *
   * This accepts the string ID format as well as the `.toString()` representation
   * of the legacy class-based ID format.
   *
   * This does not guarantee that the ID exists (i.e. `db.get(id)` may return Option.None).
   *
   * @param tableName - The name of the table.
   * @param id - The ID string.
   * @returns An Effect that yields the normalized ID or fails with DocInvalidId
   * if the ID is invalid for the given table.
   */
  normalizeId<TableName extends TableNamesInDataModel<DataModel>>(
    tableName: TableName,
    id: string,
  ): E.Effect<GenericId<TableName>, DocInvalidId, never> {
    return pipe(
      E.sync(() => this.convexDb.normalizeId(tableName, id)),
      E.map(Option.fromNullable),
      E.flatMap(
        Option.match({
          onNone: () => E.fail(new DocInvalidId()),
          onSome: (normalizedId) => E.succeed(normalizedId),
        }),
      ),
    )
  }
}

/**
 * An interface to read from and write to the database within Convex mutation
 * functions.
 *
 * This Effect-based wrapper extends GenericDatabaseReader with write operations
 * that return Effects for composable, type-safe database mutations.
 *
 * Convex guarantees that all writes within a single mutation are
 * executed atomically, so you never have to worry about partial writes leaving
 * your data in an inconsistent state. See [the Convex Guide](https://docs.convex.dev/understanding/convex-fundamentals/functions#atomicity-and-optimistic-concurrency-control)
 * for the guarantees Convex provides your functions.
 */
export class GenericDatabaseWriter<
  DataModel extends GenericDataModel,
> extends GenericDatabaseReader<DataModel> {
  override convexDb: ConvexGenericDatabaseWriter<DataModel>

  constructor(convexDb: ConvexGenericDatabaseWriter<DataModel>) {
    super(convexDb)
    this.convexDb = convexDb
  }

  /**
   * Insert a new document into a table.
   *
   * @param table - The name of the table to insert a new document into.
   * @param value - The {@link values.Value} to insert into the given table.
   * @returns An Effect that yields the {@link values.GenericId} of the new document.
   */
  insert<TableName extends TableNamesInDataModel<DataModel>>(
    table: TableName,
    value: WithoutSystemFields<DocumentByName<DataModel, TableName>>,
  ): E.Effect<GenericId<TableName>, never, never> {
    return E.promise(async () => this.convexDb.insert(table, value))
  }

  /**
   * Patch an existing document, shallow merging it with the given partial
   * document.
   *
   * New fields are added. Existing fields are overwritten. Fields set to
   * `undefined` are removed.
   *
   * @param id - The {@link values.GenericId} of the document to patch.
   * @param value - The partial {@link GenericDocument} to merge into the specified document. If this new value
   * specifies system fields like `_id`, they must match the document's existing field values.
   * @returns An Effect that completes when the patch operation succeeds.
   */
  patch<TableName extends TableNamesInDataModel<DataModel>>(
    id: GenericId<TableName>,
    value: Partial<DocumentByName<DataModel, TableName>>,
  ): E.Effect<void, never, never> {
    return E.promise(async () => this.convexDb.patch(id, value))
  }

  /**
   * Replace the value of an existing document, overwriting its old value.
   *
   * @param id - The {@link values.GenericId} of the document to replace.
   * @param value - The new {@link GenericDocument} for the document. This value can omit the system fields,
   * and the database will fill them in.
   * @returns An Effect that completes when the replace operation succeeds.
   */
  replace<TableName extends TableNamesInDataModel<DataModel>>(
    id: GenericId<TableName>,
    value: WithOptionalSystemFields<DocumentByName<DataModel, TableName>>,
  ): E.Effect<void, never, never> {
    return E.promise(async () => this.convexDb.replace(id, value))
  }

  /**
   * Delete an existing document.
   *
   * @param id - The {@link values.GenericId} of the document to remove.
   * @returns An Effect that completes when the delete operation succeeds.
   */
  delete<TableName extends TableNamesInDataModel<DataModel>>(
    id: GenericId<TableName>,
  ): E.Effect<void, never, never> {
    return E.promise(async () => this.convexDb.delete(id))
  }
}
