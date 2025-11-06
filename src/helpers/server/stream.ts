import type {
  QueryStream as ConvexQueryStream,
  StreamDatabaseReader as ConvexStreamDatabaseReader,
  StreamQuery as ConvexStreamQuery,
  StreamQueryInitializer as ConvexStreamQueryInitializer,
} from "convex-helpers/server/stream"
import type {
  PaginationResult as ConvexPaginationResult,
  DataModelFromSchemaDefinition,
  DocumentByInfo,
  GenericDataModel,
  IndexNames,
  IndexRange,
  IndexRangeBuilder,
  NamedIndex,
  NamedTableInfo,
  PaginationResult,
  SchemaDefinition,
  TableNamesInDataModel,
} from "convex/server"
import type {GenericQueryCtx, QueryCtxTag} from "../../server"
import type {SafeUnion} from "src/lib/types"

import {
  mergedStream as convexMergedStream,
  stream as convexStream,
} from "convex-helpers/server/stream"
import {Effect as E, Option, pipe, Runtime, Schema as S} from "effect"

import {DocNotUniqueError, SPaginationOptions} from "../../server"

export function stream<Schema extends SchemaDefinition<any, boolean>>(
  QueryCtx: QueryCtxTag<DataModelFromSchemaDefinition<Schema>>,
  queryCtx: GenericQueryCtx<DataModelFromSchemaDefinition<Schema>>,
  schema: Schema,
) {
  return new StreamDatabaseReader(QueryCtx, queryCtx, convexStream(queryCtx.db.convexDb, schema))
}

export function withStreamIndex<
  Schema extends SchemaDefinition<any, boolean>,
  TableName extends TableNamesInDataModel<DataModelFromSchemaDefinition<Schema>>,
  IndexName extends IndexNames<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>,
>(
  indexName: IndexName,
  indexRange?: (
    q: IndexRangeBuilder<
      DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>,
      NamedIndex<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>, IndexName>
    >,
  ) => IndexRange,
) {
  return (
    q: StreamQueryInitializer<Schema, TableName>,
  ): StreamQuery<Schema, TableName, IndexName> => q.withIndex(indexName, indexRange)
}

export function filterStreamWith<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  AError = never,
  PError = never,
>(predicate: (value: A) => E.Effect<boolean, PError, GenericQueryCtx<DataModel>>) {
  return (
    q: QueryStream<DataModel, A, AError>,
  ): QueryStream<DataModel, A, SafeUnion<AError, PError>> => q.filterWith(predicate)
}

export function mapStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  B extends GenericStreamItem,
  AError = never,
  BError = never,
>(mapper: (value: A) => E.Effect<B | null, BError, GenericQueryCtx<DataModel>>) {
  return (
    q: QueryStream<DataModel, A, AError>,
  ): QueryStream<DataModel, B, SafeUnion<AError, BError>> => q.map(mapper)
}

export function flatMapStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  B extends GenericStreamItem,
  AError = never,
  BError = never,
>(
  mapper: (value: A) => E.Effect<QueryStream<DataModel, B>, BError, GenericQueryCtx<DataModel>>,
  mappedIndexFields: string[],
) {
  return (
    q: QueryStream<DataModel, A, AError>,
  ): QueryStream<DataModel, B, SafeUnion<AError, BError>> => q.flatMap(mapper, mappedIndexFields)
}

export function distinctStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(distinctIndexFields: string[]) {
  return (q: QueryStream<DataModel, A, SError>): QueryStream<DataModel, A, SError> =>
    q.distinct(distinctIndexFields)
}

export function orderStream<
  Schema extends SchemaDefinition<any, boolean>,
  TableName extends TableNamesInDataModel<DataModelFromSchemaDefinition<Schema>>,
>(order: "asc" | "desc") {
  return (
    q: StreamQueryInitializer<Schema, TableName>,
  ): QueryStream<
    DataModelFromSchemaDefinition<Schema>,
    DocumentByInfo<NamedTableInfo<DataModelFromSchemaDefinition<Schema>, TableName>>
  > => q.order(order)
}

export function paginateStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(paginationOpts: S.Schema.Type<typeof SPaginationOptions>) {
  return (q: QueryStream<DataModel, A, SError>): E.Effect<PaginationResult<A>, SError> =>
    q.paginate(S.decodeSync(SPaginationOptions)(paginationOpts))
}

export function collectStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(q: QueryStream<DataModel, A, SError>): E.Effect<A[], SError> {
  return q.collect()
}

export function takeFromStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(n: number) {
  return (q: QueryStream<DataModel, A, SError>): E.Effect<A[], SError> => q.take(n)
}

export function firstFromStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(q: QueryStream<DataModel, A, SError>): E.Effect<Option.Option<A>, SError> {
  return pipe(q.first(), E.map(Option.fromNullable))
}

export function uniqueFromStream<
  DataModel extends GenericDataModel,
  A extends GenericStreamItem,
  SError = never,
>(
  q: QueryStream<DataModel, A, SError>,
): E.Effect<Option.Option<A>, SafeUnion<DocNotUniqueError, SError>> {
  return pipe(q.unique(), E.map(Option.fromNullable))
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

export class QueryStream<
  DataModel extends GenericDataModel,
  T extends GenericStreamItem,
  SError = never,
> {
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

  filterWith<PError = never>(
    predicate: (doc: T) => E.Effect<boolean, PError, GenericQueryCtx<DataModel>>,
  ) {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.filterWith(async (doc) =>
        pipe(predicate(doc), E.provideService(this.QueryCtx, this.queryCtx), E.runPromise),
      ),
    )
  }

  map<U extends GenericStreamItem, MError = never>(
    mapper: (doc: T) => E.Effect<U | null, MError, GenericQueryCtx<DataModel>>,
  ): QueryStream<DataModel, U, SafeUnion<SError, MError>> {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.map(async (doc) =>
        pipe(mapper(doc), E.provideService(this.QueryCtx, this.queryCtx), E.runPromise),
      ),
    )
  }

  flatMap<U extends GenericStreamItem, MError = never>(
    mapper: (doc: T) => E.Effect<QueryStream<DataModel, U>, MError, GenericQueryCtx<DataModel>>,
    mappedIndexFields: string[],
  ): QueryStream<DataModel, U, SafeUnion<SError, MError>> {
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

  distinct(distinctIndexFields: string[]): QueryStream<DataModel, T, SError> {
    return new QueryStream(
      this.QueryCtx,
      this.queryCtx,
      this.convexStream.distinct(distinctIndexFields),
    )
  }

  paginate(
    paginationOpts: S.Schema.Type<typeof SPaginationOptions>,
  ): E.Effect<ConvexPaginationResult<T>, SError> {
    return E.promise(async () =>
      this.convexStream.paginate(S.decodeSync(SPaginationOptions)(paginationOpts)),
    ).pipe(
      E.catchAllDefect((defect) => {
        if (!Runtime.isFiberFailure(defect)) {
          return E.die(defect)
        }
        return E.failCause(defect[Runtime.FiberFailureCauseId])
      }),
    ) as E.Effect<ConvexPaginationResult<T>, SError>
  }

  collect(): E.Effect<T[], SError> {
    return E.promise(async () => this.convexStream.collect()).pipe(
      E.catchAllDefect((defect) => {
        if (!Runtime.isFiberFailure(defect)) {
          return E.die(defect)
        }
        return E.failCause(defect[Runtime.FiberFailureCauseId])
      }),
    ) as E.Effect<T[], SError>
  }

  take(n: number): E.Effect<T[], SError> {
    return E.promise(async () => this.convexStream.take(n)).pipe(
      E.catchAllDefect((defect) => {
        if (!Runtime.isFiberFailure(defect)) {
          return E.die(defect)
        }
        return E.failCause(defect[Runtime.FiberFailureCauseId])
      }),
    ) as E.Effect<T[], SError>
  }

  first(): E.Effect<T | null, SError> {
    return E.promise(async () => this.convexStream.first()).pipe(
      E.catchAllDefect((defect) => {
        if (!Runtime.isFiberFailure(defect)) {
          return E.die(defect)
        }
        return E.failCause(defect[Runtime.FiberFailureCauseId])
      }),
    ) as E.Effect<T | null, SError>
  }

  unique(): E.Effect<T | null, SafeUnion<DocNotUniqueError, SError>, never> {
    return this.take(2).pipe(
      E.flatMap((docs) => {
        if (docs.length > 1) {
          return E.fail(new DocNotUniqueError())
        }

        return E.succeed(docs[0] ?? null)
      }),
    ) as E.Effect<T | null, SafeUnion<DocNotUniqueError, SError>, never>
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
