import {httpRouter} from "convex/server"
import {Effect as E} from "effect"

import {HttpActionCtx} from "../../server"
import {internal} from "./_generated/api"
import {httpAction} from "./concave"

const http = httpRouter()

http.route({
  path: "/",
  method: "POST",
  handler: httpAction(
    E.fn(function* () {
      const ctx = yield* HttpActionCtx
      const userId = yield* ctx.runMutation(internal.user.createUser, {name: "Joe"})
      const user = yield* ctx.runQuery(internal.user.getUserById, {userId})

      return new Response(JSON.stringify(user), {status: 200})
    }),
  ),
})

export default http
