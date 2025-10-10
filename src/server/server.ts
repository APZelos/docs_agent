import type {
  ArgsArrayForOptionalValidator,
  ArgsArrayToObject,
  GenericActionCtx as ConvexGenericActionCtx,
  GenericMutationCtx as ConvexGenericMutationCtx,
  GenericQueryCtx as ConvexGenericQueryCtx,
  GenericDataModel,
  PublicHttpAction,
  RegisteredMutation,
  RegisteredQuery,
  ReturnValueForOptionalValidator,
} from "convex/server"
import type {PropertyValidators, Validator} from "convex/values"
import type {MutationCtxTag, QueryCtxTag} from "./context"

import {
  httpActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server"
import {Effect as E, pipe} from "effect"

import {GenericActionCtx, GenericMutationCtx, GenericQueryCtx, HttpActionCtx} from "./context"

/**
 * Configuration arguments for creating Effect-based Convex functions.
 *
 * This interface defines the Context tags required to create typed
 * Convex functions with Effect-based handlers.
 */
export interface CreateServerFunctionsArgs<DataModel extends GenericDataModel> {
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
export function createServerFunctions<DataModel extends GenericDataModel>({
  QueryCtx,
  MutationCtx,
}: CreateServerFunctionsArgs<DataModel>) {
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

  return {query, internalQuery, mutation, internalMutation, httpAction}
}
