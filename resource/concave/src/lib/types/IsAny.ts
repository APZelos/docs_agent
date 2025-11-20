/**
 * **IsAny**
 *
 * A type-level utility that determines whether a given type `T` is `any`.
 *
 * This uses a intersection check (`1 & T`) to exploit how the `any`
 * type behaves in TypeScript’s type system. If `T` is `any`, then
 * `1 & T` collapses to `any`, making `0 extends (1 & T)` evaluate to `true`.
 * Otherwise, it evaluates to `false`.
 *
 * @example
 * IsAny<any>;       // true
 * IsAny<string>;    // false
 * IsAny<unknown>;   // false
 * IsAny<never>;     // false
 *
 * @template T - The type to test.
 *
 * @returns `true` if `T` is `any`, otherwise `false`.
 */
export type IsAny<T> = 0 extends 1 & T ? true : false
