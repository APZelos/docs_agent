import type {
  PaginationResult as ConvexPaginationResult,
  DataModelFromSchemaDefinition,
  DocumentByName,
  NamedTableInfo,
  TableNamesInDataModel,
} from "convex/server"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {defineSchema, defineTable} from "convex/server"
import {v} from "convex/values"
import {Effect as E} from "effect"

import {
  mockConvexOrderedQuery,
  mockConvexPaginationResult,
  mockConvexQuery,
  mockGenericId,
  mockOrderedQuery,
  mockQuery,
  mockQueryInitializer,
} from "src/test/mock"
import {DocNotUniqueError} from "./error"
import {OrderedQuery, Query} from "./query"

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
type TableInfo<TableName extends TableNames> = NamedTableInfo<DataModel, TableName>
type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>

describe("OrderedQuery", () => {
  describe("filter", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.filter((q) => q.gt(q.field("age"), 18))

      expectTypeOf(actual).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
    })
  })

  describe("paginate", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.paginate({cursor: null, numItems: 10})

      expectTypeOf(actual).toEqualTypeOf<
        E.Effect<ConvexPaginationResult<Doc<"user">>, never, never>
      >()
    })

    it.effect("should return pagination result", () =>
      E.gen(function* () {
        const doc: Doc<"user"> = {
          _id: mockGenericId("user", "user-1"),
          _creationTime: Date.now(),
          name: "John",
          age: 22,
        }
        const paginationResult = mockConvexPaginationResult({
          page: [doc],
          isDone: false,
          continueCursor: "next-cursor",
        })

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          paginate: vi.fn().mockResolvedValue(paginationResult),
        })

        const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

        expectTypeOf(actual).toEqualTypeOf<ConvexPaginationResult<Doc<"user">>>()
        expect(actual).toEqual(paginationResult)
      }),
    )

    it.effect("should handle empty pagination result", () =>
      E.gen(function* () {
        const paginationResult = mockConvexPaginationResult({
          page: [],
          isDone: true,
          continueCursor: "",
        })

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          paginate: vi.fn().mockResolvedValue(paginationResult),
        })

        const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

        expect(actual.page).toEqual([])
        expect(actual.isDone).toBe(true)
      }),
    )
  })

  describe("collect", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.collect()

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
    })

    it.effect("should return all documents as array", () =>
      E.gen(function* () {
        const docs: Doc<"user">[] = [
          {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          },
          {
            _id: mockGenericId("user", "user-2"),
            _creationTime: Date.now(),
            name: "Jane",
            age: 28,
          },
        ]

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          collect: vi.fn().mockResolvedValue(docs),
        })

        const actual = yield* orderedQuery.collect()

        expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
        expect(actual).toEqual(docs)
      }),
    )

    it.effect("should handle empty collection", () =>
      E.gen(function* () {
        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          collect: vi.fn().mockResolvedValue([]),
        })

        const actual = yield* orderedQuery.collect()

        expect(actual).toEqual([])
      }),
    )
  })

  describe("take", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.take(5)

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
    })

    it.effect("should return first n documents", () =>
      E.gen(function* () {
        const docs: Doc<"user">[] = [
          {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          },
        ]

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          take: vi.fn().mockResolvedValue(docs),
        })

        const actual = yield* orderedQuery.take(1)

        expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
        expect(actual).toEqual(docs)
      }),
    )
  })

  describe("first", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.first()

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, never, never>>()
    })

    it.effect("should return Doc when document exists", () =>
      E.gen(function* () {
        const doc: Doc<"user"> = {
          _id: mockGenericId("user", "user-1"),
          _creationTime: Date.now(),
          name: "John",
          age: 22,
        }

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          first: vi.fn().mockResolvedValue(doc),
        })

        const actual = yield* orderedQuery.first()

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(doc)
      }),
    )

    it.effect("should return null when no documents exist", () =>
      E.gen(function* () {
        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          first: vi.fn().mockResolvedValue(null),
        })

        const actual = yield* orderedQuery.first()

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(null)
      }),
    )
  })

  describe("unique", () => {
    test("should have correct type signature", () => {
      const orderedQuery = mockOrderedQuery<TableInfo<"user">>()
      const actual = orderedQuery.unique()

      expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, DocNotUniqueError, never>>()
    })

    it.effect("should return Doc for single document", () =>
      E.gen(function* () {
        const doc: Doc<"user"> = {
          _id: mockGenericId("user", "user-1"),
          _creationTime: Date.now(),
          name: "John",
          age: 22,
        }

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          take: vi.fn().mockResolvedValue([doc]),
        })

        const actual = yield* orderedQuery.unique()

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(doc)
      }),
    )

    it.effect("should return null for no documents", () =>
      E.gen(function* () {
        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          take: vi.fn().mockResolvedValue([]),
        })

        const actual = yield* orderedQuery.unique()

        expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
        expect(actual).toEqual(null)
      }),
    )

    it.effect("should fail with DocNotUniqueError for multiple documents", () =>
      E.gen(function* () {
        const docs: Doc<"user">[] = [
          {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          },
          {
            _id: mockGenericId("user", "user-2"),
            _creationTime: Date.now(),
            name: "Jane",
            age: 28,
          },
        ]

        const orderedQuery = mockOrderedQuery<TableInfo<"user">>({
          take: vi.fn().mockResolvedValue(docs),
        })

        const actual = yield* orderedQuery.unique().pipe(E.flip)

        expect(actual).toBeInstanceOf(DocNotUniqueError)
      }),
    )
  })
})

describe("Query", () => {
  describe("order", () => {
    test("should have correct type signature", () => {
      const query = mockQuery<TableInfo<"user">>()

      expectTypeOf(query.order("asc")).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
      expectTypeOf(query.order("desc")).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
    })

    it.effect("should handle asc parameter", () =>
      E.gen(function* () {
        const query = mockQuery({
          order: vi.fn().mockReturnValue(mockConvexOrderedQuery<TableInfo<"user">>()),
        })
        const actual = query.order("asc")

        expect(actual).toBeInstanceOf(OrderedQuery)
      }),
    )

    it.effect("should handle desc parameter", () =>
      E.gen(function* () {
        const query = mockQuery({
          order: vi.fn().mockReturnValue(mockConvexOrderedQuery<TableInfo<"user">>()),
        })
        const actual = query.order("desc")

        expect(actual).toBeInstanceOf(OrderedQuery)
      }),
    )
  })

  describe("extends OrderedQuery", () => {
    describe("override filter", () => {
      test("should have correct type signature returning Query", () => {
        const query = mockQuery<TableInfo<"user">>()
        const actual = query.filter((q) => q.gt(q.field("age"), 18))

        expectTypeOf(actual).toEqualTypeOf<Query<TableInfo<"user">>>()
      })

      it.effect("should return Query instance not OrderedQuery", () =>
        E.gen(function* () {
          const query = mockQuery({
            filter: vi.fn().mockReturnValue(mockConvexQuery<TableInfo<"user">>()),
          })
          const actual = query.filter((q) => q.gt(q.field("age"), 18))

          expect(actual).toBeInstanceOf(Query)
        }),
      )
    })

    describe("paginate", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQuery<TableInfo<"user">>()
        const actual = orderedQuery.paginate({cursor: null, numItems: 10})

        expectTypeOf(actual).toEqualTypeOf<
          E.Effect<ConvexPaginationResult<Doc<"user">>, never, never>
        >()
      })

      it.effect("should return pagination result", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }
          const paginationResult = mockConvexPaginationResult({
            page: [doc],
            isDone: false,
            continueCursor: "next-cursor",
          })

          const orderedQuery = mockQuery<TableInfo<"user">>({
            paginate: vi.fn().mockResolvedValue(paginationResult),
          })

          const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

          expectTypeOf(actual).toEqualTypeOf<ConvexPaginationResult<Doc<"user">>>()
          expect(actual).toEqual(paginationResult)
        }),
      )

      it.effect("should handle empty pagination result", () =>
        E.gen(function* () {
          const paginationResult = mockConvexPaginationResult({
            page: [],
            isDone: true,
            continueCursor: "",
          })

          const orderedQuery = mockQuery<TableInfo<"user">>({
            paginate: vi.fn().mockResolvedValue(paginationResult),
          })

          const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

          expect(actual.page).toEqual([])
          expect(actual.isDone).toBe(true)
        }),
      )
    })

    describe("collect", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQuery<TableInfo<"user">>()
        const actual = orderedQuery.collect()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
      })

      it.effect("should return all documents as array", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
            {
              _id: mockGenericId("user", "user-2"),
              _creationTime: Date.now(),
              name: "Jane",
              age: 28,
            },
          ]

          const orderedQuery = mockQuery<TableInfo<"user">>({
            collect: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.collect()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
          expect(actual).toEqual(docs)
        }),
      )

      it.effect("should handle empty collection", () =>
        E.gen(function* () {
          const orderedQuery = mockQuery<TableInfo<"user">>({
            collect: vi.fn().mockResolvedValue([]),
          })

          const actual = yield* orderedQuery.collect()

          expect(actual).toEqual([])
        }),
      )
    })

    describe("take", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQuery<TableInfo<"user">>()
        const actual = orderedQuery.take(5)

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
      })

      it.effect("should return first n documents", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
          ]

          const orderedQuery = mockQuery<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.take(1)

          expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
          expect(actual).toEqual(docs)
        }),
      )
    })

    describe("first", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQuery<TableInfo<"user">>()
        const actual = orderedQuery.first()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, never, never>>()
      })

      it.effect("should return Doc when document exists", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }

          const orderedQuery = mockQuery<TableInfo<"user">>({
            first: vi.fn().mockResolvedValue(doc),
          })

          const actual = yield* orderedQuery.first()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(doc)
        }),
      )

      it.effect("should return null when no documents exist", () =>
        E.gen(function* () {
          const orderedQuery = mockQuery<TableInfo<"user">>({
            first: vi.fn().mockResolvedValue(null),
          })

          const actual = yield* orderedQuery.first()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(null)
        }),
      )
    })

    describe("unique", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQuery<TableInfo<"user">>()
        const actual = orderedQuery.unique()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, DocNotUniqueError, never>>()
      })

      it.effect("should return Doc for single document", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }

          const orderedQuery = mockQuery<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue([doc]),
          })

          const actual = yield* orderedQuery.unique()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(doc)
        }),
      )

      it.effect("should return null for no documents", () =>
        E.gen(function* () {
          const orderedQuery = mockQuery<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue([]),
          })

          const actual = yield* orderedQuery.unique()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(null)
        }),
      )

      it.effect("should fail with DocNotUniqueError for multiple documents", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
            {
              _id: mockGenericId("user", "user-2"),
              _creationTime: Date.now(),
              name: "Jane",
              age: 28,
            },
          ]

          const orderedQuery = mockQuery<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.unique().pipe(E.flip)

          expect(actual).toBeInstanceOf(DocNotUniqueError)
        }),
      )
    })
  })
})

describe("QueryInitializer", () => {
  describe("fullTableScan", () => {
    test("should have correct type signature", () => {
      const queryInitializer = mockQueryInitializer<TableInfo<"user">>()
      const actual = queryInitializer.fullTableScan()

      expectTypeOf(actual).toEqualTypeOf<Query<TableInfo<"user">>>()
    })
  })

  describe("withIndex", () => {
    test("should have correct type signature", () => {
      const queryInitializer = mockQueryInitializer<TableInfo<"user">>()

      expectTypeOf(queryInitializer.withIndex("by_id")).toEqualTypeOf<Query<TableInfo<"user">>>()

      expectTypeOf(
        queryInitializer.withIndex("by_id", (q) => q.eq("_id", mockGenericId("user", "user-id"))),
      ).toEqualTypeOf<Query<TableInfo<"user">>>()

      expectTypeOf(queryInitializer.withIndex("by_age")).toEqualTypeOf<Query<TableInfo<"user">>>()

      expectTypeOf(queryInitializer.withIndex("by_age", (q) => q.gt("age", 18))).toEqualTypeOf<
        Query<TableInfo<"user">>
      >()
    })
  })

  describe("withSearchIndex", () => {
    test("should have correct type signature", () => {
      const queryInitializer = mockQueryInitializer<TableInfo<"user">>()
      const actual = queryInitializer.withSearchIndex("by_name", (q) => q.search("name", "joe"))

      expectTypeOf(actual).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
    })
  })

  describe("extends Query", () => {
    describe(" order", () => {
      test("should have correct type signature", () => {
        const query = mockQueryInitializer<TableInfo<"user">>()

        expectTypeOf(query.order("asc")).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
        expectTypeOf(query.order("desc")).toEqualTypeOf<OrderedQuery<TableInfo<"user">>>()
      })

      it.effect("should handle asc parameter", () =>
        E.gen(function* () {
          const query = mockQueryInitializer({
            order: vi.fn().mockReturnValue(mockConvexOrderedQuery<TableInfo<"user">>()),
          })
          const actual = query.order("asc")

          expect(actual).toBeInstanceOf(OrderedQuery)
        }),
      )

      it.effect("should handle desc parameter", () =>
        E.gen(function* () {
          const query = mockQueryInitializer({
            order: vi.fn().mockReturnValue(mockConvexOrderedQuery<TableInfo<"user">>()),
          })
          const actual = query.order("desc")

          expect(actual).toBeInstanceOf(OrderedQuery)
        }),
      )
    })

    describe("filter", () => {
      test("should have correct type signature returning Query", () => {
        const query = mockQueryInitializer<TableInfo<"user">>()
        const actual = query.filter((q) => q.gt(q.field("age"), 18))

        expectTypeOf(actual).toEqualTypeOf<Query<TableInfo<"user">>>()
      })

      it.effect("should return Query instance not OrderedQuery", () =>
        E.gen(function* () {
          const query = mockQueryInitializer({
            filter: vi.fn().mockReturnValue(mockConvexQuery<TableInfo<"user">>()),
          })
          const actual = query.filter((q) => q.gt(q.field("age"), 18))

          expect(actual).toBeInstanceOf(Query)
        }),
      )
    })

    describe("paginate", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQueryInitializer<TableInfo<"user">>()
        const actual = orderedQuery.paginate({cursor: null, numItems: 10})

        expectTypeOf(actual).toEqualTypeOf<
          E.Effect<ConvexPaginationResult<Doc<"user">>, never, never>
        >()
      })

      it.effect("should return pagination result", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }
          const paginationResult = mockConvexPaginationResult({
            page: [doc],
            isDone: false,
            continueCursor: "next-cursor",
          })

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            paginate: vi.fn().mockResolvedValue(paginationResult),
          })

          const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

          expectTypeOf(actual).toEqualTypeOf<ConvexPaginationResult<Doc<"user">>>()
          expect(actual).toEqual(paginationResult)
        }),
      )

      it.effect("should handle empty pagination result", () =>
        E.gen(function* () {
          const paginationResult = mockConvexPaginationResult({
            page: [],
            isDone: true,
            continueCursor: "",
          })

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            paginate: vi.fn().mockResolvedValue(paginationResult),
          })

          const actual = yield* orderedQuery.paginate({cursor: null, numItems: 10})

          expect(actual.page).toEqual([])
          expect(actual.isDone).toBe(true)
        }),
      )
    })

    describe("collect", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQueryInitializer<TableInfo<"user">>()
        const actual = orderedQuery.collect()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
      })

      it.effect("should return all documents as array", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
            {
              _id: mockGenericId("user", "user-2"),
              _creationTime: Date.now(),
              name: "Jane",
              age: 28,
            },
          ]

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            collect: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.collect()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
          expect(actual).toEqual(docs)
        }),
      )

      it.effect("should handle empty collection", () =>
        E.gen(function* () {
          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            collect: vi.fn().mockResolvedValue([]),
          })

          const actual = yield* orderedQuery.collect()

          expect(actual).toEqual([])
        }),
      )
    })

    describe("take", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQueryInitializer<TableInfo<"user">>()
        const actual = orderedQuery.take(5)

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user">[]>>()
      })

      it.effect("should return first n documents", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
          ]

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.take(1)

          expectTypeOf(actual).toEqualTypeOf<Doc<"user">[]>()
          expect(actual).toEqual(docs)
        }),
      )
    })

    describe("first", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQueryInitializer<TableInfo<"user">>()
        const actual = orderedQuery.first()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, never, never>>()
      })

      it.effect("should return Doc when document exists", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            first: vi.fn().mockResolvedValue(doc),
          })

          const actual = yield* orderedQuery.first()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(doc)
        }),
      )

      it.effect("should return null when no documents exist", () =>
        E.gen(function* () {
          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            first: vi.fn().mockResolvedValue(null),
          })

          const actual = yield* orderedQuery.first()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(null)
        }),
      )
    })

    describe("unique", () => {
      test("should have correct type signature", () => {
        const orderedQuery = mockQueryInitializer<TableInfo<"user">>()
        const actual = orderedQuery.unique()

        expectTypeOf(actual).toEqualTypeOf<E.Effect<Doc<"user"> | null, DocNotUniqueError, never>>()
      })

      it.effect("should return Doc for single document", () =>
        E.gen(function* () {
          const doc: Doc<"user"> = {
            _id: mockGenericId("user", "user-1"),
            _creationTime: Date.now(),
            name: "John",
            age: 22,
          }

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue([doc]),
          })

          const actual = yield* orderedQuery.unique()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(doc)
        }),
      )

      it.effect("should return null for no documents", () =>
        E.gen(function* () {
          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue([]),
          })

          const actual = yield* orderedQuery.unique()

          expectTypeOf(actual).toEqualTypeOf<Doc<"user"> | null>()
          expect(actual).toEqual(null)
        }),
      )

      it.effect("should fail with DocNotUniqueError for multiple documents", () =>
        E.gen(function* () {
          const docs: Doc<"user">[] = [
            {
              _id: mockGenericId("user", "user-1"),
              _creationTime: Date.now(),
              name: "John",
              age: 22,
            },
            {
              _id: mockGenericId("user", "user-2"),
              _creationTime: Date.now(),
              name: "Jane",
              age: 28,
            },
          ]

          const orderedQuery = mockQueryInitializer<TableInfo<"user">>({
            take: vi.fn().mockResolvedValue(docs),
          })

          const actual = yield* orderedQuery.unique().pipe(E.flip)

          expect(actual).toBeInstanceOf(DocNotUniqueError)
        }),
      )
    })
  })
})
