import {Effect as E, Schema as S} from "effect"

import {DocNotFoundError} from "../../server"
import {SDocId} from "../../server/values"
import {query, QueryCtx} from "./concave"

export const simple = query(
  E.fn(function* () {
    const {db} = yield* QueryCtx
    const user = yield* db.query("user").first()

    if (!user) {
      return yield* new DocNotFoundError({tableName: "user"})
    }

    return user
  }),
)

export const withArgs = query({
  args: {
    id: SDocId("user"),
  },
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.id)

    if (!user) {
      return yield* new DocNotFoundError({tableName: "user"})
    }

    return user
  }),
})

export const withReturns = query({
  returns: S.Struct({
    name: S.String,
  }),
  handler: E.fn(function* () {
    const {db} = yield* QueryCtx
    const user = yield* db.query("user").first()

    if (!user) {
      return yield* new DocNotFoundError({tableName: "user"})
    }

    return {name: user.name}
  }),
})

export const withArgsAndReturns = query({
  args: {
    id: SDocId("user"),
  },
  returns: S.Struct({
    name: S.String,
  }),
  handler: E.fn(function* (args) {
    const {db} = yield* QueryCtx
    const user = yield* db.get(args.id)

    if (!user) {
      return yield* new DocNotFoundError({tableName: "user"})
    }

    return {name: user.name}
  }),
})
