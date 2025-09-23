import type {EmptyObject} from "convex-helpers"
import type {FunctionReference} from "convex/server"
import type {Doc} from "./convex/_generated/dataModel"

import {describe, expect, expectTypeOf, test} from "vitest"

import {api} from "./convex/_generated/api"
import {setup} from "./setup"

describe("mutation", () => {
  test("without any validator", async () => {
    const {t} = setup()
    const result = await t.mutation(api.mutation.simple)

    expectTypeOf(api.mutation.simple).toEqualTypeOf<
      FunctionReference<"mutation", "public", EmptyObject, Doc<"user">, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with args validator", async () => {
    const {t} = setup()
    const result = await t.mutation(api.mutation.withArgs, {name: "Joe"})

    expectTypeOf(api.mutation.withArgs).toEqualTypeOf<
      FunctionReference<"mutation", "public", {name: string}, Doc<"user">, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with returns validator", async () => {
    const {t} = setup()
    const result = await t.mutation(api.mutation.withReturns)

    expectTypeOf(api.mutation.withReturns).toEqualTypeOf<
      FunctionReference<"mutation", "public", EmptyObject, {name: string}, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with args and returns validator", async () => {
    const {t} = setup()
    const result = await t.mutation(api.mutation.withArgsAndReturns, {name: "Joe"})

    expectTypeOf(api.mutation.withArgsAndReturns).toEqualTypeOf<
      FunctionReference<"mutation", "public", {name: string}, {name: string}, string | undefined>
    >()

    expect(result).not.toBeNull()
  })
})
