import type {GenericId} from "convex/values"

import {describe, expect, expectTypeOf, it, test, vi} from "@effect/vitest"
import {Effect as E} from "effect"

import {
  mockGenericId,
  mockStorageActionWriter,
  mockStorageReader,
  mockStorageWriter,
} from "src/test/mock"
import {FileNotFoundError} from "./error"

describe("StorageReader", () => {
  describe("getUrl", () => {
    test("should have correct type signature", () => {
      const storage = mockStorageReader()
      const storageId = mockGenericId("_storage", "file-id")

      expectTypeOf(storage.getUrl(storageId)).toEqualTypeOf<
        E.Effect<string, FileNotFoundError, never>
      >()
    })

    it.effect("should return file URL when file exists", () =>
      E.gen(function* () {
        const url = "https://storage.convex.dev/file.jpg"
        const storageId = mockGenericId("_storage", "file-id")
        const storage = mockStorageReader({
          getUrl: vi.fn().mockResolvedValue(url),
        })

        const actual = yield* storage.getUrl(storageId)

        expectTypeOf(actual).toEqualTypeOf<string>()
        expect(actual).toBe(url)
      }),
    )

    it.effect("should fail with FileNotFoundError when file does not exist", () =>
      E.gen(function* () {
        const storageId = mockGenericId("_storage", "file-id")
        const storage = mockStorageReader({
          getUrl: vi.fn().mockResolvedValue(null),
        })

        const result = yield* storage.getUrl(storageId).pipe(E.flip)

        expectTypeOf(result).toEqualTypeOf<FileNotFoundError>()
        expect(result).toBeInstanceOf(FileNotFoundError)
      }),
    )
  })
})

describe("StorageWriter", () => {
  describe("generateUploadUrl", () => {
    test("should have correct type signature", () => {
      const storage = mockStorageWriter()

      expectTypeOf(storage.generateUploadUrl()).toEqualTypeOf<E.Effect<string, never, never>>()
    })

    it.effect("should return upload URL", () =>
      E.gen(function* () {
        const uploadUrl = "https://storage.convex.dev/upload"
        const storage = mockStorageWriter({
          generateUploadUrl: vi.fn().mockResolvedValue(uploadUrl),
        })

        const actual = yield* storage.generateUploadUrl()

        expectTypeOf(actual).toEqualTypeOf<string>()
        expect(actual).toBe(uploadUrl)
      }),
    )
  })

  describe("delete", () => {
    test("should have correct type signature", () => {
      const storage = mockStorageWriter()
      const storageId = mockGenericId("_storage", "file-id")

      expectTypeOf(storage.delete(storageId)).toEqualTypeOf<E.Effect<void, never, never>>()
    })

    it.effect("should complete successfully", () =>
      E.gen(function* () {
        const storageId = mockGenericId("_storage", "file-id")
        const storage = mockStorageWriter({
          delete: vi.fn().mockResolvedValue(undefined),
        })

        const actual = yield* storage.delete(storageId)

        expectTypeOf(actual).toEqualTypeOf<void>()
        expect(actual).toBeUndefined()
      }),
    )
  })

  describe("extends StorageReader", () => {
    describe("getUrl", () => {
      test("should have correct type signature", () => {
        const storage = mockStorageWriter()
        const storageId = mockGenericId("_storage", "file-id")

        expectTypeOf(storage.getUrl(storageId)).toEqualTypeOf<
          E.Effect<string, FileNotFoundError, never>
        >()
      })

      it.effect("should return file URL when file exists", () =>
        E.gen(function* () {
          const url = "https://storage.convex.dev/file.jpg"
          const storageId = mockGenericId("_storage", "file-id")
          const storage = mockStorageWriter({
            getUrl: vi.fn().mockResolvedValue(url),
          })

          const actual = yield* storage.getUrl(storageId)

          expectTypeOf(actual).toEqualTypeOf<string>()
          expect(actual).toBe(url)
        }),
      )

      it.effect("should fail with FileNotFoundError when file does not exist", () =>
        E.gen(function* () {
          const storageId = mockGenericId("_storage", "file-id")
          const storage = mockStorageWriter({
            getUrl: vi.fn().mockResolvedValue(null),
          })

          const result = yield* storage.getUrl(storageId).pipe(E.flip)

          expectTypeOf(result).toEqualTypeOf<FileNotFoundError>()
          expect(result).toBeInstanceOf(FileNotFoundError)
        }),
      )
    })
  })
})

describe("StorageActionWriter", () => {
  describe("get", () => {
    test("should have correct type signature", () => {
      const storage = mockStorageActionWriter()
      const storageId = mockGenericId("_storage", "file-id")

      expectTypeOf(storage.get(storageId)).toEqualTypeOf<E.Effect<Blob, FileNotFoundError, never>>()
    })

    it.effect("should return blob when file exists", () =>
      E.gen(function* () {
        const blob = new Blob(["file content"], {type: "text/plain"})
        const storageId = mockGenericId("_storage", "file-id")
        const storage = mockStorageActionWriter({
          get: vi.fn().mockResolvedValue(blob),
        })

        const actual = yield* storage.get(storageId)

        expectTypeOf(actual).toEqualTypeOf<Blob>()
        expect(actual).toBe(blob)
      }),
    )

    it.effect("should fail with FileNotFoundError when file does not exist", () =>
      E.gen(function* () {
        const storageId = mockGenericId("_storage", "file-id")
        const storage = mockStorageActionWriter({
          get: vi.fn().mockResolvedValue(null),
        })

        const result = yield* storage.get(storageId).pipe(E.flip)

        expectTypeOf(result).toEqualTypeOf<FileNotFoundError>()
        expect(result).toBeInstanceOf(FileNotFoundError)
      }),
    )
  })

  describe("store", () => {
    test("should have correct type signature", () => {
      const storage = mockStorageActionWriter()
      const blob = new Blob(["content"], {type: "text/plain"})

      expectTypeOf(storage.store(blob)).toEqualTypeOf<
        E.Effect<GenericId<"_storage">, never, never>
      >()

      expectTypeOf(storage.store(blob, {sha256: "checksum"})).toEqualTypeOf<
        E.Effect<GenericId<"_storage">, never, never>
      >()
    })

    it.effect("should return storage ID when file is stored", () =>
      E.gen(function* () {
        const blob = new Blob(["file content"], {type: "text/plain"})
        const storageId = mockGenericId("_storage", "stored-file-id")
        const storage = mockStorageActionWriter({
          store: vi.fn().mockResolvedValue(storageId),
        })

        const actual = yield* storage.store(blob)

        expectTypeOf(actual).toEqualTypeOf<GenericId<"_storage">>()
        expect(actual).toBe(storageId)
      }),
    )

    it.effect("should return storage ID when file is stored with options", () =>
      E.gen(function* () {
        const blob = new Blob(["file content"], {type: "text/plain"})
        const storageId = mockGenericId("_storage", "stored-file-id")
        const storage = mockStorageActionWriter({
          store: vi.fn().mockResolvedValue(storageId),
        })

        const actual = yield* storage.store(blob, {sha256: "checksum"})

        expectTypeOf(actual).toEqualTypeOf<GenericId<"_storage">>()
        expect(actual).toBe(storageId)
      }),
    )
  })

  describe("extends StorageWriter", () => {
    describe("generateUploadUrl", () => {
      test("should have correct type signature", () => {
        const storage = mockStorageActionWriter()

        expectTypeOf(storage.generateUploadUrl()).toEqualTypeOf<E.Effect<string, never, never>>()
      })

      it.effect("should return upload URL", () =>
        E.gen(function* () {
          const uploadUrl = "https://storage.convex.dev/upload"
          const storage = mockStorageActionWriter({
            generateUploadUrl: vi.fn().mockResolvedValue(uploadUrl),
          })

          const actual = yield* storage.generateUploadUrl()

          expectTypeOf(actual).toEqualTypeOf<string>()
          expect(actual).toBe(uploadUrl)
        }),
      )
    })

    describe("delete", () => {
      test("should have correct type signature", () => {
        const storage = mockStorageActionWriter()
        const storageId = mockGenericId("_storage", "file-id")

        expectTypeOf(storage.delete(storageId)).toEqualTypeOf<E.Effect<void, never, never>>()
      })

      it.effect("should complete successfully", () =>
        E.gen(function* () {
          const storageId = mockGenericId("_storage", "file-id")
          const storage = mockStorageActionWriter({
            delete: vi.fn().mockResolvedValue(undefined),
          })

          const actual = yield* storage.delete(storageId)

          expectTypeOf(actual).toEqualTypeOf<void>()
          expect(actual).toBeUndefined()
        }),
      )
    })

    describe("getUrl", () => {
      test("should have correct type signature", () => {
        const storage = mockStorageActionWriter()
        const storageId = mockGenericId("_storage", "file-id")

        expectTypeOf(storage.getUrl(storageId)).toEqualTypeOf<
          E.Effect<string, FileNotFoundError, never>
        >()
      })

      it.effect("should return file URL when file exists", () =>
        E.gen(function* () {
          const url = "https://storage.convex.dev/file.jpg"
          const storageId = mockGenericId("_storage", "file-id")
          const storage = mockStorageActionWriter({
            getUrl: vi.fn().mockResolvedValue(url),
          })

          const actual = yield* storage.getUrl(storageId)

          expectTypeOf(actual).toEqualTypeOf<string>()
          expect(actual).toBe(url)
        }),
      )

      it.effect("should fail with FileNotFoundError when file does not exist", () =>
        E.gen(function* () {
          const storageId = mockGenericId("_storage", "file-id")
          const storage = mockStorageActionWriter({
            getUrl: vi.fn().mockResolvedValue(null),
          })

          const result = yield* storage.getUrl(storageId).pipe(E.flip)

          expectTypeOf(result).toEqualTypeOf<FileNotFoundError>()
          expect(result).toBeInstanceOf(FileNotFoundError)
        }),
      )
    })
  })
})
