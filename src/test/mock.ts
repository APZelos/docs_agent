import type {
  Auth as ConvexAuth,
  GenericDatabaseReader as ConvexGenericDatabaseReader,
  GenericDatabaseWriter as ConvexGenericDatabaseWriter,
  QueryInitializer as ConvexQueryInitializer,
  GenericDataModel,
  GenericTableInfo,
} from "convex/server"
import type {GenericId} from "convex/values"

import {vi} from "@effect/vitest"

import {Auth, GenericDatabaseReader, GenericDatabaseWriter, QueryInitializer} from "@server"

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
