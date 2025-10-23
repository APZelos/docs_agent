import type {DataModel} from "./_generated/dataModel"

import {createModelFunction} from "../../model"
import {
  createActionCtx,
  createMutationCtx,
  createQueryCtx,
  createServerFunctions,
} from "../../server"
import schema from "./schema"

export const QueryCtx = createQueryCtx<DataModel>()
export const MutationCtx = createMutationCtx<DataModel>()
export const ActionCtx = createActionCtx<DataModel>()

export const {query, internalQuery, mutation, internalMutation, httpAction} = createServerFunctions(
  {
    QueryCtx,
    MutationCtx,
  },
)

export const {model} = createModelFunction({schema, QueryCtx, MutationCtx})
