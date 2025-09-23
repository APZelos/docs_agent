import {v} from "convex/values"
import {Effect as E, Option} from "effect"

import {DocNotFoundError} from "../../server"
import {mutation, MutationCtx} from "./concave"

export const simple = mutation({
  handler: E.fn(function* () {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: "Joe"})
    const user = yield* db.get(userId).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})

export const withArgs = mutation({
  args: {
    name: v.string(),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})
    const user = yield* db.get(userId).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})

export const withReturns = mutation({
  returns: {
    name: v.string(),
  },
  handler: E.fn(function* () {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: "Joe"})
    const user = yield* db.get(userId).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})

export const withArgsAndReturns = mutation({
  args: {
    name: v.string(),
  },
  returns: {
    name: v.string(),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})
    const user = yield* db.get(userId).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})
