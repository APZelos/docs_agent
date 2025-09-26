import type {
  Auth as ConvexAuth,
  GenericDatabaseReader as ConvexGenericDatabaseReader,
  GenericDatabaseWriter as ConvexGenericDatabaseWriter,
  OrderedQuery as ConvexOrderedQuery,
  PaginationResult as ConvexPaginationResult,
  Query as ConvexQuery,
  QueryInitializer as ConvexQueryInitializer,
  Scheduler as ConvexScheduler,
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
  GenericDatabaseReader,
  GenericDatabaseWriter,
  OrderedQuery,
  Query,
  QueryInitializer,
  Scheduler,
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
