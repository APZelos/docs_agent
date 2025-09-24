import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import {Effect as E, Option} from "effect"

import {mockConvexGenericDatabaseReader, mockGenericId} from "src/test/mock"
import {GenericDatabaseReader} from "./database"

describe("GenericDatabaseReader", () => {
  const schema = defineSchema({
    user: defineTable({
      name: v.string(),
    }),
  })

  type DataModel = DataModelFromSchemaDefinition<typeof schema>
  type TableNames = TableNamesInDataModel<DataModel>
  type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

  describe("get", () => {
    test("shoud have correct type signature", () => {
      const convexDb = mockConvexGenericDatabaseReader(schema)

      const db = new GenericDatabaseReader(convexDb)
      const effect = db.get(mockGenericId("user", "user-id"))

      expectTypeOf(effect).toEqualTypeOf<E.Effect<Option.Option<Doc<"user">>, never, never>>()
    })

    it.effect("should return None when there is no doc for the provided id", () =>
      E.gen(function* () {
        const convexDb = mockConvexGenericDatabaseReader(schema)
        convexDb.get = vi.fn().mockResolvedValue(null)

        const db = new GenericDatabaseReader(convexDb)
        const result = yield* db.get(mockGenericId("user", "non-existing-user-id"))

        expectTypeOf(result).toEqualTypeOf<Option.Option<Doc<"user">>>()
        expect(result).toEqual(Option.none())
      }),
    )

    it.effect("should return Some(doc) when there is a doc for the provided id", () =>
      E.gen(function* () {
        const doc: Doc<"user"> = {
          _id: mockGenericId("user", "user-id"),
          _creationTime: Date.now(),
          name: "Joe",
        }

        const convexDb = mockConvexGenericDatabaseReader(schema)
        convexDb.get = vi.fn().mockResolvedValue(doc)

        const db = new GenericDatabaseReader(convexDb)
        const result = yield* db.get(doc._id)

        expectTypeOf(result).toEqualTypeOf<Option.Option<Doc<"user">>>()
        expect(result).toEqual(Option.some(doc))
      }),
    )
  })
})
