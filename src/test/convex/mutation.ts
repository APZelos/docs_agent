import {Effect as E, Schema as S} from "effect"

import {DocNotFoundError} from "../../server"
import {mutation, MutationCtx} from "./concave"

export const simple = mutation(
  E.fn(function* () {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: "Joe"})
    const user = yield* db.get(userId)

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
)

export const withArgs = mutation({
  args: {
    name: S.String,
  },
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})
    const user = yield* db.get(userId)

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})

export const withReturns = mutation({
  returns: S.Struct({
    name: S.String,
  }),
  handler: E.fn(function* () {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: "Joe"})
    const user = yield* db.get(userId)

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})

export const withArgsAndReturns = mutation({
  args: {
    name: S.String,
  },
  returns: S.Struct({
    name: S.String,
  }),
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})
    const user = yield* db.get(userId)

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return {name: user.name}
  }),
})
