/**
 * **IsUnion**
 *
 * A type-level utility that determines whether a given type `T`
 * is a **union type**.
 *
 * ### How it works
 * - `T extends unknown ? ... : ...` distributes the conditional type over each member of a union.
 *   This triggers a separate evaluation for each member if `T` is a union.
 * - `U` stores the original `T` before distribution, allowing each branch to compare its own member
 *   against the full type `U`.
 * - If after distribution `[U] extends [T]` is **false**, that means multiple distinct members exist,
 *   so `T` is a union.
 * - Otherwise, it’s not a union.
 *
 * ### Examples
 * ```ts
 * IsUnion<string>;            // false
 * IsUnion<'a' | 'b'>;         // true
 * IsUnion<string | number>;   // true
 * IsUnion<never>;             // false
 * IsUnion<any>;               // false
 * IsUnion<unknown>;           // false
 * ```
 *
 * @template T - The type to check.
 * @template U - Internally used to preserve the original `T` for comparison.
 *
 * @returns `true` if `T` is a union type, otherwise `false`.
 */
export type IsUnion<T, U extends T = T> =
  [T] extends [boolean] ? false
  : T extends unknown ?
    [U] extends [T] ?
      false
    : true
  : never
