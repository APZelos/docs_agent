/**
 * **IsLiteral**
 *
 * A type-level utility that determines whether a given type `T`
 * is a **literal type** rather than a widened primitive (e.g., `string`, `number`).
 *
 * It distinguishes literal values such as `"foo"`, `42`, `true`, or `123n`
 * from their broader base types.
 *
 * ### How it works
 * - The first conditional (`[T] extends [never] ? never`) handles the edge case
 *   where `T` is `never`.
 * - The second conditional ensures the check only applies to **primitive**
 *   scalar types (`string | number | bigint | boolean`).
 * - It then compares whether the base primitives (`string`, `number`, `boolean`, `bigint`)
 *   are assignable to `T`. If so, `T` is **not** a literal.
 * - Otherwise, `T` is a **literal**, and the result is `true`.
 *
 * ### Examples
 * ```ts
 * IsLiteral<'hello'>;       // true
 * IsLiteral<string>;        // false
 * IsLiteral<42>;            // true
 * IsLiteral<number>;        // false
 * IsLiteral<true>;          // true
 * IsLiteral<boolean>;       // false
 * IsLiteral<123n>;          // true
 * IsLiteral<bigint>;        // false
 * IsLiteral<never>;         // never
 * ```
 *
 * @template T - The type to test.
 *
 * @returns `true` if `T` is a literal type,
 * `false` if it is a widened primitive type,
 * or `never` if `T` is `never`.
 */
export type IsLiteral<T> =
  [T] extends [never] ? never
  : [T] extends [string | number | bigint | boolean] ?
    [string] extends [T] ? false
    : [number] extends [T] ? false
    : [boolean] extends [T] ? false
    : [bigint] extends [T] ? false
    : true
  : false
