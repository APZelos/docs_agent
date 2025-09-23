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
   * @returns An Effect that yields an Option containing a {@link UserIdentity}
   * if the client was configured with a valid ID token. Returns Option.None
   * if no user is authenticated. On HTTP Actions, authentication failures
   * are handled through Effect's error channel.
   */
  getUserIdentity(): E.Effect<Option.Option<UserIdentity>, never, never> {
    return E.promise(async () => this.convexAuth.getUserIdentity()).pipe(E.map(Option.fromNullable))
  }
}
