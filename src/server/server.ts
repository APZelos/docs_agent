import type {
  ArgsArrayForOptionalValidator,
  ArgsArrayToObject,
  GenericActionCtx as ConvexGenericActionCtx,
  GenericMutationCtx as ConvexGenericMutationCtx,
  GenericQueryCtx as ConvexGenericQueryCtx,
  DocumentByName,
  GenericDataModel,
  PublicHttpAction,
  RegisteredMutation,
  RegisteredQuery,
  ReturnValueForOptionalValidator,
  TableNamesInDataModel,
  WithoutSystemFields,
} from "convex/server"
import type {GenericId, PropertyValidators, Validator} from "convex/values"
import type {MutationCtxTag, QueryCtxTag} from "./context"

import {
  httpActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server"
import {Effect as E, Option, pipe, Schema as S} from "effect"

import {OptionSuccedOrFail} from "src/lib/option"
import {GenericActionCtx, GenericMutationCtx, GenericQueryCtx, HttpActionCtx} from "./context"
import {DocNotFoundError} from "./error"

export const ConvexTableName = Symbol.for("ConvexTableName")

/**
 * Configuration arguments for creating Effect-based Convex functions.
 *
 * This interface defines the Context tags required to create typed
 * Convex functions with Effect-based handlers.
 */
export interface CreateFunctionsArgs<DataModel extends GenericDataModel> {
  /** Context tag for query operations */
  QueryCtx: QueryCtxTag<DataModel>
  /** Context tag for mutation operations */
  MutationCtx: MutationCtxTag<DataModel>
}

/**
 * Create a set of Effect-based Convex function builders.
 *
 * This function returns an object containing query, mutation, and HTTP action
 * builders that work with Effect handlers instead of Promise-based handlers.
 *
 * @param args - Configuration containing the Context tags for dependency injection
 * @returns An object with Effect-based function builders: query, internalQuery,
 * mutation, internalMutation, and httpAction
 *
 * @example
 * ```typescript
 * const QueryCtx = createQueryCtx<DataModel>()
 * const MutationCtx = createMutationCtx<DataModel>()
 *
 * const {query, mutation} = createFunctions({QueryCtx, MutationCtx})
 *
 * export const getUser = query({
 *   args: {id: v.id("users")},
 *   handler: E.fn(function* (args) {
 *     const {db} = yield* QueryCtx
 *     return yield* db.get(args.id)
 *   })
 * })
 * ```
 */
export function createFunctions<DataModel extends GenericDataModel>({
  QueryCtx,
  MutationCtx,
}: CreateFunctionsArgs<DataModel>) {
  /**
   * Define a query in this Convex app's public API.
   *
   * This function will be allowed to read your Convex database and will be accessible from the client.
   * The handler returns an Effect that can be composed using functional combinators.
   *
   * @param func - The query function handler that returns an Effect. Access services through `yield* QueryCtx`.
   * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
   */
  function query<
    ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
    ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
    E = never,
  >({
    args,
    handler,
  }: {
    args?: ArgsValidator
    returns?: ReturnsValidator
    handler: (
      ...args: ArgsArrayForOptionalValidator<ArgsValidator>
    ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel>>
  }): RegisteredQuery<"public", ArgsArrayToObject<NoInfer<OneOrZeroArgs>>, Promise<ReturnValue>> {
    if (args) {
      return queryGeneric({
        args,
        handler: async (
          convexQueryCtx: ConvexGenericQueryCtx<DataModel>,
          ...handlerArgs: NoInfer<OneOrZeroArgs>
        ) => {
          const ctx = new GenericQueryCtx<DataModel>(convexQueryCtx)
          return pipe(handler(...handlerArgs), E.provideService(QueryCtx, ctx), E.runPromise)
        },
      })
    }

    return queryGeneric({
      handler: async (
        convexQueryCtx: ConvexGenericQueryCtx<DataModel>,
        ...handlerArgs: NoInfer<OneOrZeroArgs>
      ) => {
        const ctx = new GenericQueryCtx<DataModel>(convexQueryCtx)
        return pipe(handler(...handlerArgs), E.provideService(QueryCtx, ctx), E.runPromise)
      },
    })
  }

  /**
   * Define a query that is only accessible from other Convex functions (but not from the client).
   *
   * This function will be allowed to read from your Convex database. It will not be accessible from the client.
   * The handler returns an Effect that can be composed using functional combinators.
   *
   * @param func - The query function handler that returns an Effect. Access services through `yield* QueryCtx`.
   * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
   */
  function internalQuery<
    ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
    ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
    E = never,
  >({
    args,
    handler,
  }: {
    args?: ArgsValidator
    returns?: ReturnsValidator
    handler: (
      ...args: ArgsArrayForOptionalValidator<ArgsValidator>
    ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel>>
  }): RegisteredQuery<"internal", ArgsArrayToObject<NoInfer<OneOrZeroArgs>>, Promise<ReturnValue>> {
    if (args) {
      return internalQueryGeneric({
        args,
        handler: async (
          convexQueryCtx: ConvexGenericQueryCtx<DataModel>,
          ...handlerArgs: NoInfer<OneOrZeroArgs>
        ) => {
          const ctx = new GenericQueryCtx<DataModel>(convexQueryCtx)
          return pipe(handler(...handlerArgs), E.provideService(QueryCtx, ctx), E.runPromise)
        },
      })
    }

    return internalQueryGeneric({
      handler: async (
        convexQueryCtx: ConvexGenericQueryCtx<DataModel>,
        ...handlerArgs: NoInfer<OneOrZeroArgs>
      ) => {
        const ctx = new GenericQueryCtx<DataModel>(convexQueryCtx)
        return pipe(handler(...handlerArgs), E.provideService(QueryCtx, ctx), E.runPromise)
      },
    })
  }

  /**
   * Define a mutation in this Convex app's public API.
   *
   * This function will be allowed to modify your Convex database and will be accessible from the client.
   * The handler returns an Effect that can be composed using functional combinators.
   *
   * @param func - The mutation function handler that returns an Effect. Access services through `yield* MutationCtx`.
   * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
   */
  function mutation<
    ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
    ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
    E = never,
  >({
    args,
    handler,
  }: {
    args?: ArgsValidator
    returns?: ReturnsValidator
    handler: (
      ...args: ArgsArrayForOptionalValidator<ArgsValidator>
    ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>>
  }): RegisteredMutation<
    "public",
    ArgsArrayToObject<NoInfer<OneOrZeroArgs>>,
    Promise<ReturnValue>
  > {
    if (args) {
      return mutationGeneric({
        args,
        handler: async (
          convexMutationCtx: ConvexGenericMutationCtx<DataModel>,
          ...handlerArgs: NoInfer<OneOrZeroArgs>
        ) => {
          return pipe(
            handler(...handlerArgs),
            E.provideService(QueryCtx, new GenericQueryCtx(convexMutationCtx)),
            E.provideService(MutationCtx, new GenericMutationCtx(convexMutationCtx)),
            E.runPromise,
          )
        },
      })
    }

    return mutationGeneric({
      handler: async (
        convexMutationCtx: ConvexGenericMutationCtx<DataModel>,
        ...handlerArgs: NoInfer<OneOrZeroArgs>
      ) => {
        return pipe(
          handler(...handlerArgs),
          E.provideService(QueryCtx, new GenericQueryCtx(convexMutationCtx)),
          E.provideService(MutationCtx, new GenericMutationCtx(convexMutationCtx)),
          E.runPromise,
        )
      },
    })
  }

  /**
   * Define a mutation that is only accessible from other Convex functions (but not from the client).
   *
   * This function will be allowed to modify your Convex database. It will not be accessible from the client.
   * The handler returns an Effect that can be composed using functional combinators.
   *
   * @param func - The mutation function handler that returns an Effect. Access services through `yield* MutationCtx`.
   * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
   */
  function internalMutation<
    ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
    OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
    ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
    E = never,
  >({
    args,
    handler,
  }: {
    args?: ArgsValidator
    returns?: ReturnsValidator
    handler: (
      ...args: ArgsArrayForOptionalValidator<ArgsValidator>
    ) => E.Effect<ReturnValue, E, GenericMutationCtx<DataModel>>
  }): RegisteredMutation<
    "internal",
    ArgsArrayToObject<NoInfer<OneOrZeroArgs>>,
    Promise<ReturnValue>
  > {
    if (args) {
      return internalMutationGeneric({
        args,
        handler: async (
          convexMutationCtx: ConvexGenericMutationCtx<DataModel>,
          ...handlerArgs: NoInfer<OneOrZeroArgs>
        ) => {
          const ctx = new GenericMutationCtx<DataModel>(convexMutationCtx)
          return pipe(handler(...handlerArgs), E.provideService(MutationCtx, ctx), E.runPromise)
        },
      })
    }

    return internalMutationGeneric({
      handler: async (
        convexMutationCtx: ConvexGenericMutationCtx<DataModel>,
        ...handlerArgs: NoInfer<OneOrZeroArgs>
      ) => {
        const ctx = new GenericMutationCtx<DataModel>(convexMutationCtx)
        return pipe(handler(...handlerArgs), E.provideService(MutationCtx, ctx), E.runPromise)
      },
    })
  }

  // TODO: revisit actions when a solution circular dependency has been found

  // function action<
  //   ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  //   ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  //   OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
  //   ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  //   E = never,
  // >({
  //   args,
  //   handler,
  // }: {
  //   args?: ArgsValidator | undefined
  //   returns?: ReturnsValidator
  //   handler: (
  //     ...args: ArgsArrayForOptionalValidator<ArgsValidator>
  //   ) => E.Effect<ReturnValue, E, GenericActionCtx<DataModel>>
  // }) {
  //   if (args) {
  //     return actionGeneric({
  //       args,
  //       handler: async (
  //         convexActionCtx: ConvexGenericActionCtx<DataModel>,
  //         ...handlerArgs: NoInfer<OneOrZeroArgs>
  //       ) => {
  //         const ctx = new GenericActionCtx<DataModel>(convexActionCtx)
  //         return pipe(handler(...handlerArgs), E.provideService(ActionCtx, ctx), E.runPromise)
  //       },
  //     })
  //   }
  //
  //   return actionGeneric({
  //     handler: async (
  //       convexActionCtx: ConvexGenericActionCtx<DataModel>,
  //       ...handlerArgs: NoInfer<OneOrZeroArgs>
  //     ) => {
  //       const ctx = new GenericActionCtx<DataModel>(convexActionCtx)
  //       return pipe(handler(...handlerArgs), E.provideService(ActionCtx, ctx), E.runPromise)
  //     },
  //   })
  // }

  // function internalAction<
  //   ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  //   ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  //   OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
  //   ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  //   E = never,
  // >({
  //   args,
  //   handler,
  // }: {
  //   args?: ArgsValidator | undefined
  //   returns?: ReturnsValidator
  //   handler: (
  //     ...args: ArgsArrayForOptionalValidator<ArgsValidator>
  //   ) => E.Effect<ReturnValue, E, GenericActionCtx<DataModel>>
  // }) {
  //   if (args) {
  //     return internalActionGeneric({
  //       args,
  //       handler: async (
  //         convexActionCtx: ConvexGenericActionCtx<DataModel>,
  //         ...handlerArgs: NoInfer<OneOrZeroArgs>
  //       ) => {
  //         const ctx = new GenericActionCtx<DataModel>(convexActionCtx)
  //         return pipe(handler(...handlerArgs), E.provideService(ActionCtx, ctx), E.runPromise)
  //       },
  //     })
  //   }
  //
  //   return internalActionGeneric({
  //     handler: async (
  //       convexActionCtx: ConvexGenericActionCtx<DataModel>,
  //       ...handlerArgs: NoInfer<OneOrZeroArgs>
  //     ) => {
  //       const ctx = new GenericActionCtx<DataModel>(convexActionCtx)
  //       return pipe(handler(...handlerArgs), E.provideService(ActionCtx, ctx), E.runPromise)
  //     },
  //   })
  // }

  /**
   * Define an HTTP action.
   *
   * This function will be used to respond to HTTP requests received by a Convex
   * deployment if the requests matches the path and method where this action
   * is routed. Be sure to route your action in `convex/http.js`.
   *
   * The handler returns an Effect that can be composed using functional combinators.
   *
   * @param func - The function handler that returns an Effect<Response>. Access services through `yield* HttpActionCtx`.
   * @returns The wrapped function. Import this function from `convex/http.js` and route it to hook it up.
   */
  function httpAction<E = never>(
    func: (request: Request) => E.Effect<Response, E, GenericActionCtx<GenericDataModel>>,
  ): PublicHttpAction {
    return httpActionGeneric(
      async (convexActionCtx: ConvexGenericActionCtx<GenericDataModel>, request: Request) => {
        const ctx = new GenericActionCtx(convexActionCtx)
        return pipe(func(request), E.provideService(HttpActionCtx, ctx), E.runPromise)
      },
    )
  }

  type TableNames = TableNamesInDataModel<DataModel>
  // type TableInfo<TableName extends TableNames> = NamedTableInfo<DataModel, TableName>
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
      return yield* pipe(db.get(docId), E.map(Option.map(S.decodeUnknownSync(Document))))
    })

    const getByIdOrNull = E.fn(function* (docId: GenericId<TableName>) {
      return yield* pipe(getById(docId), E.map(Option.getOrNull))
    })

    const getByIdOrFail = E.fn(function* (docId: GenericId<TableName>) {
      return yield* pipe(
        getById(docId),
        E.flatMap(OptionSuccedOrFail(() => new DocNotFoundError())),
      )
    })

    const insert = E.fn(function* (value: DocumentWithoutSystemFields) {
      const {db} = yield* MutationCtx
      return yield* db.insert(tableName, yield* S.encode(DocumentWithoutSystemFields)(value))
    })

    const insertAndGet = E.fn(function* (value: DocumentWithoutSystemFields) {
      const docId = yield* insert(value)
      return yield* pipe(
        getByIdOrFail(docId),
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
        getByIdOrFail(docId),
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
        getByIdOrFail(docId),
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
      getByIdOrNull,
      getByIdOrFail,
      insert,
      insertAndGet,
      patchById,
      patchByIdAndGet,
      replaceById,
      replaceByIdAndGet,
      deleteById,
    }
  }

  return {query, internalQuery, mutation, internalMutation, httpAction, model}
}
