import type {GenericQueryCtx, QueryCtxTag} from "@server"
import type {
  QueryStream as ConvexQueryStream,
  StreamDatabaseReader as ConvexStreamDatabaseReader,
  StreamQuery as ConvexStreamQuery,
  StreamQueryInitializer as ConvexStreamQueryInitializer,
} from "convex-helpers/server/stream"
import type {
  PaginationOptions as BasePaginationOptions,
  PaginationResult as ConvexPaginationResult,
  DataModelFromSchemaDefinition,
  DocumentByInfo,
  GenericDataModel,
  IndexNames,
  IndexRange,
  IndexRangeBuilder,
  NamedIndex,
  NamedTableInfo,
  SchemaDefinition,
  TableNamesInDataModel,
} from "convex/server"

import {
  mergedStream as convexMergedStream,
  stream as convexStream,
} from "convex-helpers/server/stream"
import {Effect as E, pipe} from "effect"

import {DocNotUniqueError} from "@server"

export function stream<Schema extends SchemaDefinition<any, boolean>>(
  QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>,
  queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>,
  schema: Schema,
) {
  return new StreamDatabaseReader(QueryCtx, queryCtx, convexStream(queryCtx.db.convexDb, schema))
}

export function mergedStream<DataModel extends GenericDataModel, T extends GenericStreamItem>(
  streams: QueryStream<DataModel, T>[],
  orderByIndexFields: string[],
) {
  const [stream] = streams
  if (!stream) {
    throw new Error("Cannot union empty array of streams")
  }

  return new QueryStream(
    stream.QueryCtx,
    stream.queryCtx,
    convexMergedStream(
      streams.map((stream) => stream.convexStream),
      orderByIndexFields,
    ),
  )
}

export class StreamDatabaseReader<Schema extends SchemaDefinition<any, boolean>> {
  QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>
  queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>
  convexStreamDb: ConvexStreamDatabaseReader<Schema>

  constructor(
    QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>,
    queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>,
    convexStreamDb: ConvexStreamDatabaseReader<Schema>,
  ) {
    this.QueryCtx = QueryCtx
    this.queryCtx = queryCtx
    this.convexStreamDb = convexStreamDb
  }

  query<TableName extends TableNamesInDataModel<DataModelFromSchemaDefinition<Schema>>>(
    tableName: TableName,
  ): StreamQueryInitializer<Schema, TableName> {
    return new StreamQueryInitializer(
      this.QueryCtx,
      this.queryCtx,
      this.convexStreamDb.query(tableName),
    )
  }
}

export type GenericStreamItem = NonNullable<unknown>

interface PaginationOptions extends BasePaginationOptions {
  endCursor?: string | null
  maximumRowsRead?: number
}

export class QueryStream<DataModel extends GenericDataModel, T extends GenericStreamItem> {
  QueryCtx: QueryCtxTag<DataModel>
  queryCtx: GenericQueryCtx<DataModel>
  convexStream: ConvexQueryStream<T>

  constructor(
    QueryCtx: QueryCtxTag<DataModel>,
    queryCtx: GenericQueryCtx<DataModel>,
    convexStream: ConvexQueryStream<T>,
  ) {
    this.QueryCtx = QueryCtx
    this.queryCtx = queryCtx
    this.convexStream = convexStream
  }

  filterWith(predicate: (doc: T) => E.Effect<boolean, unknown, GenericQueryCtx<DataModel>>) {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.filterWith(async (doc) =>
        pipe(predicate(doc), E.provideService(this.QueryCtx, this.queryCtx), E.runPromise),
      ),
    )
  }

  map<U extends GenericStreamItem>(
    mapper: (doc: T) => E.Effect<U | null, unknown, GenericQueryCtx<DataModel>>,
  ): QueryStream<DataModel, U> {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.map(async (doc) =>
        pipe(mapper(doc), E.provideService(this.QueryCtx, this.queryCtx), E.runPromise),
      ),
    )
  }

  flatMap<U extends GenericStreamItem>(
    mapper: (doc: T) => E.Effect<QueryStream<DataModel, U>, unknown, GenericQueryCtx<DataModel>>,
    mappedIndexFields: string[],
  ): QueryStream<DataModel, U> {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.flatMap(
        async (doc) =>
          pipe(mapper(doc), E.provideService(this.QueryCtx, this.queryCtx), E.runPromise).then(
            (r) => r.convexStream,
          ),
        mappedIndexFields,
      ),
    )
  }

  distinct(distinctIndexFields: string[]): QueryStream<DataModel, T> {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.distinct(distinctIndexFields),
    )
  }

  paginate(opts: PaginationOptions): E.Effect<ConvexPaginationResult<T>> {
    return E.promise(async () => this.convexStream.paginate(opts))
  }

  collect(): E.Effect<T[]> {
    return E.promise(async () => this.convexStream.collect())
  }

  take(n: number): E.Effect<T[]> {
    return E.promise(async () => this.convexStream.take(n))
  }

  first(): E.Effect<T | null> {
    return E.promise(async () => this.convexStream.first())
  }

  unique(): E.Effect<T | null, DocNotUniqueError, never> {
    return this.take(2).pipe(
      E.flatMap((docs) => {
        if (docs.length > 1) {
          return E.fail(new DocNotUniqueError())
        }

        return E.succeed(docs[0] ?? null)
      }),
    )
  }
}

export class StreamQuery<
  Schema extends SchemaDefinition<any, boolean>,
  TableName extends TableNamesInDataModel<DataModelFromSchemaDefinition<Schema>>,
  IndexName extends IndexNames<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>,
> extends QueryStream<
  DataModelFromSchemaDefinition<Schema>,
  DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>
> {
  override convexStream: ConvexStreamQuery<Schema, TableName, IndexName>

  constructor(
    QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>,
    queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>,
    convexStream: ConvexStreamQuery<Schema, TableName, IndexName>,
  ) {
    super(QueryCtx, queryCtx, convexStream)
    this.convexStream = convexStream
  }

  order(
    order: "asc" | "desc",
  ): QueryStream<
    DataModelFromSchemaDefinition<Schema>,
    DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>
  > {
    return new QueryStream(this.QueryCtx, this.queryCtx, this.convexStream.order(order))
  }
}

export class StreamQueryInitializer<
  Schema extends SchemaDefinition<any, boolean>,
  TableName extends TableNamesInDataModel<DataModelFromSchemaDefinition<Schema>>,
> extends QueryStream<
  DataModelFromSchemaDefinition<Schema>,
  DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>
> {
  override convexStream: ConvexStreamQueryInitializer<Schema, TableName>

  constructor(
    QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>,
    queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>,
    convexStream: ConvexStreamQueryInitializer<Schema, TableName>,
  ) {
    super(QueryCtx, queryCtx, convexStream)
    this.convexStream = convexStream
  }

  fullTableScan(): StreamQuery<Schema, TableName, "by_creation_time"> {
    return this.withIndex("by_creation_time")
  }

  withIndex<
    IndexName extends IndexNames<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>,
  >(
    indexName: IndexName,
    indexRange?: (
      q: IndexRangeBuilder<
        DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>,
        NamedIndex<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>, IndexName>
      >,
    ) => IndexRange,
  ): StreamQuery<Schema, TableName, IndexName> {
    return new StreamQuery(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.withIndex(indexName, indexRange),
    )
  }

  order(
    order: "asc" | "desc",
  ): QueryStream<
    DataModelFromSchemaDefinition<Schema>,
    DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>
  > {
    return this.fullTableScan().order(order)
  }
}
