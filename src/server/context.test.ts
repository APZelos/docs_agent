import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server"
import type {GenericId} from "convex/values"
import type {Auth} from "./auth"
import type {GenericDatabaseReader, GenericDatabaseWriter} from "./database"
import type {Scheduler} from "./scheduler"
import type {StorageActionWriter, StorageReader, StorageWriter} from "./storage"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import {Effect as E} from "effect"

import {
  mockFunctionReference,
  mockGenericActionCtx,
  mockGenericId,
  mockGenericMutationCtx,
  mockGenericQueryCtx,
} from "src/test/mock"
import {createActionCtx, createMutationCtx, createQueryCtx, HttpActionCtx} from "./context"

const _schema = defineSchema({
  user: defineTable({
    name: v.string(),
  }).vectorIndex("by_name", {vectorField: "name", dimensions: 2}),
})

type DataModel = DataModelFromSchemaDefinition<typeof _schema>
type TableNames = TableNamesInDataModel<DataModel>
type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

describe("GenericQueryCtx", () => {
  describe("constructor", () => {
    test("should initialize all services correctly", () => {
      const queryCtx = mockGenericQueryCtx<DataModel>()

      expectTypeOf(queryCtx.auth).toEqualTypeOf<Auth>()
      expectTypeOf(queryCtx.db).toEqualTypeOf<GenericDatabaseReader<DataModel>>()
      expectTypeOf(queryCtx.storage).toEqualTypeOf<StorageReader>()
      expect(queryCtx.auth).toBeDefined()
      expect(queryCtx.db).toBeDefined()
      expect(queryCtx.storage).toBeDefined()
    })

    test("should store convex query context", () => {
      const queryCtx = mockGenericQueryCtx<DataModel>()

      expect(queryCtx.convexQueryCtx).toBeDefined()
    })
  })
})

describe("GenericMutationCtx", () => {
  describe("constructor", () => {
    test("should initialize all services correctly", () => {
      const mutationCtx = mockGenericMutationCtx<DataModel>()

      expectTypeOf(mutationCtx.auth).toEqualTypeOf<Auth>()
      expectTypeOf(mutationCtx.db).toEqualTypeOf<GenericDatabaseWriter<DataModel>>()
      expectTypeOf(mutationCtx.storage).toEqualTypeOf<StorageWriter>()
      expectTypeOf(mutationCtx.scheduler).toEqualTypeOf<Scheduler>()
      expect(mutationCtx.auth).toBeDefined()
      expect(mutationCtx.db).toBeDefined()
      expect(mutationCtx.storage).toBeDefined()
      expect(mutationCtx.scheduler).toBeDefined()
    })

    test("should store convex mutation context", () => {
      const mutationCtx = mockGenericMutationCtx<DataModel>()

      expect(mutationCtx.convexMutationCtx).toBeDefined()
    })
  })
})

describe("GenericActionCtx", () => {
  describe("runQuery", () => {
    test("should have correct type signature", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()
      const query = mockFunctionReference<"query", "public", {id: string}, Doc<"user">>()

      expectTypeOf(actionCtx.runQuery(query, {id: "user-id"})).toEqualTypeOf<
        E.Effect<Doc<"user">>
      >()
    })

    it.effect("should return query result", () =>
      E.gen(function* () {
        const user: Doc<"user"> = {
          _id: mockGenericId("user", "user-id"),
          _creationTime: Date.now(),
          name: "Test User",
        }
        const query = mockFunctionReference<"query", "public", {id: string}, Doc<"user">>()
        const actionCtx = mockGenericActionCtx<DataModel>({
          runQuery: vi.fn().mockResolvedValue(user),
        })

        const actual = yield* actionCtx.runQuery(query, {id: "user-id"})

        expectTypeOf(actual).toEqualTypeOf<Doc<"user">>()
        expect(actual).toBe(user)
      }),
    )
  })

  describe("runMutation", () => {
    test("should have correct type signature", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()
      const mutation = mockFunctionReference<
        "mutation",
        "public",
        {name: string},
        GenericId<"user">
      >()

      expectTypeOf(actionCtx.runMutation(mutation, {name: "Test User"})).toEqualTypeOf<
        E.Effect<GenericId<"user">>
      >()
    })

    it.effect("should return mutation result", () =>
      E.gen(function* () {
        const userId = mockGenericId("user", "user-id")
        const mutation = mockFunctionReference<
          "mutation",
          "public",
          {name: string},
          GenericId<"user">
        >()
        const actionCtx = mockGenericActionCtx<DataModel>({
          runMutation: vi.fn().mockResolvedValue(userId),
        })

        const actual = yield* actionCtx.runMutation(mutation, {name: "Test User"})

        expectTypeOf(actual).toEqualTypeOf<GenericId<"user">>()
        expect(actual).toBe(userId)
      }),
    )
  })

  describe("runAction", () => {
    test("should have correct type signature", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()
      const action = mockFunctionReference<"action", "public", {data: string}, void>()

      expectTypeOf(actionCtx.runAction(action, {data: "test"})).toEqualTypeOf<E.Effect<void>>()
    })

    it.effect("should return action result", () =>
      E.gen(function* () {
        const action = mockFunctionReference<"action", "public", {data: string}, void>()
        const actionCtx = mockGenericActionCtx<DataModel>({
          runAction: vi.fn().mockResolvedValue(undefined),
        })

        const actual = yield* actionCtx.runAction(action, {data: "test"})

        expectTypeOf(actual).toEqualTypeOf<void>()
        expect(actual).toBeUndefined()
      }),
    )
  })

  describe("vectorSearch", () => {
    test("should have correct type signature", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()
      const actual = actionCtx.vectorSearch("user", "by_name", {
        vector: [1, 2],
        limit: 10,
      })

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<{_id: GenericId<"user">; _score: number}[], never, never>
      >()
    })

    it.effect("should return vector search results", () =>
      E.gen(function* () {
        const results = [
          {_id: mockGenericId("user", "user-1"), _score: 0.95},
          {_id: mockGenericId("user", "user-2"), _score: 0.87},
        ]
        const actionCtx = mockGenericActionCtx<DataModel>({
          vectorSearch: vi.fn().mockResolvedValue(results),
        })

        const actual = yield* actionCtx.vectorSearch("user", "by_name", {
          vector: [1, 2],
          limit: 10,
        })

        expect(actual).toEqual(results)
      }),
    )
  })

  describe("constructor", () => {
    test("should initialize all services correctly", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()

      expectTypeOf(actionCtx.auth).toEqualTypeOf<Auth>()
      expectTypeOf(actionCtx.storage).toEqualTypeOf<StorageActionWriter>()
      expectTypeOf(actionCtx.scheduler).toEqualTypeOf<Scheduler>()
      expect(actionCtx.auth).toBeDefined()
      expect(actionCtx.storage).toBeDefined()
      expect(actionCtx.scheduler).toBeDefined()
    })

    test("should store convex action context", () => {
      const actionCtx = mockGenericActionCtx<DataModel>()

      expect(actionCtx.convexActionCtx).toBeDefined()
    })
  })
})

describe("createQueryCtx", () => {
  test("should return a Context tag", () => {
    const QueryCtx = createQueryCtx<DataModel>()

    expect(QueryCtx).toBeDefined()
    expect(typeof QueryCtx).toBe("object")
    expect(QueryCtx.key).toBe("QueryCtx")
  })
})

describe("createMutationCtx", () => {
  test("should return a Context tag", () => {
    const MutationCtx = createMutationCtx<DataModel>()

    expect(MutationCtx).toBeDefined()
    expect(typeof MutationCtx).toBe("object")
    expect(MutationCtx.key).toBe("MutationCtx")
  })
})

describe("createActionCtx", () => {
  test("should return a Context tag", () => {
    const ActionCtx = createActionCtx<DataModel>()

    expect(ActionCtx).toBeDefined()
    expect(typeof ActionCtx).toBe("object")
    expect(ActionCtx.key).toBe("ActionCtx")
  })
})

describe("HttpActionCtx", () => {
  test("should be a pre-configured Context tag", () => {
    expect(HttpActionCtx).toBeDefined()
    expect(typeof HttpActionCtx).toBe("object")
    expect(HttpActionCtx.key).toBe("HttpActionCtx")
  })
})
