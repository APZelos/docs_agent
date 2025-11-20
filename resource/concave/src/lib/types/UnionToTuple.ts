/**
 * **UnionToIntersection**
 *
 * Converts a union type `U` into an intersection type.
 *
 * It does this by mapping each union member `U` to a function parameter
 * `(arg: U) => void`, then inferring the intersection of all such argument
 * types from the conditional type.
 *
 * @example
 * ```ts
 * type A = UnionToIntersection<{ a: 1 } | { b: 2 }>;
 * // { a: 1 } & { b: 2 }
 * ```
 */
type UnionToIntersection<U> =
  (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never

/**
 * **LastOf**
 *
 * Extracts the *last* member type from a union `U`.
 *
 * Internally, it:
 * 1. Converts the union into an intersection of functions `(x: U) => void`.
 * 2. Then infers the type of the intersection's argument — which corresponds
 *    to the **last** member due to TypeScript’s function parameter
 *    contravariance behavior.
 *
 * @example
 * ```ts
 * type A = LastOf<'a' | 'b' | 'c'>; // 'c'
 * ```
 */
type LastOf<U> =
  UnionToIntersection<U extends any ? (x: U) => void : never> extends (x: infer L) => void ? L
  : never

/**
 * **UnionToTuple**
 *
 * Recursively converts a union type `U` into a tuple type.
 *
 * It works by:
 * 1. Using `LastOf<U>` to extract the last element of the union.
 * 2. Recursively excluding that element (`Exclude<U, Last>`) and
 *    building the tuple in order.
 *
 * @example
 * ```ts
 * type A = UnionToTuple<'a' | 'b' | 'c'>;
 * // ['a', 'b', 'c'] (order is not guaranteed but stable within a compiler run)
 * ```
 *
 * ⚠️ **Note:**
 * The resulting tuple’s order is *not strictly defined* since TypeScript’s
 * unions are unordered. However, TypeScript preserves a consistent order
 * for a given compilation.
 *
 * @template U - The union to convert.
 * @template Last - The current last item extracted from the union.
 *
 * @returns A tuple type containing all union members.
 */
export type UnionToTuple<U, Last = LastOf<U>> =
  [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last]
