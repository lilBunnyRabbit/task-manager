import type { TaskManager } from "./task-manager";

/**
 * Possible statuses of a {@link TaskManager}.
 */
export type TaskManagerStatus = "idle" | "in-progress" | "fail" | "success" | "stopped";

/**
 * Flags that control the behavior of the {@link TaskManager}.
 */
export enum TaskManagerFlag {
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
