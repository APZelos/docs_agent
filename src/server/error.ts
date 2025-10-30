import {Data} from "effect"

/**
 * Error thrown when a document is not found in the database.
 *
 * This error is used throughout Concave when operations expect a document
 * to exist but it cannot be found by the given ID or query criteria.
 *
 * @example
 * ```typescript
 * const user = yield* db.get(userId).pipe(
 *   E.flatMap(Option.match({
 *     onNone: () => E.fail(new DocNotFoundError()),
 *     onSome: (user) => E.succeed(user)
 *   }))
 * )
 * ```
 */
export class DocNotFoundError extends Data.TaggedError("DocNotFoundError") {}

/**
 * Error thrown when a query expects exactly one document but finds multiple.
 *
 * This error is used by operations like `unique()` which expect a single
 * result but find more than one matching document.
 *
 * @example
 * ```typescript
 * const user = yield* db.query("users")
 *   .filter(q => q.eq(q.field("email"), email))
 *   .unique()
 *   .pipe(E.mapError(() => new DocNotUniqueError()))
 * ```
 */
export class DocNotUniqueError extends Data.TaggedError("NotUniqueDocError") {}

/**
 * Error thrown when an ID string is invalid for the given table.
 *
 * This error is used by `normalizeId()` when the provided ID string
 * cannot be parsed as a valid ID for the specified table.
 *
 * @example
 * ```typescript
 * const normalizedId = yield* db.normalizeId("users", invalidIdString)
 *   .pipe(E.catchTag("InvalidDocIdError", () => E.succeed(null)))
 * ```
 */
export class InvalidDocIdError extends Data.TaggedError("InvalidDocIdError") {}

/**
 * Error thrown when a file is not found in Convex storage.
 *
 * This error is used by storage operations when a file with the given
 * storage ID does not exist or has been deleted.
 *
 * @example
 * ```typescript
 * const fileUrl = yield* storage.getUrl(storageId)
 *   .pipe(E.catchTag("FileNotFoundError", () => E.succeed(null)))
 * ```
 */
export class FileNotFoundError extends Data.TaggedError("FileNotFoundError") {}
