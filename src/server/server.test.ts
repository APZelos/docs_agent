import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server"
import type {GenericId} from "convex/values"
import type {ParseResult} from "effect"
import type {GenericMutationCtx, GenericQueryCtx} from "./context"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import {Effect as E, Option, Schema as S} from "effect"

import {
  mockConvexGenericDatabaseReader,
  mockConvexGenericDatabaseWriter,
  mockGenericId,
  mockGenericMutationCtx,
  mockGenericQueryCtx,
} from "src/test/mock"
import {createMutationCtx, createQueryCtx} from "./context"
import {DocNotFoundError} from "./error"
import {createFunctions} from "./server"

const _schema = defineSchema({
  user: defineTable({
    name: v.string(),
    age: v.number(),
  })
    .index("by_age", ["age"])
    .searchIndex("by_name", {searchField: "name"}),
})

type DataModel = DataModelFromSchemaDefinition<typeof _schema>
type TableNames = TableNamesInDataModel<DataModel>
type Id<TableName extends TableNames> = GenericId<TableName>
type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

const QueryCtx = createQueryCtx<DataModel>()
const MutationCtx = createMutationCtx<DataModel>()

const {model} = createFunctions<DataModel>({QueryCtx, MutationCtx})

describe("model", () => {
  const User = model("user", S.Struct({name: S.String, age: S.Number}))
  const doc: Doc<"user"> = {
    _id: mockGenericId("user", "user-id"),
    _creationTime: Date.now(),
    name: "Joe",
    age: 22,
  }

  describe("getById", () => {
    test("should have correct type signature", () => {
      const actual = User.getById(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<
          Option.Option<S.Schema.Type<typeof User.Document>>,
          never,
          GenericQueryCtx<DataModel>
        >
      >()
    })

    it.effect("should return None when there is no doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getById(mockGenericId("user", "user-id"))
        expect(actual).toEqual(Option.none())
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(null),
            }),
          }),
        ),
      ),
    )

    it.effect("should return Some(Doc) when there is a doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getById(mockGenericId("user", "user-id"))
        expect(actual).toEqual(Option.some(doc))
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(doc),
            }),
          }),
        ),
      ),
    )
  })

  describe("getByIdOrNull", () => {
    test("should have correct type signature", () => {
      const actual = User.getByIdOrNull(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<S.Schema.Type<typeof User.Document> | null, never, GenericQueryCtx<DataModel>>
      >()
    })

    it.effect("should return null when there is no doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getByIdOrNull(mockGenericId("user", "user-id"))
        expect(actual).toBeNull()
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(null),
            }),
          }),
        ),
      ),
    )

    it.effect("should return Doc when there is a doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getByIdOrNull(mockGenericId("user", "user-id"))
        expect(actual).toEqual(doc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(doc),
            }),
          }),
        ),
      ),
    )
  })

  describe("getByIdOrFail", () => {
    test("should have correct type signature", () => {
      const actual = User.getByIdOrFail(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<S.Schema.Type<typeof User.Document>, DocNotFoundError, GenericQueryCtx<DataModel>>
      >()
    })

    it.effect("should fail with DocNotFoundError when there is no doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getByIdOrFail(mockGenericId("user", "user-id")).pipe(E.flip)
        expect(actual).toBeInstanceOf(DocNotFoundError)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(null),
            }),
          }),
        ),
      ),
    )

    it.effect("should return Doc when there is a doc for the provided id", () =>
      E.gen(function* () {
        const actual = yield* User.getByIdOrFail(mockGenericId("user", "user-id"))
        expect(actual).toEqual(doc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue(doc),
            }),
          }),
        ),
      ),
    )
  })

  describe("insert", () => {
    test("should have correct type signature", () => {
      const actual = User.insert({name: "Joe", age: 22})

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<Id<"user">, ParseResult.ParseError, GenericMutationCtx<DataModel>>
      >()
    })

    it.effect("should insert a document and return the id", () =>
      E.gen(function* () {
        const insertedId = mockGenericId("user", "new-user-id")
        const actual = yield* User.insert({name: "Joe", age: 22})
        expect(actual).toEqual(insertedId)
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
            }),
          }),
        ),
      ),
    )
  })

  describe("insertAndGet", () => {
    it.effect("should insert a document and return Some(Doc)", () =>
      E.gen(function* () {
        const insertedId = mockGenericId("user", "new-user-id")
        const newDoc = {...doc, _id: insertedId}
        const actual = yield* User.insertAndGet({name: "Joe", age: 22})
        expect(actual).toEqual(Option.some(newDoc))
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
      ),
    )
  })

  describe("insertAndGetOrNull", () => {
    it.effect("should insert a document and return it", () =>
      E.gen(function* () {
        const insertedId = mockGenericId("user", "new-user-id")
        const newDoc = {...doc, _id: insertedId}
        const actual = yield* User.insertAndGetOrNull({name: "Joe", age: 22})
        expect(actual).toEqual(newDoc)
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
      ),
    )
  })

  describe("insertAndGetOrFail", () => {
    it.effect("should insert a document and return it", () =>
      E.gen(function* () {
        const insertedId = mockGenericId("user", "new-user-id")
        const newDoc = {...doc, _id: insertedId}
        const actual = yield* User.insertAndGetOrFail({name: "Joe", age: 22})
        expect(actual).toEqual(newDoc)
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              insert: vi.fn().mockResolvedValue(mockGenericId("user", "new-user-id")),
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, _id: mockGenericId("user", "new-user-id")}),
            }),
          }),
        ),
      ),
    )
  })

  describe("patchById", () => {
    test("should have correct type signature", () => {
      const actual = User.patchById(mockGenericId("user", "user-id"), {age: 23})

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<void, ParseResult.ParseError, GenericMutationCtx<DataModel>>
      >()
    })

    it.effect("should patch a document by id", () =>
      E.gen(function* () {
        yield* User.patchById(mockGenericId("user", "user-id"), {age: 23})
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              patch: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("patchByIdAndGet", () => {
    it.effect("should patch a document by id and return it", () =>
      E.gen(function* () {
        const patchedDoc = {...doc, age: 23}
        const actual = yield* User.patchByIdAndGet(mockGenericId("user", "user-id"), {age: 23})
        expect(actual).toEqual(Option.some(patchedDoc))
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, age: 23}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              patch: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("patchByIdAndGetOrNull", () => {
    it.effect("should patch a document by id and return it or null", () =>
      E.gen(function* () {
        const patchedDoc = {...doc, age: 23}
        const actual = yield* User.patchByIdAndGetOrNull(mockGenericId("user", "user-id"), {
          age: 23,
        })
        expect(actual).toEqual(patchedDoc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, age: 23}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              patch: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("patchByIdAndGetOrFail", () => {
    it.effect("should patch a document by id and return it or fail", () =>
      E.gen(function* () {
        const patchedDoc = {...doc, age: 23}
        const actual = yield* User.patchByIdAndGetOrFail(mockGenericId("user", "user-id"), {
          age: 23,
        })
        expect(actual).toEqual(patchedDoc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, age: 23}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              patch: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("replaceById", () => {
    test("should have correct type signature", () => {
      const actual = User.replaceById(mockGenericId("user", "user-id"), {name: "Jane", age: 25})

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<void, ParseResult.ParseError, GenericMutationCtx<DataModel>>
      >()
    })

    it.effect("should replace a document by id", () =>
      E.gen(function* () {
        yield* User.replaceById(mockGenericId("user", "user-id"), {name: "Jane", age: 25})
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              replace: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("replaceByIdAndGet", () => {
    it.effect("should replace a document by id and return it", () =>
      E.gen(function* () {
        const replacedDoc = {...doc, name: "Jane", age: 25}
        const actual = yield* User.replaceByIdAndGet(mockGenericId("user", "user-id"), {
          name: "Jane",
          age: 25,
        })
        expect(actual).toEqual(Option.some(replacedDoc))
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, name: "Jane", age: 25}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              replace: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("replaceByIdAndGetOrNull", () => {
    it.effect("should replace a document by id and return it or null", () =>
      E.gen(function* () {
        const replacedDoc = {...doc, name: "Jane", age: 25}
        const actual = yield* User.replaceByIdAndGetOrNull(mockGenericId("user", "user-id"), {
          name: "Jane",
          age: 25,
        })
        expect(actual).toEqual(replacedDoc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, name: "Jane", age: 25}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              replace: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("replaceByIdAndGetOrFail", () => {
    it.effect("should replace a document by id and return it or fail", () =>
      E.gen(function* () {
        const replacedDoc = {...doc, name: "Jane", age: 25}
        const actual = yield* User.replaceByIdAndGetOrFail(mockGenericId("user", "user-id"), {
          name: "Jane",
          age: 25,
        })
        expect(actual).toEqual(replacedDoc)
      }).pipe(
        E.provideService(
          QueryCtx,
          mockGenericQueryCtx<DataModel>({
            db: mockConvexGenericDatabaseReader<DataModel>({
              get: vi.fn().mockResolvedValue({...doc, name: "Jane", age: 25}),
            }),
          }),
        ),
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              replace: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })

  describe("deleteById", () => {
    test("should have correct type signature", () => {
      const actual = User.deleteById(mockGenericId("user", "user-id"))

      expectTypeOf(actual).toEqualTypeOf<E.Effect<void, never, GenericMutationCtx<DataModel>>>()
    })

    it.effect("should delete a document by id", () =>
      E.gen(function* () {
        yield* User.deleteById(mockGenericId("user", "user-id"))
      }).pipe(
        E.provideService(
          MutationCtx,
          mockGenericMutationCtx<DataModel>({
            db: mockConvexGenericDatabaseWriter<DataModel>({
              delete: vi.fn().mockResolvedValue(undefined),
            }),
          }),
        ),
      ),
    )
  })
})
