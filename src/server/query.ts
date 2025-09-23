import type {
  DocumentByInfo as ConvexDocumentByInfo,
  GenericTableInfo as ConvexGenericTableInfo,
  OrderedQuery as ConvexOrderedQuery,
  PaginationResult as ConvexPaginationResult,
  Query as ConvexQuery,
  QueryInitializer as ConvexQueryInitializer,
  DocumentByInfo,
  ExpressionOrValue,
  FilterBuilder,
  IndexNames,
  IndexRange,
  IndexRangeBuilder,
  NamedIndex,
  NamedSearchIndex,
  PaginationOptions,
  SearchFilter,
  SearchFilterBuilder,
  SearchIndexNames,
} from "convex/server"

import {Effect as E, Option} from "effect"

import {DocNotUniqueError} from "./error"

/**
 * A {@link Query} with an order that has already been defined.
 *
 * This Effect-based wrapper provides ordered query operations that return
 * Effects instead of Promises. All methods can be chained and composed
 * using Effect's functional combinators.
 *
 * OrderedQuery extends the base query interface with ordering constraints,
 * ensuring that operations like pagination work correctly with ordered data.
 */
export class OrderedQuery<TableInfo extends ConvexGenericTableInfo> {
  convexQuery: ConvexOrderedQuery<TableInfo>

  constructor(convexQuery: ConvexOrderedQuery<TableInfo>) {
    this.convexQuery = convexQuery
  }

  /**
   * Filter the query output, returning only the values for which `predicate` evaluates to true.
   *
   * @param predicate - An {@link Expression} constructed with the supplied {@link FilterBuilder} that specifies which documents to keep.
   * @returns A new {@link OrderedQuery} with the given filter predicate applied.
   */
  filter(
    predicate: (q: FilterBuilder<TableInfo>) => ExpressionOrValue<boolean>,
  ): OrderedQuery<TableInfo> {
    return new OrderedQuery(this.convexQuery.filter(predicate))
  }

  /**
   * Load a page of `n` results and obtain a {@link Cursor} for loading more.
   *
   * Note: If this is called from a reactive query function the number of
   * results may not match `paginationOpts.numItems`!
   *
   * `paginationOpts.numItems` is only an initial value. After the first invocation,
   * `paginate` will return all items in the original query range. This ensures
   * that all pages will remain adjacent and non-overlapping.
   *
   * @param paginationOpts - A {@link PaginationOptions} object containing the number
   * of items to load and the cursor to start at.
   * @returns An Effect that yields a {@link PaginationResult} containing the page
   * of results and a cursor to continue paginating.
   */
  paginate(
    paginationOpts: PaginationOptions,
  ): E.Effect<ConvexPaginationResult<ConvexDocumentByInfo<TableInfo>>, never, never> {
    return E.promise(async () => this.convexQuery.paginate(paginationOpts))
  }

  /**
   * Execute the query and return all of the results as an array.
   *
   * Note: when processing a query with a lot of results, it's often better to use the `Query` as an
   * `AsyncIterable` instead.
   *
   * @returns An Effect that yields an array of all the query's results.
   */
  collect(): E.Effect<ConvexDocumentByInfo<TableInfo>[], never, never> {
    return E.promise(async () => this.convexQuery.collect())
  }

  /**
   * Execute the query and return the first `n` results.
   *
   * @param n - The number of items to take.
   * @returns An Effect that yields an array of the first `n` results of the query
   * (or less if the query doesn't have `n` results).
   */
  take(n: number): E.Effect<ConvexDocumentByInfo<TableInfo>[], never, never> {
    return E.promise(async () => this.convexQuery.take(n))
  }

  /**
   * Execute the query and return the first result if there is one.
   *
   * @returns An Effect that yields an Option containing the first document
   * if the query has results, or Option.None if the query is empty.
   */
  first(): E.Effect<Option.Option<ConvexDocumentByInfo<TableInfo>>, never, never> {
    return E.promise(async () => this.convexQuery.first()).pipe(E.map(Option.fromNullable))
  }

  /**
   * Execute the query and return the singular result if there is one.
   *
   * @returns An Effect that yields an Option containing the single document,
   * or Option.None if no documents exist. Fails with DocNotUniqueError if
   * multiple documents are found.
   */
  unique(): E.Effect<Option.Option<ConvexDocumentByInfo<TableInfo>>, DocNotUniqueError, never> {
    return this.take(2)
      .pipe(
        E.flatMap((docs) => {
          if (docs.length > 1) {
            return E.fail(new DocNotUniqueError())
          }

          return E.succeed(docs[0] ?? null)
        }),
      )
      .pipe(E.map(Option.fromNullable))
  }
}

/**
 * The {@link Query} interface allows functions to read values out of the database.
 *
 * **If you only need to load an object by ID, use `db.get(id)` instead.**
 *
 * This Effect-based wrapper provides composable database queries that return Effects
 * instead of Promises. All query operations can be chained using Effect combinators.
 *
 * Executing a query consists of calling
 * 1. (Optional) {@link Query.order} to define the order
 * 2. (Optional) {@link Query.filter} to refine the results
 * 3. A *consumer* method to obtain the results as an Effect
 *
 * Queries are lazily evaluated. No work is done until iteration begins, so constructing and
 * extending a query is free. The query is executed incrementally as the results are iterated over,
 * so early terminating also reduces the cost of the query.
 *
 * It is more efficient to use `filter` expression rather than executing JavaScript to filter.
 *
 * |                                              | |
 * |----------------------------------------------|-|
 * | **Ordering**                                 | |
 * | [`order("asc")`](#order)                     | Define the order of query results. |
 * |                                              | |
 * | **Filtering**                                | |
 * | [`filter(...)`](#filter)                     | Filter the query results to only the values that match some condition. |
 * |                                              | |
 * | **Consuming**                                | Execute a query and return results as Effects. |
 * | [`collect()`](#collect)                      | Return all of the results as an Effect<Array>. |
 * | [`take(n: number)`](#take)                   | Return the first `n` results as an Effect<Array>. |
 * | [`first()`](#first)                          | Return the first result as an Effect<Option>. |
 * | [`unique()`](#unique)                        | Return the only result as Effect<Option>, fails with DocNotUniqueError if multiple found. |
 *
 * To learn more about how to write queries, see [Querying the Database](https://docs.convex.dev/using/database-queries).
 */
export class Query<TableInfo extends ConvexGenericTableInfo> extends OrderedQuery<TableInfo> {
  override convexQuery: ConvexQuery<TableInfo>

  constructor(convexQuery: ConvexQuery<TableInfo>) {
    super(convexQuery)
    this.convexQuery = convexQuery
  }

  /**
   * Filter the query output, returning only the values for which `predicate` evaluates to true.
   *
   * @param predicate - An {@link Expression} constructed with the supplied {@link FilterBuilder} that specifies which documents to keep.
   * @returns A new {@link Query} with the given filter predicate applied.
   */
  override filter(
    predicate: (q: FilterBuilder<TableInfo>) => ExpressionOrValue<boolean>,
  ): Query<TableInfo> {
    return new Query(this.convexQuery.filter(predicate))
  }

  /**
   * Define the order of the query output.
   *
   * Use `"asc"` for an ascending order and `"desc"` for a descending order. If not specified, the order defaults to ascending.
   * @param order - The order to return results in.
   */
  order(order: "asc" | "desc"): OrderedQuery<TableInfo> {
    return new OrderedQuery(this.convexQuery.order(order))
  }
}

/**
 * The {@link QueryInitializer} interface is the entry point for building a {@link Query}
 * over a Convex database table.
 *
 * This Effect-based wrapper provides composable query building that returns Effects
 * instead of Promises. All query operations can be chained using Effect combinators.
 *
 * There are two types of queries:
 * 1. Full table scans: Queries created with {@link QueryInitializer.fullTableScan} which
 * iterate over all of the documents in the table in insertion order.
 * 2. Indexed Queries: Queries created with {@link QueryInitializer.withIndex} which iterate
 * over an index range in index order.
 *
 * For convenience, {@link QueryInitializer} extends the {@link Query} interface, implicitly
 * starting a full table scan.
 *
 * @example
 * ```typescript
 * // Index query with Effect composition
 * const activeUsers = yield* db.query("users")
 *   .withIndex("by_status", q => q.eq("status", "active"))
 *   .collect()
 *   .pipe(E.map(users => users.length))
 * ```
 */
export class QueryInitializer<TableInfo extends ConvexGenericTableInfo> extends Query<TableInfo> {
  override convexQuery: ConvexQueryInitializer<TableInfo>

  constructor(convexQuery: ConvexQueryInitializer<TableInfo>) {
    super(convexQuery)
    this.convexQuery = convexQuery
  }

  /**
   * Query by reading all of the values out of this table.
   *
   * This query's cost is relative to the size of the entire table, so this
   * should only be used on tables that will stay very small (say between a few
   * hundred and a few thousand documents) and are updated infrequently.
   *
   * @returns The {@link Query} that iterates over every document of the table.
   */
  fullTableScan(): Query<TableInfo> {
    return new Query(this.convexQuery.fullTableScan())
  }

  /**
   * Query by reading documents from an index on this table.
   *
   * This query's cost is relative to the number of documents that match the
   * index range expression.
   *
   * Results will be returned in index order.
   *
   * To learn about indexes, see [Indexes](https://docs.convex.dev/using/indexes).
   *
   * @param indexName - The name of the index to query.
   * @param indexRange - An optional index range constructed with the supplied
   *  {@link IndexRangeBuilder}. An index range is a description of which
   * documents Convex should consider when running the query. If no index
   * range is present, the query will consider all documents in the index.
   * @returns The query that yields documents in the index.
   */
  withIndex<IndexName extends IndexNames<TableInfo>>(
    indexName: IndexName,
    indexRange?: (
      q: IndexRangeBuilder<ConvexDocumentByInfo<TableInfo>, NamedIndex<TableInfo, IndexName>>,
    ) => IndexRange,
  ): Query<TableInfo> {
    return new Query(this.convexQuery.withIndex(indexName, indexRange))
  }

  /**
   * Query by running a full text search against a search index.
   *
   * Search queries must always search for some text within the index's
   * `searchField`. This query can optionally add equality filters for any
   * `filterFields` specified in the index.
   *
   * Documents will be returned in relevance order based on how well they
   * match the search text.
   *
   * To learn about full text search, see [Indexes](https://docs.convex.dev/text-search).
   *
   * @param indexName - The name of the search index to query.
   * @param searchFilter - A search filter expression constructed with the
   * supplied {@link SearchFilterBuilder}. This defines the full text search to run
   * along with equality filtering to run within the search index.
   * @returns A query that searches for matching documents, returning them
   * in relevancy order.
   */
  withSearchIndex<IndexName extends SearchIndexNames<TableInfo>>(
    indexName: IndexName,
    searchFilter: (
      q: SearchFilterBuilder<DocumentByInfo<TableInfo>, NamedSearchIndex<TableInfo, IndexName>>,
    ) => SearchFilter,
  ): OrderedQuery<TableInfo> {
    return new OrderedQuery(this.convexQuery.withSearchIndex(indexName, searchFilter))
  }
}
