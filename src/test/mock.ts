import type {
  GenericDatabaseReader as ConvexGenericDatabaseReader,
  DataModelFromSchemaDefinition,
  GenericSchema,
  SchemaDefinition,
} from "convex/server"
import type {GenericId} from "convex/values"

import {vi} from "@effect/vitest"

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

export function mockConvexBaseDatabaseReader() {
  return {
    get: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    query: vi.fn().mockRejectedValue(new MockNotImplementedError()),
    normalizeId: vi.fn().mockRejectedValue(new MockNotImplementedError()),
  }
}

export function mockConvexGenericDatabaseReader<
  Schema extends GenericSchema,
  StrictTableNameTypes extends boolean = true,
>(
  _schema: SchemaDefinition<Schema, StrictTableNameTypes>,
): ConvexGenericDatabaseReader<DataModelFromSchemaDefinition<typeof _schema>> {
  return {
    system: mockConvexBaseDatabaseReader(),
    ...mockConvexBaseDatabaseReader(),
  }
}
