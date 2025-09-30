import type {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
  WithoutSystemFields,
} from "convex/server"
import type {GenericId} from "convex/values"
import type {MutationCtxTag, QueryCtxTag} from "./context"

import {Effect as E, Option, pipe, Schema as S} from "effect"

import {OptionSuccedOrFail} from "src/lib/option"
import {DocNotFoundError} from "./error"

export const ConvexTableName = Symbol.for("ConvexTableName")

export interface CreateFunctionsArgs<DataModel extends GenericDataModel> {
  /** Context tag for query operations */
  QueryCtx: QueryCtxTag<DataModel>
  /** Context tag for mutation operations */
  MutationCtx: MutationCtxTag<DataModel>
}

export function createModelFunction<DataModel extends GenericDataModel>({
  QueryCtx,
  MutationCtx,
}: CreateFunctionsArgs<DataModel>) {
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

  type WithSystemFields<
    TableName extends TableNames,
    TableSchema extends S.Schema.AnyNoContext,
  > = S.extend<TableSchema, SystemFields<TableName>>

  function WithSystemFields<
    TableName extends TableNames,
    TableSchema extends S.Schema.AnyNoContext,
  >(tableName: TableName, schema: TableSchema): WithSystemFields<TableName, TableSchema> {
    return S.extend(schema, SystemFields(tableName))
  }

  function OptionalSystemFields<TableName extends TableNames>(tableName: TableName) {
    return S.Struct({
      _id: DocId(tableName),
      _creationTime: S.Number,
    }).pipe(S.partial)
  }

  type OptionalSystemFields<TableName extends TableNames> = ReturnType<
    typeof OptionalSystemFields<TableName>
  >

  type WithOptionalSystemFields<
    TableName extends TableNames,
    TableSchema extends S.Schema.AnyNoContext,
  > = S.extend<TableSchema, OptionalSystemFields<TableName>>

  function WithOptionalSystemFields<
    TableName extends TableNames,
    TableSchema extends S.Schema.AnyNoContext,
  >(tableName: TableName, schema: TableSchema): WithOptionalSystemFields<TableName, TableSchema> {
    return S.extend(schema, OptionalSystemFields(tableName))
  }

  function model<TableName extends TableNamesInDataModel<DataModel>, A>(
    tableName: TableName,
    schema: S.Schema<A, WithoutSystemFields<Doc<TableName>>>,
  ) {
    const DocumentWithoutSystemFields = schema.annotations({
      identifier: `${tableName}WithoutSystemFields`,
      title: `${tableName} without the system fields`,
      description:
        "A schema representing a Convex document without the Convex system fields (_id, _creationTime, etc.)",
    })

    type DocumentWithoutSystemFields = S.Schema.Type<typeof DocumentWithoutSystemFields>

    const DocumentWithOptionalSystemFields = WithOptionalSystemFields(
      tableName,
      DocumentWithoutSystemFields,
    ).annotations({
      identifier: `${tableName}WithOptionalSystemFields`,
      title: `${tableName} with optional the system fields`,
      description:
        "A schema representing a Convex document with optional the Convex system fields (_id, _creationTime, etc.)",
    })

    type DocumentWithOptionalSystemFields = S.Schema.Type<typeof DocumentWithOptionalSystemFields>

    const Document = WithSystemFields(tableName, DocumentWithoutSystemFields).annotations({
      identifier: `${tableName}Document`,
      title: `${tableName} document`,
      description: "A schema representing a Convex document",
    })

    type Document = S.Schema.Type<typeof Document>

    const PartialDocument = S.partial(Document).annotations({
      identifier: `${tableName}PartialDocument`,
      title: `${tableName} partial document`,
      description:
        "A schema representing a Convex document with optional fields. Mainly used as an argument for patch.",
    })

    type PartialDocument = S.Schema.Type<typeof PartialDocument>

    const getById = E.fn(function* (docId: GenericId<TableName>) {
      const {db} = yield* QueryCtx
      return yield* pipe(
        db.get(docId),
        E.flatMap(OptionSuccedOrFail(() => new DocNotFoundError())),
        E.map(S.decodeUnknownSync(Document)),
      )
    })

    const getByIdNullable = E.fn(function* (docId: GenericId<TableName>) {
      return yield* pipe(getById(docId), E.match({onFailure: () => null, onSuccess: (doc) => doc}))
    })

    const getByIdOption = E.fn(function* (docId: GenericId<TableName>) {
      const {db} = yield* QueryCtx
      return yield* pipe(db.get(docId), E.map(Option.map(S.decodeUnknownSync(Document))))
    })

    const insert = E.fn(function* (value: DocumentWithoutSystemFields) {
      const {db} = yield* MutationCtx
      return yield* db.insert(tableName, yield* S.encode(DocumentWithoutSystemFields)(value))
    })

    const insertAndGet = E.fn(function* (value: DocumentWithoutSystemFields) {
      const docId = yield* insert(value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error("Could not found inserted doc", {cause: error})),
      )
    })

    const patchById = E.fn(function* (docId: GenericId<TableName>, value: PartialDocument) {
      const {db} = yield* MutationCtx
      return yield* db.patch(docId, yield* S.encode(PartialDocument)(value))
    })

    const patchByIdAndGet = E.fn(function* (docId: GenericId<TableName>, value: PartialDocument) {
      yield* patchById(docId, value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error(`Could not found patched doc: ${docId}`, {cause: error})),
      )
    })

    const replaceById = E.fn(function* (
      docId: GenericId<TableName>,
      value: DocumentWithOptionalSystemFields,
    ) {
      const {db} = yield* MutationCtx
      return yield* db.replace(docId, yield* S.encode(DocumentWithOptionalSystemFields)(value))
    })

    const replaceByIdAndGet = E.fn(function* (
      docId: GenericId<TableName>,
      value: DocumentWithOptionalSystemFields,
    ) {
      yield* replaceById(docId, value)
      return yield* pipe(
        getById(docId),
        E.orDieWith((error) => new Error(`Could not found replaced doc: ${docId}`, {cause: error})),
      )
    })

    const deleteById = E.fn(function* (docId: GenericId<TableName>) {
      const {db} = yield* MutationCtx
      return yield* db.delete(docId)
    })

    return {
      Document,
      DocumentWithoutSystemFields,
      DocumentWithOptionalSystemFields,
      PartialDocument,
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
