import type {
  DocNotUniqueError,
  GenericMutationCtx,
  GenericQueryCtx,
  MutationCtxTag,
  OrderedQuery,
  Query,
  QueryCtxTag,
  QueryInitializer,
} from "@server"
import type {
  DocumentByName,
  ExpressionOrValue,
  FilterBuilder,
  GenericDataModel,
  IndexNames,
  IndexRange,
  IndexRangeBuilder,
  NamedIndex,
  NamedSearchIndex,
  NamedTableInfo,
  PaginationOptions,
  SearchFilter,
  SearchFilterBuilder,
  SearchIndexNames,
  TableNamesInDataModel,
  WithOptionalSystemFields,
  WithoutSystemFields,
} from "convex/server"
import type {GenericId} from "convex/values"
import type {ParseResult} from "effect"

import {Effect as E, Option, pipe, Schema as S} from "effect"

import {DocNotFoundError} from "@server"
import {OptionSuccedOrFail} from "src/lib/option"

export const ConvexTableName = Symbol.for("ConvexTableName")

function PaginationResult<Schema extends S.Schema.Any>(schema: Schema) {
  return S.Struct({
    page: S.Array(schema),
    isDone: S.Boolean,
    continueCursor: S.String,
    splitCursor: S.optional(S.NullOr(S.String)),
    pageStatus: S.optional(
      S.NullOr(S.Union(S.Literal("SplitRecommended"), S.Literal("SplitRequired"))),
    ),
  })
}

export interface CreateModleFunctionArgs<DataModel extends GenericDataModel> {
  /** Context tag for query operations */
  QueryCtx: QueryCtxTag<DataModel>
  /** Context tag for mutation operations */
  MutationCtx: MutationCtxTag<DataModel>
}

export function createModelFunction<DataModel extends GenericDataModel>({
  QueryCtx,
  MutationCtx,
}: CreateModleFunctionArgs<DataModel>) {
  type TableNames = TableNamesInDataModel<DataModel>
  type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

  function DocId<TableName extends TableNames>(tableName: TableName) {
    return S.String.pipe(S.annotations({[ConvexTableName]: tableName})) as unknown as S.Schema<
      GenericId<TableName>
    >
  }

  function SystemFields<TableName extends TableNames>(tableName: TableName) {
    return S.Struct({
      _id: DocId(tableName),
      _creationTime: S.Number,
    })
  }

  type SystemFields<TableName extends TableNames> = ReturnType<typeof SystemFields<TableName>>

  function OptionalSystemFields<TableName extends TableNames>(tableName: TableName) {
    return S.Struct({
      _id: DocId(tableName),
      _creationTime: S.Number,
    }).pipe(S.partial)
  }

  type OptionalSystemFields<TableName extends TableNames> = ReturnType<
    typeof OptionalSystemFields<TableName>
  >

  function model<TableName extends TableNamesInDataModel<DataModel>, A>(
    tableName: TableName,
    schema: S.Schema<A, WithoutSystemFields<Doc<TableName>>>,
  ) {
    type TableInfo = NamedTableInfo<DataModel, TableName>

    const DocumentWithoutSystemFields = schema.annotations({
      identifier: `${tableName}WithoutSystemFields`,
      title: `${tableName} without the system fields`,
      description:
        "A schema representing a Convex document without the Convex system fields (_id, _creationTime, etc.)",
    })

    type DocumentWithoutSystemFields = S.Schema.Type<typeof DocumentWithoutSystemFields>

    const DocumentWithOptionalSystemFields = S.extend(
      schema,
      OptionalSystemFields(tableName),
    ).annotations({
      identifier: `${tableName}WithOptionalSystemFields`,
      title: `${tableName} with optional the system fields`,
      description:
        "A schema representing a Convex document with optional the Convex system fields (_id, _creationTime, etc.)",
    }) as any as S.Schema<
      A & {
        readonly _id?: GenericId<TableName> | undefined
        readonly _creationTime?: number | undefined
      },
      WithOptionalSystemFields<Doc<TableName>>
    >

    type DocumentWithOptionalSystemFields = S.Schema.Type<typeof DocumentWithOptionalSystemFields>

    const Document = S.extend(schema, SystemFields(tableName)).annotations({
      identifier: `${tableName}Document`,
      title: `${tableName} document`,
      description: "A schema representing a Convex document",
    }) as any as S.Schema<
      A & {readonly _id: GenericId<TableName>; readonly _creationTime: number},
      Doc<TableName>
    >

    type Document = S.Schema.Type<typeof Document>

    const PartialDocument = S.asSchema(S.partial(Document)).annotations({
      identifier: `${tableName}PartialDocument`,
      title: `${tableName} partial document`,
      description:
        "A schema representing a Convex document with optional fields. Mainly used as an argument for patch.",
    })

    type PartialDocument = S.Schema.Type<typeof PartialDocument>

    const DocumentPaginationResult = PaginationResult(Document)
    type DocumentPaginationResult = S.Schema.Type<typeof DocumentPaginationResult>

    const query = E.gen(function* () {
      const {db} = yield* QueryCtx
      return db.query(tableName)
    })

    function fullTableScan(q: QueryInitializer<TableInfo>): Query<TableInfo> {
      return q.fullTableScan()
    }

    function withIndex<IndexName extends IndexNames<TableInfo>>(
      indexName: IndexName,
      indexRange?: (
        q: IndexRangeBuilder<Doc<TableName>, NamedIndex<TableInfo, IndexName>>,
      ) => IndexRange,
    ) {
      return (q: QueryInitializer<TableInfo>): Query<TableInfo> =>
        q.withIndex(indexName, indexRange)
    }

    function withSearchIndex<IndexName extends SearchIndexNames<TableInfo>>(
      indexName: IndexName,
      searchFilter: (
        q: SearchFilterBuilder<Doc<TableName>, NamedSearchIndex<TableInfo, IndexName>>,
      ) => SearchFilter,
    ) {
      return (q: QueryInitializer<TableInfo>): OrderedQuery<TableInfo> =>
        q.withSearchIndex(indexName, searchFilter)
    }

    function filter(predicate: (q: FilterBuilder<TableInfo>) => ExpressionOrValue<boolean>) {
      return <Query extends OrderedQuery<TableInfo>>(q: Query): Query =>
        q.filter(predicate) as any as Query
    }

    function order(order: "asc" | "desc") {
      return (q: Query<TableInfo>): OrderedQuery<TableInfo> => q.order(order)
    }

    function paginate(paginationOpts: PaginationOptions) {
      return (q: OrderedQuery<TableInfo>): E.Effect<DocumentPaginationResult> =>
        pipe(q.paginate(paginationOpts), E.map(S.decodeSync(DocumentPaginationResult)))
    }

    function collect(q: OrderedQuery<TableInfo>): E.Effect<readonly Document[]> {
      return pipe(q.collect(), E.map(pipe(S.Array(Document), S.decodeSync)))
    }

    function take(n: number) {
      return (q: OrderedQuery<TableInfo>): E.Effect<readonly Document[]> =>
        pipe(q.take(n), E.map(pipe(S.Array(Document), S.decodeSync)))
    }

    function first(q: OrderedQuery<TableInfo>): E.Effect<Option.Option<Document>> {
      return pipe(q.first(), E.map(Option.map(S.decodeSync(Document))))
    }

    function unique(
      q: OrderedQuery<TableInfo>,
    ): E.Effect<Option.Option<Document>, DocNotUniqueError> {
      return pipe(q.unique(), E.map(Option.map(S.decodeSync(Document))))
    }

    const getById: (
      docId: GenericId<TableName>,
    ) => E.Effect<Document, DocNotFoundError, GenericQueryCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
    ) {
      const {db} = yield* QueryCtx
      return yield* pipe(
        db.get(docId),
        E.flatMap(OptionSuccedOrFail(() => new DocNotFoundError())),
        E.map(S.decodeSync(Document)),
      )
    })

    const getByIdNullable: (
      docId: GenericId<TableName>,
    ) => E.Effect<Document | null, never, GenericQueryCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
    ) {
      return yield* pipe(getById(docId), E.match({onFailure: () => null, onSuccess: (doc) => doc}))
    })

    const getByIdOption: (
      docId: GenericId<TableName>,
    ) => E.Effect<Option.Option<Document>, never, GenericQueryCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
    ) {
      const {db} = yield* QueryCtx
      return yield* pipe(db.get(docId), E.map(Option.map(S.decodeUnknownSync(Document))))
    })

    const insert: (
      value: DocumentWithoutSystemFields,
    ) => E.Effect<GenericId<TableName>, ParseResult.ParseError, GenericMutationCtx<DataModel>> =
      E.fn(function* (value: DocumentWithoutSystemFields) {
        const {db} = yield* MutationCtx
        return yield* db.insert(tableName, yield* S.encode(DocumentWithoutSystemFields)(value))
      })

    const insertAndGet: (
      value: DocumentWithoutSystemFields,
    ) => E.Effect<
      Document,
      ParseResult.ParseError,
      GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>
    > = E.fn(function* (value: DocumentWithoutSystemFields) {
      const docId = yield* insert(value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error("Could not found inserted doc", {cause: error})),
      )
    })

    const patchById: (
      docId: GenericId<TableName>,
      value: PartialDocument,
    ) => E.Effect<void, ParseResult.ParseError, GenericMutationCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
      value: PartialDocument,
    ) {
      const {db} = yield* MutationCtx
      return yield* db.patch(docId, yield* S.encode(PartialDocument)(value))
    })

    const patchByIdAndGet: (
      docId: GenericId<TableName>,
      value: PartialDocument,
    ) => E.Effect<
      Document,
      ParseResult.ParseError,
      GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>
    > = E.fn(function* (docId: GenericId<TableName>, value: PartialDocument) {
      yield* patchById(docId, value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error(`Could not found patched doc: ${docId}`, {cause: error})),
      )
    })

    const replaceById: (
      docId: GenericId<TableName>,
      value: DocumentWithOptionalSystemFields,
    ) => E.Effect<void, ParseResult.ParseError, GenericMutationCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
      value: DocumentWithOptionalSystemFields,
    ) {
      const {db} = yield* MutationCtx
      return yield* db.replace(docId, yield* S.encode(DocumentWithOptionalSystemFields)(value))
    })

    const replaceByIdAndGet: (
      docId: GenericId<TableName>,
      value: DocumentWithOptionalSystemFields,
    ) => E.Effect<
      Document,
      ParseResult.ParseError,
      GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>
    > = E.fn(function* (docId: GenericId<TableName>, value: DocumentWithOptionalSystemFields) {
      yield* replaceById(docId, value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error(`Could not found replaced doc: ${docId}`, {cause: error})),
      )
    })

    const deleteById: (
      docId: GenericId<TableName>,
    ) => E.Effect<void, ParseResult.ParseError, GenericMutationCtx<DataModel>> = E.fn(function* (
      docId: GenericId<TableName>,
    ) {
      const {db} = yield* MutationCtx
      return yield* db.delete(docId)
    })

    return {
      Document,
      DocumentWithoutSystemFields,
      DocumentWithOptionalSystemFields,
      PartialDocument,
      query,
      fullTableScan,
      withIndex,
      withSearchIndex,
      filter,
      order,
      paginate,
      collect,
      take,
      first,
      unique,
      getById,
      getByIdNullable,
      getByIdOption,
      insert,
      insertAndGet,
      patchById,
      patchByIdAndGet,
      replaceById,
      replaceByIdAndGet,
      deleteById,
    }
  }

  return {model}
}
