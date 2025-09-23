import type {Auth as ConvexAuth, UserIdentity} from "convex/server"

import {Effect as E, Option} from "effect"

/**
 * An interface to access information about the currently authenticated user
 * within Convex query and mutation functions.
 */
export class Auth {
  convexAuth: ConvexAuth

  constructor(convexAuth: ConvexAuth) {
    this.convexAuth = convexAuth
  }

  /**
   * Get details about the currently authenticated user.
   *
   * @returns A promise that resolves to a {@link UserIdentity} if the Convex
   * client was configured with a valid ID token, or if not, will:
   * + returns `null` on Convex queries, mutations, actions.
   * + `throw` on HTTP Actions.
   */
  getUserIdentity(): E.Effect<Option.Option<UserIdentity>, never, never> {
    return E.promise(async () => this.convexAuth.getUserIdentity()).pipe(E.map(Option.fromNullable))
  }
}
