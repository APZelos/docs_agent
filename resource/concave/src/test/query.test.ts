import type {EmptyObject} from "convex-helpers"
import type {FunctionReference} from "convex/server"
import type {Doc, Id} from "./convex/_generated/dataModel"

import {describe, expect, expectTypeOf, test} from "vitest"

import {api} from "./convex/_generated/api"
import {setup} from "./setup"

describe("query", () => {
  test("without any validator", async () => {
    const {t} = setup()
    await t.run(async ({db}) => db.insert("user", {name: "foo"}))
    const result = await t.query(api.query.simple)

    expectTypeOf(api.query.simple).toEqualTypeOf<
      FunctionReference<"query", "public", EmptyObject, Doc<"user">, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with args validator", async () => {
    const {t} = setup()
    const userId = await t.run(async ({db}) => db.insert("user", {name: "foo"}))
    const result = await t.query(api.query.withArgs, {id: userId})

    expectTypeOf(api.query.withArgs).toEqualTypeOf<
      FunctionReference<"query", "public", {id: Id<"user">}, Doc<"user">, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with returns validator", async () => {
    const {t} = setup()
    await t.run(async ({db}) => db.insert("user", {name: "foo"}))
    const result = await t.query(api.query.withReturns)

    expectTypeOf(api.query.withReturns).toEqualTypeOf<
      FunctionReference<"query", "public", EmptyObject, {name: string}, string | undefined>
    >()

    expect(result).not.toBeNull()
  })

  test("with args and returns validator", async () => {
    const {t} = setup()
    const userId = await t.run(async ({db}) => db.insert("user", {name: "foo"}))
    const result = await t.query(api.query.withArgsAndReturns, {id: userId})

    expectTypeOf(api.query.withArgsAndReturns).toEqualTypeOf<
      FunctionReference<"query", "public", {id: Id<"user">}, {name: string}, string | undefined>
    >()

    expect(result).not.toBeNull()
  })
})
