import type {Predicate} from "convex-helpers/server/filter"
import type {
  OrderedQuery as ConvexOrderedQuery,
  QueryInitializer as ConvexQueryInitializer,
  GenericTableInfo,
} from "convex/server"
import type {OrderedQuery} from "../../server"

import {filter as convexFilter} from "convex-helpers/server/filter"

import {QueryInitializer} from "@server"

type QueryTableInfo<Q> = Q extends OrderedQuery<infer T> ? T : never

export function filter<TableInfo extends GenericTableInfo, Query extends OrderedQuery<TableInfo>>(
  query: Query,
  predicate: Predicate<QueryTableInfo<Query>>,
): Query {
  return new QueryInitializer<QueryTableInfo<Query>>(
    convexFilter(
      query.convexQuery as ConvexOrderedQuery<QueryTableInfo<Query>>,
      predicate,
    ) as any as ConvexQueryInitializer<QueryTableInfo<Query>>,
  ) as any as Query
}
