import type {DataModel} from "./_generated/dataModel"

import {createActionCtx, createFunctions, createMutationCtx, createQueryCtx} from "../../server"

export const QueryCtx = createQueryCtx<DataModel>()
export const MutationCtx = createMutationCtx<DataModel>()
export const ActionCtx = createActionCtx<DataModel>()

export const {query, internalQuery, mutation, internalMutation, httpAction} =
  createFunctions<DataModel>({QueryCtx, MutationCtx})
