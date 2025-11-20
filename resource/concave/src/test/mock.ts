import type {
  Auth as ConvexAuth,
  GenericActionCtx as ConvexGenericActionCtx,
  GenericDatabaseReader as ConvexGenericDatabaseReader,
  GenericDatabaseWriter as ConvexGenericDatabaseWriter,
  GenericMutationCtx as ConvexGenericMutationCtx,
  GenericQueryCtx as ConvexGenericQueryCtx,
  OrderedQuery as ConvexOrderedQuery,
  PaginationResult as ConvexPaginationResult,
  Query as ConvexQuery,
  QueryInitializer as ConvexQueryInitializer,
  Scheduler as ConvexScheduler,
  StorageActionWriter as ConvexStorageActionWriter,
  StorageReader as ConvexStorageReader,
  StorageWriter as ConvexStorageWriter,
  DefaultFunctionArgs,
  FunctionReference,
  FunctionType,
  FunctionVisibility,
  GenericDataModel,
  GenericTableInfo,
} from "convex/server"
import type {GenericId} from "convex/values"

import {vi} from "@effect/vitest"

import {
  Auth,
  GenericActionCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
  GenericMutationCtx,
  GenericQueryCtx,
  OrderedQuery,
  Query,
  QueryInitializer,
  Scheduler,
  StorageActionWriter,
  StorageReader,
  StorageWriter,
} from "@server"

export class MockNotImplementedError extends Error {
  constructor() {
    super("mock not implemented")
  }
}

export function mockGenericId<TableName extends string>(
  _tableName: TableName,
  id: string,
): GenericId<TableName> {
  return id as GenericId<TableName>
}

export function mockFunctionReference<
  Type extends FunctionType,
  Visibility extends FunctionVisibility = "public",
  Args extends DefaultFunctionArgs = any,
  ReturnType = any,
  ComponentPath = string | undefined,
>(): FunctionReference<Type, Visibility, Args, ReturnType, ComponentPath> {
  return {} as FunctionReference<Type, Visibility, Args, ReturnType, ComponentPath>
}

export function mockConvexAuth(mock: Partial<ConvexAuth> = {}): ConvexAuth {
  return {
    getUserIdentity: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockAuth(mock: Partial<ConvexAuth> = {}): Auth {
  return new Auth(mockConvexAuth(mock))
}

export function mockConvexBaseDatabaseReader() {
  return {
    get: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    query: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    normalizeId: vi.fn().mockRejectedValue(new MockNotImplementedError()),
  }
}

export function mockConvexGenericDatabaseReader<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericDatabaseReader<DataModel>> = {},
): ConvexGenericDatabaseReader<DataModel> {
  return {
    system: mockConvexBaseDatabaseReader(),
    ...mockConvexBaseDatabaseReader(),
    ...mock,
  }
}

export function mockGenericDatabaseReader<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericDatabaseReader<DataModel>> = {},
): GenericDatabaseReader<DataModel> {
  return new GenericDatabaseReader(mockConvexGenericDatabaseReader<DataModel>(mock))
}

export function mockConvexQueryInitializer<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexQueryInitializer<TableInfo>> = {},
): ConvexQueryInitializer<TableInfo> {
  return {
    fullTableScan: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    withIndex: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    withSearchIndex: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    order: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    filter: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    paginate: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    collect: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    take: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    first: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    unique: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    [Symbol.asyncIterator]: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockQueryInitializer<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexQueryInitializer<TableInfo>> = {},
): QueryInitializer<TableInfo> {
  return new QueryInitializer(mockConvexQueryInitializer<TableInfo>(mock))
}

export function mockConvexGenericDatabaseWriter<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericDatabaseWriter<DataModel>> = {},
): ConvexGenericDatabaseWriter<DataModel> {
  return {
    system: mockConvexBaseDatabaseReader(),
    ...mockConvexBaseDatabaseReader(),
    insert: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    patch: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    replace: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    delete: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockGenericDatabaseWriter<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericDatabaseWriter<DataModel>> = {},
): GenericDatabaseWriter<DataModel> {
  return new GenericDatabaseWriter(mockConvexGenericDatabaseWriter<DataModel>(mock))
}

export function mockConvexPaginationResult<Doc>(
  mock: Partial<ConvexPaginationResult<Doc>> = {},
): ConvexPaginationResult<Doc> {
  return {
    page: [],
    isDone: true,
    continueCursor: "",
    ...mock,
  }
}

export function mockConvexOrderedQuery<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexOrderedQuery<TableInfo>> = {},
): ConvexOrderedQuery<TableInfo> {
  return {
    filter: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    paginate: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    collect: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    take: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    first: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    unique: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    [Symbol.asyncIterator]: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockOrderedQuery<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexOrderedQuery<TableInfo>> = {},
): OrderedQuery<TableInfo> {
  return new OrderedQuery(mockConvexOrderedQuery<TableInfo>(mock))
}

export function mockConvexQuery<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexQuery<TableInfo>> = {},
): ConvexQuery<TableInfo> {
  return {
    filter: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    paginate: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    collect: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    take: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    first: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    unique: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    order: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    [Symbol.asyncIterator]: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockQuery<TableInfo extends GenericTableInfo>(
  mock: Partial<ConvexQuery<TableInfo>> = {},
): Query<TableInfo> {
  return new Query(mockConvexQuery<TableInfo>(mock))
}

export function mockConvexScheduler(mock: Partial<ConvexScheduler> = {}): ConvexScheduler {
  return {
    runAfter: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    runAt: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    cancel: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockScheduler(mock: Partial<ConvexScheduler> = {}): Scheduler {
  return new Scheduler(mockConvexScheduler(mock))
}

export function mockConvexStorageReader(
  mock: Partial<ConvexStorageReader> = {},
): ConvexStorageReader {
  return {
    getUrl: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    getMetadata: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockStorageReader(mock: Partial<ConvexStorageReader> = {}): StorageReader {
  return new StorageReader(mockConvexStorageReader(mock))
}

export function mockConvexStorageWriter(
  mock: Partial<ConvexStorageWriter> = {},
): ConvexStorageWriter {
  return {
    getUrl: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    getMetadata: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    generateUploadUrl: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    delete: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockStorageWriter(mock: Partial<ConvexStorageWriter> = {}): StorageWriter {
  return new StorageWriter(mockConvexStorageWriter(mock))
}

export function mockConvexStorageActionWriter(
  mock: Partial<ConvexStorageActionWriter> = {},
): ConvexStorageActionWriter {
  return {
    getUrl: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    getMetadata: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    generateUploadUrl: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    delete: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    get: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    store: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockStorageActionWriter(
  mock: Partial<ConvexStorageActionWriter> = {},
): StorageActionWriter {
  return new StorageActionWriter(mockConvexStorageActionWriter(mock))
}

export function mockConvexGenericQueryCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericQueryCtx<DataModel>> = {},
): ConvexGenericQueryCtx<DataModel> {
  return {
    auth: mockConvexAuth(),
    db: mockConvexGenericDatabaseReader<DataModel>(),
    storage: mockConvexStorageReader(),
    runQuery: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockGenericQueryCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericQueryCtx<DataModel>> = {},
): GenericQueryCtx<DataModel> {
  return new GenericQueryCtx(mockConvexGenericQueryCtx<DataModel>(mock))
}

export function mockConvexGenericMutationCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericMutationCtx<DataModel>> = {},
): ConvexGenericMutationCtx<DataModel> {
  return {
    auth: mockConvexAuth(),
    db: mockConvexGenericDatabaseWriter<DataModel>(),
    storage: mockConvexStorageWriter(),
    scheduler: mockConvexScheduler(),
    runQuery: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    runMutation: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockGenericMutationCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericMutationCtx<DataModel>> = {},
): GenericMutationCtx<DataModel> {
  return new GenericMutationCtx(mockConvexGenericMutationCtx<DataModel>(mock))
}

export function mockConvexGenericActionCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericActionCtx<DataModel>> = {},
): ConvexGenericActionCtx<DataModel> {
  return {
    auth: mockConvexAuth(),
    storage: mockConvexStorageActionWriter(),
    scheduler: mockConvexScheduler(),
    runQuery: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    runMutation: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    runAction: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    vectorSearch: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    ...mock,
  }
}

export function mockGenericActionCtx<DataModel extends GenericDataModel>(
  mock: Partial<ConvexGenericActionCtx<DataModel>> = {},
): GenericActionCtx<DataModel> {
  return new GenericActionCtx(mockConvexGenericActionCtx<DataModel>(mock))
}
