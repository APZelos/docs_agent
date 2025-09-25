import type {UserIdentity} from "convex/server"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {Effect as E, Option} from "effect"

import {mockAuth} from "src/test/mock"

describe("Auth", () => {
  describe("getUserIdentity", () => {
    test("shoud have correct type signature", () => {
      const auth = mockAuth({getUserIdentity: vi.fn().mockResolvedValue(null)})
      const actual = auth.getUserIdentity()

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Option.Option<UserIdentity>, never, never>>()
    })

    it.effect("should return None when user is not authenticated", () =>
      E.gen(function* () {
        const auth = mockAuth({getUserIdentity: vi.fn().mockResolvedValue(null)})
        const actual = yield* auth.getUserIdentity()

        expectTypeOf<Option.Option<UserIdentity>>(actual)
        expect(actual).toEqual(Option.none())
      }),
    )

    it.effect("should return Some(UserIdentity) when user is authenticated", () =>
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

        const auth = mockAuth({getUserIdentity: vi.fn().mockResolvedValue(identity)})
        const actual = yield* auth.getUserIdentity()

        expectTypeOf<Option.Option<UserIdentity>>(actual)
        expect(actual).toEqual(Option.some(identity))
      }),
    )
  })
})
