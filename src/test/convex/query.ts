import {v} from "convex/values"
import {Effect as E, Option} from "effect"

import {DocNotFoundError} from "../../server"
import {query, QueryCtx} from "./concave"

export const simple = query({
  handler: E.fn(function* () {
    const {db} = yield* QueryCtx
    const user = yield* db.query("user").first().pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})

export const withArgs = query({
  args: {
    id: v.id("user"),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.id).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})

export const withReturns = query({
  returns: {
    name: v.string(),
  },
  handler: E.fn(function* () {
    const {db} = yield* QueryCtx
    const user = yield* db.query("user").first().pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})

export const withArgsAndReturns = query({
  args: {
    id: v.id("user"),
  },
  returns: {
    name: v.string(),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.id).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})
