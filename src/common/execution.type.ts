import type { Task, TaskGroup } from "../core";

/**
 * Defines the execution modes for tasks.
 */
export const ExecutionMode = {
  /**
   * Executes tasks in parallel.
   */
  PARALLEL: "parallel",
  /**
   * Executes tasks sequentially.
   */
  LINEAR: "linear",
} as const;

export type ExecutionMode = (typeof ExecutionMode)[keyof typeof ExecutionMode];

/**
 * Represents a task that can be executed, which could be a single {@link Task} or a {@link TaskGroup}.
 */
export type ExecutableTask = Task<any> | TaskGroup<any[]>;

/**
 * Interface for builder type-checking.
 *
 * @template TValue - The type of value to check.
 */
export interface BuilderIs<TValue> {
  /**
   * Checks if the provided task is of the specified type.
   *
   * @param task - Object to check.
   * @returns `true` if the task is of the specified type.
   */
  is(task: unknown): task is TValue;
}
