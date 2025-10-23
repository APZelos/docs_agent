import {Effect as E, Schema as S} from "effect"

import {DocNotFoundError} from "src/server"
import {SDocId} from "src/server/values"
import {internalMutation, internalQuery, MutationCtx, QueryCtx} from "./concave"

export const createUser = internalMutation({
  args: {name: S.String},
  handler: E.fn(function* (args) {
    const {db} = yield* MutationCtx
    const userId = yield* db.insert("user", {name: args.name})

    return userId
  }),
})

export const getUserById = internalQuery({
  args: {
    userId: SDocId("user"),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.userId)

    if (!user) {
      return yield* E.fail(new DocNotFoundError())
    }

    return user
  }),
})
