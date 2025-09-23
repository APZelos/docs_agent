import type {
  Scheduler as ConvexScheduler,
  OptionalRestArgs,
  SchedulableFunctionReference,
} from "convex/server"
import type {GenericId} from "convex/values"

import {Effect as E} from "effect"

/**
 * An interface to schedule Convex functions.
 *
 * This Effect-based wrapper provides composable function scheduling that returns
 * Effects instead of Promises, enabling functional composition and error handling.
 *
 * You can schedule either mutations or actions. Mutations are guaranteed to execute
 * exactly once - they are automatically retried on transient errors and either execute
 * successfully or fail deterministically due to developer error in defining the
 * function. Actions execute at most once - they are not retried and might fail
 * due to transient errors.
 *
 * Consider using an {@link internalMutation} or {@link internalAction} to enforce that
 * these functions cannot be called directly from a Convex client.
 */
export class Scheduler {
  convexScheduler: ConvexScheduler

  constructor(convexScheduler: ConvexScheduler) {
    this.convexScheduler = convexScheduler
  }

  /**
   * Schedule a function to execute after a delay.
   *
   * @param delayMs - Delay in milliseconds. Must be non-negative. If the delay
   * is zero, the scheduled function will be due to execute immediately after the
   * scheduling one completes.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - Arguments to call the scheduled functions with.
   * @returns An Effect that yields the scheduled function's ID.
   */
  runAfter<FuncRef extends SchedulableFunctionReference>(
    delayMs: number,
    functionReference: FuncRef,
    ...args: OptionalRestArgs<FuncRef>
  ): E.Effect<GenericId<"_scheduled_functions">, never, never> {
    return E.promise(async () => this.convexScheduler.runAfter(delayMs, functionReference, ...args))
  }

  /**
   * Schedule a function to execute at a given timestamp.
   *
   * @param timestamp - A Date or a timestamp (milliseconds since the epoch).
   * If the timestamp is in the past, the scheduled function will be due to
   * execute immediately after the scheduling one completes. The timestamp can't
   * be more than five years in the past or more than five years in the future.
   * @param functionReference - A {@link FunctionReference} for the function
   * to schedule.
   * @param args - arguments to call the scheduled functions with.
   * @returns An Effect that yields the scheduled function's ID.
   */
  runAt<FuncRef extends SchedulableFunctionReference>(
    timestamp: number | Date,
    functionReference: FuncRef,
    ...args: OptionalRestArgs<FuncRef>
  ): E.Effect<GenericId<"_scheduled_functions">, never, never> {
    return E.promise(async () => this.convexScheduler.runAt(timestamp, functionReference, ...args))
  }

  /**
   * Cancels a previously scheduled function if it has not started yet. If the
   * scheduled function is already in progress, it will continue running but
   * any new functions that it tries to schedule will be canceled.
   *
   * @param id - The ID of the scheduled function to cancel.
   * @returns An Effect that completes when the cancellation is processed.
   */
  cancel(id: GenericId<"_scheduled_functions">): E.Effect<void, never, never> {
    return E.promise(async () => this.convexScheduler.cancel(id))
  }
}
