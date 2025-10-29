import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  NamedTableInfo,
  SystemTableNames,
  TableNamesInDataModel,
} from "convex/server"
import type {GenericId} from "convex/values"
import type {QueryInitializer} from "./query"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import {Effect as E, Option} from "effect"

import {
  mockGenericDatabaseReader,
  mockGenericDatabaseWriter,
  mockGenericId,
  mockQueryInitializer,
} from "src/test/mock"
import {DocInvalidId} from "./error"

const _schema = defineSchema({
  user: defineTable({
    name: v.string(),
  }),
})

type DataModel = DataModelFromSchemaDefinition<typeof _schema>
type TableNames = TableNamesInDataModel<DataModel>
type TableInfo<TableName extends TableNames> = NamedTableInfo<DataModel, TableName>
type Id<TableName extends TableNames | SystemTableNames> = GenericId<TableName>
type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

describe("GenericDatabaseReader", () => {
  describe("get", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseReader<DataModel>()
      const actual = db.get(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, never, never>>()
    })

    it.effect("should return None when there is no doc for the provided id", () =>
      E.gen(function* () {
        const db = mockGenericDatabaseReader<DataModel>({get: vi.fn().mockResolvedValue(null)})
        const actual = yield* db.get(mockGenericId("user", "non-existing-user-id"))

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(null)
      }),
    )

    it.effect("should return Some(Doc) when there is a doc for the provided id", () =>
      E.gen(function* () {
        const doc: Doc<"user"> = {
          _id: mockGenericId("user", "user-id"),
          _creationTime: Date.now(),
          name: "Joe",
        }

        const db = mockGenericDatabaseReader<DataModel>({get: vi.fn().mockResolvedValue(doc)})
        const actual = yield* db.get(doc._id)

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(doc)
      }),
    )
  })

  describe("query", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseReader<DataModel>({
        query: vi.fn().mockReturnValue(mockQueryInitializer<TableInfo<"user">>()),
      })
      const actual = db.query("user")

      expectTypeOf(actual).toEqualTypeOf<QueryInitializer<TableInfo<"user">>>()
    })
  })

  describe("normalizeId", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseWriter<DataModel>({
        insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
      })
      const actual = db.normalizeId("user", "user-id")

      expectTypeOf(actual).toEqualTypeOf<E.Effect<GenericId<"user">, DocInvalidId>>()
    })

    it.effect("should return normalized id when valid", () =>
      E.gen(function* () {
        const validId = mockGenericId("user", "user-id")
        const db = mockGenericDatabaseReader<DataModel>({
          normalizeId: vi.fn().mockReturnValue(validId),
        })
        const actual = yield* db.normalizeId("user", "user-id")

        expectTypeOf(actual).toEqualTypeOf<Id<"user">>()
        expect(actual).toEqual(validId)
      }),
    )

    it.effect("should fail with DocInvalidId when id is invalid", () =>
      E.gen(function* () {
        const db = mockGenericDatabaseReader<DataModel>({
          normalizeId: vi.fn().mockReturnValue(null),
        })
        const actual = yield* db.normalizeId("user", "invalid-id").pipe(E.flip)

        expect(actual).toBeInstanceOf(DocInvalidId)
      }),
    )
  })
})

describe("GenericDatabaseWriter", () => {
  describe("insert", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseWriter<DataModel>({
        insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
      })
      const actual = db.insert("user", {name: "Joe"})

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Id<"user">>>()
    })

    it.effect("should insert document and return generated id", () =>
      E.gen(function* () {
        const newUserId = mockGenericId("user", "new-user-id")
        const db = mockGenericDatabaseWriter<DataModel>({
          insert: vi.fn().mockResolvedValue(newUserId),
        })
        const actual = yield* db.insert("user", {name: "Joe"})

        expectTypeOf(actual).toEqualTypeOf<Id<"user">>()
        expect(actual).toEqual(newUserId)
      }),
    )
  })

  describe("patch", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseWriter<DataModel>({
        patch: vi.fn().mockResolvedValue(undefined),
      })
      const actual = db.patch(mockGenericId("user", "user-id"), {name: "Joe"})

      expectTypeOf(actual).toEqualTypeOf<E.Effect<void>>()
    })

    it.effect("should patch existing document", () =>
      E.gen(function* () {
        const db = mockGenericDatabaseWriter<DataModel>({
          patch: vi.fn().mockResolvedValue(undefined),
        })
        const actual = yield* db.patch(mockGenericId("user", "user-id"), {
          name: "Joe",
        })

        expectTypeOf(actual).toEqualTypeOf<void>()
        expect(actual).toBeUndefined()
      }),
    )
  })

  describe("replace", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseWriter<DataModel>({
        replace: vi.fn().mockResolvedValue(undefined),
      })
      const actual = db.patch(mockGenericId("user", "user-id"), {name: "Joe"})

      expectTypeOf(actual).toEqualTypeOf<E.Effect<void>>()
    })

    it.effect("should replace existing document", () =>
      E.gen(function* () {
        const db = mockGenericDatabaseWriter<DataModel>({
          replace: vi.fn().mockResolvedValue(undefined),
        })
        const actual = yield* db.replace(mockGenericId("user", "user-id"), {name: "Joe"})

        expect(actual).toBeUndefined()
      }),
    )
  })

  describe("delete", () => {
    test("shoud have correct type signature", () => {
      const db = mockGenericDatabaseWriter<DataModel>({
        delete: vi.fn().mockResolvedValue(undefined),
      })
      const actual = db.delete(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<E.Effect<void>>()
    })

    it.effect("should delete existing document", () =>
      E.gen(function* () {
        const db = mockGenericDatabaseWriter<DataModel>({
          delete: vi.fn().mockResolvedValue(undefined),
        })
        const actual = yield* db.delete(mockGenericId("user", "user-id"))

        expect(actual).toBeUndefined()
      }),
    )
  })

  describe("extends GenericDatabaseReader", () => {
    describe("get", () => {
      test("shoud have correct type signature", () => {
        const db = mockGenericDatabaseWriter<DataModel>()
        const actual = db.get(mockGenericId("user", "user-id"))

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, never, never>>()
      })

      it.effect("should return None when there is no doc for the provided id", () =>
        E.gen(function* () {
          const db = mockGenericDatabaseWriter<DataModel>({get: vi.fn().mockResolvedValue(null)})
          const actual = yield* db.get(mockGenericId("user", "non-existing-user-id"))

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(null)
        }),
      )

      it.effect("should return Some(Doc) when there is a doc for the provided id", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-id"),
            _creationTime: Date.now(),
            name: "Joe",
          }

          const db = mockGenericDatabaseWriter<DataModel>({get: vi.fn().mockResolvedValue(doc)})
          const actual = yield* db.get(doc._id)

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(doc)
        }),
      )
    })

    describe("query", () => {
      test("shoud have correct type signature", () => {
        const db = mockGenericDatabaseWriter<DataModel>({
          query: vi.fn().mockReturnValue(mockQueryInitializer<TableInfo<"user">>()),
        })
        const actual = db.query("user")

        expectTypeOf(actual).toEqualTypeOf<QueryInitializer<TableInfo<"user">>>()
      })
    })

    describe("normalizeId", () => {
      test("shoud have correct type signature", () => {
        const db = mockGenericDatabaseWriter<DataModel>({
          insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
        })
        const actual = db.normalizeId("user", "user-id")

        expectTypeOf(actual).toEqualTypeOf<E.Effect<GenericId<"user">, DocInvalidId>>()
      })

      it.effect("should return normalized id when valid", () =>
        E.gen(function* () {
          const validId = mockGenericId("user", "user-id")
          const db = mockGenericDatabaseWriter<DataModel>({
            normalizeId: vi.fn().mockReturnValue(validId),
          })
          const actual = yield* db.normalizeId("user", "user-id")

          expectTypeOf(actual).toEqualTypeOf<Id<"user">>()
          expect(actual).toEqual(validId)
        }),
      )

      it.effect("should fail with DocInvalidId when id is invalid", () =>
        E.gen(function* () {
          const db = mockGenericDatabaseWriter<DataModel>({
            normalizeId: vi.fn().mockReturnValue(null),
          })
          const actual = yield* db.normalizeId("user", "invalid-id").pipe(E.flip)

          expect(actual).toBeInstanceOf(DocInvalidId)
        }),
      )
    })
  })
})
