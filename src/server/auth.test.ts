import type {UserIdentity} from "convex/server"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {Effect as E, Option} from "effect"

import {Auth} from "./auth"

describe("Auth", () => {
  describe("getUserIdentity", () => {
    test("shoud have correct type signature", () => {
      const convexAuth = {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      }

      const auth = new Auth(convexAuth)

      const effect = auth.getUserIdentity()

      expectTypeOf(effect).toEqualTypeOf<E.Effect<Option.Option<UserIdentity>, never, never>>()
    })

    it.effect("should return None when user is not authenticated", () =>
      E.gen(function* () {
        const convexAuth = {
          getUserIdentity: vi.fn().mockResolvedValue(null),
        }

        const auth = new Auth(convexAuth)
        const result = yield* auth.getUserIdentity()

        expectTypeOf<Option.Option<UserIdentity>>(result)
        expect(result).toEqual(Option.none())
      }),
    )

    it.effect("should return Some(userIdentity) when user is authenticated", () =>
      E.gen(function* () {
        const identity: UserIdentity = {
          tokenIdentifier: "test-token",
          subject: "user123",
          issuer: "https://test.issuer.com/",
          aud: "test-audience",
          name: "Test User",
          email: "test@example.com",
          emailVerified: true,
          nickname: "testuser",
          pictureUrl: "https://example.com/avatar.jpg",
          updatedAt: "2023-01-01T00:00:00.000Z",
          custom: {},
        }

        const convexAuth = {
          getUserIdentity: vi.fn().mockResolvedValue(identity),
        }

        const auth = new Auth(convexAuth)
        const result = yield* auth.getUserIdentity()

        expectTypeOf<Option.Option<UserIdentity>>(result)
        expect(result).toEqual(Option.some(identity))
      }),
    )
  })
})
