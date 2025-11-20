export type SafeUnion<A, B> =
  [A] extends [never] ? B
  : [B] extends [never] ? A
  : A | B
