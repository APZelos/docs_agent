# Concave Testing Strategy & Implementation Guide

## Overview

This document outlines the comprehensive testing strategy for Concave, an Effect-based library that integrates the Effect functional programming library with Convex backend services. The testing approach focuses on both functionality and type inference while maintaining strict type safety throughout.

## Project Context

**Concave Philosophy**: Bridge Effect's powerful functional programming primitives (Effect, Option, Context) with Convex's backend services, enabling:

- **Type safety**: Full TypeScript support with proper error handling
- **Composability**: Functions return Effects that can be chained, mapped, and composed
- **Dependency injection**: Use Effect's Context system for clean service management
- **Functional error handling**: Replace try/catch with Effect's structured error handling

## Current Test Analysis

### Strengths

- Uses Vitest with `convex-test` for Convex function testing
- Tests type inference with `expectTypeOf` from Vitest
- Tests different validator combinations (args, returns, both)
- Good integration test setup using `convex-test`

### Identified Gaps

- No unit tests for individual Effect-wrapped classes
- Missing error handling tests for typed errors
- No tests for Effect composition and functional patterns
- Limited coverage of storage, auth, scheduler services
- No tests for Option handling patterns
- Missing edge cases and error conditions
- No performance/load testing
- Limited HTTP action testing beyond basic functionality
- Missing test environment configuration documentation
- No comprehensive error scenario coverage
- Lacking test data management strategy

## Test Environment Setup

### Local Development Environment

**Prerequisites**:

- Node.js 18+
- pnpm package manager
- Convex CLI installed globally
- Valid Convex project configuration

**Setup Steps**:

```bash
# Install dependencies
pnpm install

# Set up Convex test environment
npx convex dev --configure-for-tests

# Create test-specific Convex deployment (optional for isolation)
CONVEX_DEPLOYMENT=test npx convex deploy
```

### Test Configuration

**Environment Variables** (`.env.test.local`):

```bash
CONVEX_URL=https://your-test-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your_test_deploy_key
NODE_ENV=test
```

**Vitest Configuration** (`vitest.config.js`):

```javascript
import tsConfigPaths from "vite-tsconfig-paths"
import {defineConfig} from "vitest/config"

export default defineConfig({
  plugins: [tsConfigPaths()],
  test: {
    environment: "edge-runtime", // Required for convex-test compatibility
    server: {deps: {inline: ["convex-test"]}},
    testTimeout: 30000, // Convex operations can be slow
    setupFiles: ["./src/test/setup.ts"],
    globalSetup: "./src/test/global-setup.ts",
  },
  resolve: {
    alias: {
      "@server": "/src/server",
    },
  },
})
```

**Test Isolation Strategy**:

- Each test file gets isolated table prefixes
- Database cleanup between test suites
- Proper test data management and cleanup

## Test Organization Strategy

### Co-located Unit Tests (next to source files)

Fast, pure logic tests that don't require Convex runtime:

```
src/server/
├── auth.ts
├── auth.test.ts                    # Unit tests for Auth class
├── context.ts
├── context.test.ts                 # Context creation and dependency injection
├── database.ts
├── database.test.ts                # GenericDatabaseReader/Writer unit tests
├── error.ts
├── error.test.ts                   # Error class behavior and Effect integration
├── query.ts
├── query.test.ts                   # Query/OrderedQuery/QueryInitializer classes
├── scheduler.ts
├── scheduler.test.ts               # Scheduler service unit tests
├── server.ts
├── server.test.ts                  # Function builders (createFunctions, etc.)
├── storage.ts
├── storage.test.ts                 # Storage service classes
└── test-utils/
    ├── mocks.ts                    # Shared type-safe mock factories
    ├── fixtures.ts                 # Test data builders and fixtures
    └── helpers.ts                  # Effect testing utilities
```

### Integration Tests (in `src/test/` - require Convex runtime)

End-to-end tests that need the full Convex environment:

```
src/test/
├── convex/                         # Generated Convex files (keep existing)
│   ├── _generated/
│   ├── concave.ts
│   ├── query.ts
│   ├── mutation.ts
│   └── http.ts
├── integration/
│   ├── effect-composition.test.ts  # End-to-end Effect chains
│   ├── context-injection.test.ts   # Full context with real DB
│   ├── error-handling.test.ts      # Errors in real Convex functions
│   ├── convex-limits.test.ts       # Testing against actual Convex constraints
│   ├── auth-flows.test.ts          # Authentication scenarios
│   ├── storage-operations.test.ts  # File upload/download flows
│   └── scheduled-functions.test.ts # Scheduler integration
├── types/
│   ├── function-types.test.ts      # Type inference with generated APIs
│   ├── api-types.test.ts           # Generated API type correctness
│   └── database-types.test.ts      # Database operation type inference
├── performance/
│   ├── query-limits.test.ts        # Large result sets, pagination
│   └── effect-composition.test.ts  # Effect vs Promise benchmarks
├── error-scenarios/
│   ├── network-failures.test.ts    # Connection issues, timeouts
│   ├── rate-limiting.test.ts       # Convex rate limit handling
│   ├── auth-failures.test.ts       # Invalid tokens, expired sessions
│   └── constraint-violations.test.ts # Database constraint errors
├── http.test.ts                    # HTTP action integration tests
├── mutation.test.ts                # Mutation integration tests
├── query.test.ts                   # Query integration tests
├── setup.ts                        # Test setup utilities
├── global-setup.ts                 # Global test configuration
└── fixtures/                       # Test data fixtures
    ├── users.json                  # Sample user data
    ├── posts.json                  # Sample post data
    └── files/                      # Test file uploads
        ├── test-image.jpg
        └── test-document.pdf
```

## Type-Safe Testing Principles

### 1. Zero `any` Usage

- Never use `as any` to bypass type errors
- Create complete mock factories instead
- Use proper type assertions only when absolutely necessary (e.g., ID creation)

### 2. Complete Mock Interfaces

- Implement full interfaces in mocks, not partial ones
- Use `vi.fn()` for methods that need behavior verification
- Leverage TypeScript's type checking in test code

### 3. Test Data Model

Define a consistent test data model for type safety:

```typescript
// src/server/test-utils/mocks.ts
// Align with actual Convex schema
export interface TestDataModel extends GenericDataModel {
  user: {
    _id: GenericId<"user">
    _creationTime: number
    name: string
  }
  // Add additional tables as they are implemented in the actual schema
  // Don't assume complex relationships until they exist
}
```

## Testing Categories & Focus Areas

### 1. Co-located Unit Tests Focus

- **Pure Effect logic** - Option wrapping, error handling, Effect composition
- **Class behavior** - Method chaining, state management, wrapper functionality
- **Type safety** - Generic constraints, type inference without generated types
- **Error handling** - Custom error classes, Effect error propagation
- **Service abstractions** - Auth, Storage, Scheduler wrapper behavior

### 2. Integration Tests Focus

- **Generated API types** - FunctionReference type inference
- **Full Convex runtime** - Real database operations, transactions
- **End-to-end flows** - HTTP → Action → Mutation → Query chains
- **Convex constraints** - Document limits, timeout behavior
- **Cross-function calls** - runQuery, runMutation in actions

### 3. Error Scenario Testing

- **Network failures** - Connection drops, timeout handling
- **Authentication errors** - Invalid tokens, expired sessions, missing permissions
- **Database constraints** - Unique violations, foreign key constraints
- **Storage errors** - File too large, invalid file types, quota exceeded
- **Rate limiting** - Convex API rate limit responses
- **Scheduler errors** - Failed scheduled function execution
- **Validation errors** - Invalid function arguments, schema validation failures
- **Context errors** - Missing context dependencies, invalid context state

## Key Testing Patterns

### Effect Testing Patterns

```typescript
// Test Effect success
const result = await E.runPromise(effectOperation)
expect(result).toBe(expectedValue)

// Test Effect failures with proper typing
const result = await E.runPromise(
  failingEffect.pipe(
    E.either,
    E.map(
      Either.match({
        onLeft: (error) => error,
        onRight: () => null,
      }),
    ),
  ),
)
expect(result).toBeInstanceOf(ExpectedError)

// Test with provided context
const result = await E.runPromise(effectWithContext.pipe(E.provide(TestCtx, mockCtx)))

// Test Effect generator functions
const composedEffect = E.gen(function* () {
  const user = yield* db.get(userId)
  if (Option.isNone(user)) {
    return yield* E.fail(new DocNotFoundError("user", userId))
  }
  const posts = yield* db
    .query("user")
    .withIndex("by_author", (q) => q.eq("authorId", userId))
    .collect()
  return {user: user.value, posts}
})

const result = await E.runPromise(composedEffect.pipe(E.provide(DatabaseCtx, mockDb)))

// Test Effect error handling with catchTag
const handledEffect = effectThatMightFail.pipe(
  E.catchTag("DocNotFoundError", (error) => E.succeed(null)),
  E.catchTag("ConvexError", (error) => E.fail(new CustomError(error.message))),
)

const result = await E.runPromise(handledEffect.pipe(E.provide(TestCtx, mockCtx)))
```

### Type Testing with `expectTypeOf`

```typescript
// Test function reference types (with generated API dependency)
expectTypeOf(api.queries.getUser).toMatchTypeOf<
  FunctionReference<"query", "public", Record<string, any>, any>
>()

// Test Effect types (aligned with actual schema)
expectTypeOf(db.get(userId)).toEqualTypeOf<
  E.Effect<Option.Option<Doc<"user">>, never, DatabaseCtx>
>()

// Test error types
expectTypeOf(failingOperation).toEqualTypeOf<E.Effect<never, DocNotFoundError, SomeContext>>()

// Test with specific constraints (use actual table name)
expectTypeOf(db.insert("user", userData)).toEqualTypeOf<
  E.Effect<GenericId<"user">, ConvexError, DatabaseCtx>
>()
```

### Mock Factory Pattern (Corrected)

```typescript
// src/server/test-utils/mocks.ts
import type {GenericDatabaseReader, GenericDatabaseWriter, GenericId} from "convex/server"

import {vi} from "vitest"

export function createMockQuery<T = any>(data: T[] = []) {
  const mockQuery = {
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    withIndex: vi.fn().mockReturnThis(),
    withSearchIndex: vi.fn().mockReturnThis(),
    collect: vi.fn().mockResolvedValue(data),
    first: vi.fn().mockResolvedValue(data[0] || null),
    unique: vi.fn().mockResolvedValue(data[0] || null),
    take: vi.fn().mockReturnThis(),
    paginate: vi.fn().mockResolvedValue({
      page: data.slice(0, 10),
      isDone: data.length <= 10,
      continueCursor: data.length > 10 ? "cursor" : null,
    }),
    [Symbol.asyncIterator]: vi.fn().mockImplementation(async function* () {
      for (const item of data) {
        yield item
      }
    }),
  }
  return mockQuery
}

export function createMockDatabaseReader<T extends GenericDataModel = TestDataModel>(
  testData: Partial<Record<keyof T, any[]>> = {},
): GenericDatabaseReader<T> {
  return {
    get: vi.fn().mockImplementation(async (id: GenericId<any>) => {
      const [tableName] = id.split("_")
      const table = testData[tableName as keyof T] || []
      return table.find((doc: any) => doc._id === id) || null
    }),
    query: vi.fn().mockImplementation((tableName: keyof T) => {
      const table = testData[tableName] || []
      return createMockQuery(table)
    }),
    normalizeId: vi
      .fn()
      .mockImplementation(
        <TableName extends keyof T>(tableName: TableName, id: string) =>
          `${String(tableName)}_${id}` as GenericId<TableName>,
      ),
    system: {
      get: vi.fn().mockResolvedValue(null),
      query: vi.fn().mockImplementation(() => createMockQuery([])),
    },
  } as GenericDatabaseReader<T>
}

export function createMockDatabaseWriter<T extends GenericDataModel = TestDataModel>(
  testData: Partial<Record<keyof T, any[]>> = {},
): GenericDatabaseWriter<T> {
  const reader = createMockDatabaseReader(testData)

  return {
    ...reader,
    insert: vi
      .fn()
      .mockImplementation(async <TableName extends keyof T>(tableName: TableName, value: any) => {
        const id = `${String(tableName)}_${Date.now()}` as GenericId<TableName>
        const doc = {_id: id, _creationTime: Date.now(), ...value}

        if (!testData[tableName]) testData[tableName] = []
        testData[tableName]!.push(doc)

        return id
      }),
    patch: vi.fn().mockResolvedValue(undefined),
    replace: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  } as GenericDatabaseWriter<T>
}
```

## Implementation Roadmap

### Phase 0: Environment Setup & Critical Fixes

**Goal**: Fix critical configuration issues and establish working test environment

**Tasks**:

1. **Fix Vitest configuration**
   - Update vitest.config.js with correct edge-runtime environment
   - Add proper plugin configuration and aliases
   - Create missing global-setup.ts file

2. **Create working test utilities**
   - Implement complete mock factories with proper typing
   - Fix Effect testing patterns to use correct v3 APIs
   - Create realistic test fixtures aligned with current schema

3. **Validate current test suite**
   - Ensure existing tests pass with new configuration
   - Verify convex-test integration works correctly
   - Document any convex-test limitations discovered

4. **Establish testing patterns**
   - Document corrected Effect testing patterns
   - Create type testing examples with proper APIs
   - Set up complete mock factory templates

### Phase 1: Foundation Setup

**Goal**: Establish core testing infrastructure and patterns

**Tasks**:

1. **Create type-safe mock factories** (`src/server/test-utils/`)
   - TestDataModel interface definition
   - Complete mock factories for all Convex services
   - Test data builders with proper typing
   - Realistic mock behaviors with proper state management

2. **Implement core unit tests**:
   - `src/server/error.test.ts` - Error classes and Effect integration
   - `src/server/database.test.ts` - Database reader/writer wrapper logic
   - `src/server/query.test.ts` - Query classes and method chaining

3. **Set up testing utilities**:
   - Effect testing helpers
   - Type assertion utilities
   - Common test patterns documentation

### Phase 2: Service Coverage

**Goal**: Complete unit test coverage for all service wrappers

**Tasks**:

1. **Service unit tests**:
   - `src/server/auth.test.ts` - Auth wrapper and Option handling
   - `src/server/storage.test.ts` - Storage operations and error handling
   - `src/server/scheduler.test.ts` - Scheduler wrapper functionality
   - `src/server/context.test.ts` - Context creation and service injection

2. **Function builder tests**:
   - `src/server/server.test.ts` - createFunctions and Effect handler wrapping

3. **Error handling coverage**:
   - All custom error types (DocNotFoundError, FileNotFoundError, etc.)
   - Effect error propagation patterns
   - Error composition and catchTag functionality

### Phase 3: Integration & Advanced Testing

**Goal**: End-to-end testing with full Convex integration

**Tasks**:

1. **Enhanced integration tests**:
   - `src/test/integration/effect-composition.test.ts` - Complex Effect chains
   - `src/test/integration/context-injection.test.ts` - Full context with real DB
   - `src/test/integration/error-handling.test.ts` - Errors in Convex functions
   - `src/test/integration/auth-flows.test.ts` - Authentication scenarios
   - `src/test/integration/storage-operations.test.ts` - File operations

2. **Type inference tests**:
   - `src/test/types/function-types.test.ts` - Generated API type correctness
   - `src/test/types/database-types.test.ts` - Database operation type inference

3. **Error scenario tests**:
   - `src/test/error-scenarios/network-failures.test.ts` - Connection issues
   - `src/test/error-scenarios/auth-failures.test.ts` - Authentication errors
   - `src/test/error-scenarios/rate-limiting.test.ts` - Rate limit handling

### Phase 4: Performance & Edge Cases

**Goal**: Performance testing and comprehensive edge case coverage

**Tasks**:

1. **Performance tests**:
   - `src/test/performance/query-limits.test.ts` - Convex limit testing
   - `src/test/performance/effect-composition.test.ts` - Effect vs Promise benchmarks
   - Database operation performance under load

2. **Edge case testing**:
   - Boundary conditions for all operations
   - Error recovery patterns
   - Concurrent operation testing
   - Large data set handling

3. **Documentation and guides**:
   - Testing pattern examples
   - Mock creation guidelines
   - Contribution testing requirements
   - Performance benchmarking results

## Test Execution Commands

### Development Workflow

```bash
# Fast unit tests (no Convex runtime)
pnpm test src/server/

# Specific service tests
pnpm test src/server/database.test.ts
pnpm test src/server/auth.test.ts

# Integration tests (with Convex runtime)
pnpm test src/test/integration/

# Error scenario tests
pnpm test src/test/error-scenarios/

# All tests
pnpm test

# With coverage
pnpm test --coverage

# Watch mode for development
pnpm test --watch src/server/

# Type-only tests
pnpm test src/test/types/

# Performance tests (separate from regular CI)
pnpm test src/test/performance/ --run
```

### Build & Quality Commands

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# All checks (type, lint, format)
pnpm checks

# Build verification
pnpm build

# Full test suite with coverage
pnpm test --coverage --reporter=verbose
```

## Coverage Requirements

### Unit Tests (Co-located)

- **Target**: 85-90% line coverage (Effect runtime handles many edge cases)
- **Focus**: Core business logic, wrapper functionality, explicit error handling
- **Speed**: Fast execution without external dependencies
- **Isolation**: No Convex runtime dependencies

### Integration Tests (src/test/)

- **Target**: 80-85% line coverage for integration paths
- **Focus**: End-to-end workflows, Convex integration, type inference
- **Scope**: Real database operations, generated API usage
- **Performance**: Acceptable test execution time (<2 minutes total)

### Type Tests

- **Requirement**: All public APIs must have type inference tests
- **Tools**: `expectTypeOf` for compile-time type verification
- **Coverage**: Function signatures, Effect types, error types
- **Dependencies**: Account for generated API dependencies

### Error Scenario Coverage

- **Target**: 100% coverage of error conditions
- **Scope**: Network, auth, database, storage, rate limiting
- **Verification**: Both unit and integration error scenarios

## Functional Correctness Focus

Instead of performance benchmarking, focus testing on:

1. **Type Safety Verification**: Ensure all Effect types are correctly inferred
2. **Error Handling**: Verify proper error propagation through Effect chains
3. **Context Injection**: Test service dependency injection works correctly
4. **Convex Integration**: Ensure wrapper functions work with real Convex operations
5. **Composition**: Test that Effect chains compose correctly without losing type information

Performance is secondary to correctness and type safety in this functional programming context.

### Correctness Criteria

- **Type inference**: All public APIs have proper type inference without `any`
- **Error propagation**: Effect error types are correctly propagated through chains
- **Context management**: Service dependencies are properly injected and available
- **Convex compatibility**: All wrapped operations work identically to native Convex calls

## Key Success Metrics

1. **Type Safety**: Zero `any` usage in production and test code
2. **Test Speed**: Unit tests complete in <10 seconds, integration tests <2 minutes
3. **Coverage**: 90%+ overall test coverage
4. **Reliability**: Tests catch regressions and type errors
5. **Maintainability**: Tests remain green during refactoring
6. **Environment Stability**: Consistent test results across environments

## Best Practices

### Do's

- ✅ Create complete, type-safe mocks
- ✅ Test Effect composition and error handling
- ✅ Use `expectTypeOf` for type inference verification
- ✅ Co-locate unit tests with source files
- ✅ Focus unit tests on pure logic without Convex runtime
- ✅ Use descriptive test names that explain the behavior
- ✅ Test both success and error cases
- ✅ Clean up test data after each test
- ✅ Use realistic test fixtures
- ✅ Test error propagation through Effect chains

### Don'ts

- ❌ Use `as any` to bypass type checking
- ❌ Create partial mocks that don't match full interfaces
- ❌ Mix unit and integration test concerns
- ❌ Skip error condition testing
- ❌ Ignore type inference in tests
- ❌ Test implementation details instead of behavior
- ❌ Leave test data in the database
- ❌ Use hardcoded IDs that might conflict
- ❌ Ignore performance implications of test setup

## Future Considerations

1. **Property-based testing** with `@fast-check/vitest` for Effect compositions
2. **Mutation testing** to verify test quality with tools like Stryker
3. **Performance regression detection** with automated benchmarking
4. **Visual regression testing** for generated type definitions
5. **Fuzz testing** for Convex integration edge cases
6. **Contract testing** for API compatibility across versions
7. **Load testing** for Convex function performance under stress
8. **Chaos engineering** for resilience testing

## Troubleshooting Guide

### Common Issues

1. **Convex connection timeouts**: Increase test timeout, check network connectivity
2. **Type inference failures**: Ensure generated files are up to date
3. **Mock behavior inconsistencies**: Verify mock implementations match real interfaces
4. **Test data conflicts**: Implement proper test isolation and cleanup
5. **Environment setup issues**: Verify environment variables and deployment configuration

### Debug Strategies

- Use `vitest --reporter=verbose` for detailed test output
- Enable Convex debug logging for integration test failures
- Use `expectTypeOf` errors to debug type inference issues
- Implement test-specific logging for Effect chains

This comprehensive testing strategy ensures Concave maintains high quality, type safety, and reliability while providing excellent developer experience through thorough test coverage, proper environment management, and fast feedback loops.
