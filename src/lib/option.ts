import {Effect as E, Option, pipe} from "effect"

export function OptionSuccedOrFail<E>(onFail: () => E) {
  function match<A>(option: Option.Option<A>) {
    return pipe(
      option,
      Option.match({
        onSome: (value) => E.succeed(value),
        onNone: () => E.fail(onFail()),
      }),
    )
  }

  return match
}
