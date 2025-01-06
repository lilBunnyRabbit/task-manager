import type { ExecutionManager } from "./execution-manager";

/**
 * Possible statuses of a {@link ExecutionManager}.
 */
export type ExecutionManagerStatus = "idle" | "in-progress" | "fail" | "success" | "stopped";

/**
 * Flags that control the behavior of the {@link ExecutionManager}.
 */
export enum ExecutionManagerFlag {
  /**
   * Indicates that the execution loop should stop.
   */
  STOP = "STOP",

  /**
   * Stops execution if any task fails.
   */
  FAIL_ON_ERROR = "FAIL_ON_ERROR",

  /**
   * Enables parallel execution of tasks.
   */
  PARALLEL_EXECUTION = "PARALLEL_EXECUTION",
}
