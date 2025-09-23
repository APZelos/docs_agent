import {v} from "convex/values"
import {Effect as E, Option} from "effect"

import {DocNotFoundError} from "src/server"
import {internalMutation, internalQuery, MutationCtx, QueryCtx} from "./concave"

export const createUser = internalMutation({
  args: {name: v.string()},
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})

    return userId
  }),
})

export const getUserById = internalQuery({
  args: {
    userId: v.id("user"),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.userId).pipe(E.map(Option.getOrNull))

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})
