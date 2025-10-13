import type {
  ArgsArrayForOptionalValidator,
  ArgsArrayToObject,
  GenericActionCtx as ConvexGenericActionCtx,
  GenericMutationCtx as ConvexGenericMutationCtx,
  GenericQueryCtx as ConvexGenericQueryCtx,
  FunctionVisibility,
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
  const query: EffectQueryBuilder<DataModel, "public"> = (fn: any) => {
    const {args, handler = fn, returns} = fn
    return queryGeneric({
      args,
      returns,
      handler: async (convexQueryCtx: ConvexGenericQueryCtx<DataModel>, ...handlerArgs) =>
        E.runPromise(
          pipe(
            handler(...handlerArgs),
            E.provideService(QueryCtx, new GenericQueryCtx<DataModel>(convexQueryCtx)),
          ) as E.Effect<unknown, unknown, never>,
        ),
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
  const internalQuery: EffectQueryBuilder<DataModel, "internal"> = (fn: any) => {
    const {args, handler = fn, returns} = fn
    return internalQueryGeneric({
      args,
      returns,
      handler: async (convexQueryCtx: ConvexGenericQueryCtx<DataModel>, ...handlerArgs) =>
        E.runPromise(
          pipe(
            handler(...handlerArgs),
            E.provideService(QueryCtx, new GenericQueryCtx<DataModel>(convexQueryCtx)),
          ) as E.Effect<unknown, unknown, never>,
        ),
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
  const mutation: EffectMutationBuilder<DataModel, "public"> = (fn: any) => {
    const {args, handler = fn, returns} = fn
    return mutationGeneric({
      args,
      returns,
      handler: async (convexMutationCtx: ConvexGenericMutationCtx<DataModel>, ...handlerArgs) =>
        E.runPromise(
          pipe(
            handler(...handlerArgs),
            E.provideService(QueryCtx, new GenericQueryCtx<DataModel>(convexMutationCtx)),
            E.provideService(MutationCtx, new GenericMutationCtx<DataModel>(convexMutationCtx)),
          ) as E.Effect<unknown, unknown, never>,
        ),
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
  const internalMutation: EffectMutationBuilder<DataModel, "internal"> = (fn: any) => {
    const {args, handler = fn, returns} = fn
    return internalMutationGeneric({
      args,
      returns,
      handler: async (convexMutationCtx: ConvexGenericMutationCtx<DataModel>, ...handlerArgs) =>
        E.runPromise(
          pipe(
            handler(...handlerArgs),
            E.provideService(QueryCtx, new GenericQueryCtx<DataModel>(convexMutationCtx)),
            E.provideService(MutationCtx, new GenericMutationCtx<DataModel>(convexMutationCtx)),
          ) as E.Effect<unknown, unknown, never>,
        ),
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

export type EffectQueryBuilder<
  DataModel extends GenericDataModel,
  Visibility extends FunctionVisibility,
> = <
  ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
  ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  E = never,
>(
  query:
    | {
        /**
         * Argument validation.
         *
         * Examples:
         *
         * ```
         * args: {}
         * args: { input: v.optional(v.number()) }
         * args: { message: v.string(), author: v.id("authors") }
         * args: { messages: v.array(v.string()) }
         * ```
         */
        args?: ArgsValidator
        /**
         * The return value validator.
         *
         * Examples:
         *
         * ```
         * returns: v.null()
         * returns: v.string()
         * returns: { message: v.string(), author: v.id("authors") }
         * returns: v.array(v.string())
         * ```
         */
        returns?: ReturnsValidator
        /**
         * The implementation of this function.
         *
         * This is a function that takes in the appropriate context and arguments
         * and produces some result.
         *
         * @param args - The arguments object for this function. This will match
         * the type defined by the argument validator if provided.
         * @returns
         */
        handler: (
          ...args: ArgsArrayForOptionalValidator<ArgsValidator>
        ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel>>
      }
    /**
     * The implementation of this function.
     *
     * This is a function that takes in the appropriate context and arguments
     * and produces some result.
     *
     * @param args - The arguments object for this function. This will match
     * the type defined by the argument validator if provided.
     * @returns
     */
    | ((...args: OneOrZeroArgs) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel>>),
) => RegisteredQuery<Visibility, ArgsArrayToObject<NoInfer<OneOrZeroArgs>>, Promise<ReturnValue>>

export type EffectMutationBuilder<
  DataModel extends GenericDataModel,
  Visibility extends FunctionVisibility,
> = <
  ArgsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  ReturnsValidator extends PropertyValidators | Validator<any, "required", any> | void,
  OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator>,
  ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  E = never,
>(
  mutation:
    | {
        /**
         * Argument validation.
         *
         * Examples:
         *
         * ```
         * args: {}
         * args: { input: v.optional(v.number()) }
         * args: { message: v.string(), author: v.id("authors") }
         * args: { messages: v.array(v.string()) }
         * ```
         */
        args?: ArgsValidator
        /**
         * The return value validator.
         *
         * Examples:
         *
         * ```
         * returns: v.null()
         * returns: v.string()
         * returns: { message: v.string(), author: v.id("authors") }
         * returns: v.array(v.string())
         * ```
         */
        returns?: ReturnsValidator
        /**
         * The implementation of this function.
         *
         * This is a function that takes in the appropriate context and arguments
         * and produces some result.
         *
         * @param args - The arguments object for this function. This will match
         * the type defined by the argument validator if provided.
         * @returns
         */
        handler: (
          ...args: ArgsArrayForOptionalValidator<ArgsValidator>
        ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>>
      }
    /**
     * The implementation of this function.
     *
     * This is a function that takes in the appropriate context and arguments
     * and produces some result.
     *
     * @param args - The arguments object for this function. This will match
     * the type defined by the argument validator if provided.
     * @returns
     */
    | ((
        ...args: OneOrZeroArgs
      ) => E.Effect<ReturnValue, E, GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>>),
) => RegisteredMutation<Visibility, ArgsArrayToObject<NoInfer<OneOrZeroArgs>>, Promise<ReturnValue>>
