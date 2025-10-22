import {describe, expect, expectTypeOf, test} from "@effect/vitest"
import {v} from "convex/values"
import {ParseResult, Schema as S} from "effect"

import {mapSchemaToValidator, SDocId} from "./values"

describe("mapSchemaToValidator", () => {
  test("Schema.Any", () => {
    const actual = mapSchemaToValidator(S.Any)
    const expected = v.any()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("SDocId", () => {
    const actual = mapSchemaToValidator(SDocId("user"))
    const expected = v.id("user")

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Literal", () => {
    const actual = mapSchemaToValidator(S.Literal(1))
    const expected = v.literal(1)

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Number", () => {
    const actual = mapSchemaToValidator(S.Number)
    const expected = v.number()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.BigIntFromSelf", () => {
    const actual = mapSchemaToValidator(S.BigIntFromSelf)
    const expected = v.int64()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Boolean", () => {
    const actual = mapSchemaToValidator(S.Boolean)
    const expected = v.boolean()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.String", () => {
    const actual = mapSchemaToValidator(S.String)
    const expected = v.string()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.NumberFromString", () => {
    const actual = mapSchemaToValidator(S.NumberFromString)
    const expected = v.string()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.NonEmptyString", () => {
    const actual = mapSchemaToValidator(S.NonEmptyString)
    const expected = v.string()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.DateFromString", () => {
    const actual = mapSchemaToValidator(S.DateFromString)
    const expected = v.string()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.BooleanFromString", () => {
    const actual = mapSchemaToValidator(S.BooleanFromString)
    const expected = v.union(v.literal("true"), v.literal("false"))

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Null", () => {
    const actual = mapSchemaToValidator(S.Null)
    const expected = v.null()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Union", () => {
    const actual = mapSchemaToValidator(S.Union(S.String, S.Number))
    const expected = v.union(v.string(), v.number())

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Array", () => {
    const actual = mapSchemaToValidator(S.Array(S.String))
    const expected = v.array(v.string())

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Tuple", () => {
    const actual = mapSchemaToValidator(S.Tuple(S.String, S.Number))
    const expected = v.array(v.union(v.string(), v.number()))

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Record", () => {
    const actual = mapSchemaToValidator(
      S.Record({
        key: S.String,
        value: S.Number,
      }),
    )

    const expected = v.record(v.string(), v.number())

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })
  test("Schema.Struct", () => {
    const actual = mapSchemaToValidator(
      S.Struct({
        id: S.optional(S.Number),
        name: S.NonEmptyString,
        kind: S.optional(S.Literal("guest", "customer")),
      }),
    )

    const expected = v.object({
      id: v.optional(v.number()),
      name: v.string(),
      kind: v.optional(v.union(v.literal("guest"), v.literal("customer"))),
    })

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.Class", () => {
    class User extends S.Class<User>("User")({
      id: S.optional(SDocId("user")),
      name: S.NonEmptyString,
      kind: S.optional(S.Literal("guest", "customer")),
    }) {}

    const actual = mapSchemaToValidator(User)

    const expected = v.object({
      id: v.optional(v.id("user")),
      name: v.string(),
      kind: v.optional(v.union(v.literal("guest"), v.literal("customer"))),
    })

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.transform", () => {
    const actual = mapSchemaToValidator(
      S.transform(S.Number, S.String, {
        strict: true,
        decode: (value) => `${value}`,
        encode: () => 1,
      }),
    )

    const expected = v.number()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })

  test("Schema.transformOrFail", () => {
    const actual = mapSchemaToValidator(
      S.transformOrFail(S.Number, S.String, {
        strict: true,
        decode: (value) => ParseResult.succeed(`${value}`),
        encode: () => ParseResult.succeed(1),
      }),
    )

    const expected = v.number()

    expectTypeOf(actual).toEqualTypeOf(expected)
    expect(actual).toStrictEqual(expected)
  })
})
