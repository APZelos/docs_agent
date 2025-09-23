import {Data} from "effect"

export class DocNotFoundError extends Data.TaggedError("DocNotFoundError") {}

export class DocNotUniqueError extends Data.TaggedError("NotUniqueDocError") {}

export class DocInvalidId extends Data.TaggedError("DocInvalidId") {}

export class FileNotFoundError extends Data.TaggedError("FileNotFoundError") {}
