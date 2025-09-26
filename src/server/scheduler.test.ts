import type {GenericId} from "convex/values"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {Effect as E} from "effect"

import {mockFunctionReference, mockGenericId, mockScheduler} from "src/test/mock"

describe("Scheduler", () => {
  describe("runAfter", () => {
    test("should have correct type signature", () => {
      const scheduler = mockScheduler()

      expectTypeOf(
        scheduler.runAfter(1000, mockFunctionReference<"action", "public">()),
      ).toEqualTypeOf<E.Effect<GenericId<"_scheduled_functions">, never, never>>()

      expectTypeOf(
        scheduler.runAfter(1000, mockFunctionReference<"mutation", "internal", {arg: string}>(), {
          arg: "some value",
        }),
      ).toEqualTypeOf<E.Effect<GenericId<"_scheduled_functions">, never, never>>()
    })

    it.effect("should return the scheduled function's ID", () =>
      E.gen(function* () {
        const id = mockGenericId("_scheduled_functions", "scheduled-function-id")
        const scheduler = mockScheduler({
          runAfter: vi.fn().mockResolvedValue(id),
        })
        const actual = yield* scheduler.runAfter(1000, mockFunctionReference<"action", "public">())

        expectTypeOf(actual).toEqualTypeOf<GenericId<"_scheduled_functions">>()
        expect(actual).toBe(id)
      }),
    )
  })

  describe("runAt", () => {
    test("should have correct type signature", () => {
      const scheduler = mockScheduler()

      expectTypeOf(
        scheduler.runAt(Date.now(), mockFunctionReference<"action", "public">()),
      ).toEqualTypeOf<E.Effect<GenericId<"_scheduled_functions">, never, never>>()

      expectTypeOf(
        scheduler.runAt(
          new Date(),
          mockFunctionReference<"mutation", "internal", {arg: string}>(),
          {
            arg: "some value",
          },
        ),
      ).toEqualTypeOf<E.Effect<GenericId<"_scheduled_functions">, never, never>>()
    })

    it.effect("should return the scheduled function's ID", () =>
      E.gen(function* () {
        const id = mockGenericId("_scheduled_functions", "scheduled-function-id")
        const scheduler = mockScheduler({
          runAt: vi.fn().mockResolvedValue(id),
        })
        const actual = yield* scheduler.runAt(
          Date.now(),
          mockFunctionReference<"action", "public">(),
        )

        expectTypeOf(actual).toEqualTypeOf<GenericId<"_scheduled_functions">>()
        expect(actual).toBe(id)
      }),
    )
  })

  describe("cancel", () => {
    test("should have correct type signature", () => {
      const scheduler = mockScheduler()
      const id = mockGenericId("_scheduled_functions", "scheduled-function-id")

      expectTypeOf(scheduler.cancel(id)).toEqualTypeOf<E.Effect<void, never, never>>()
    })

    it.effect("should complete successfully", () =>
      E.gen(function* () {
        const scheduler = mockScheduler({
          cancel: vi.fn().mockResolvedValue(undefined),
        })
        const id = mockGenericId("_scheduled_functions", "scheduled-function-id")
        const actual = yield* scheduler.cancel(id)

        expectTypeOf(actual).toEqualTypeOf<void>()
        expect(actual).toBeUndefined()
      }),
    )
  })
})
