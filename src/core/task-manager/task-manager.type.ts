import type { ExecutableTask, TaskError, TasksError } from "../../common";
import { FlowState } from "../flow-controller";
import type { TaskManager } from "./task-manager";

/**
 * Possible statuses of a {@link TaskManager}.
 */
export type TaskManagerStatus = "idle" | "in-progress" | "error" | "success" | "stopped";

/**
 * Flags that control the behavior of a {@link TaskManager}.
 */
export const TaskManagerFlag = {
  /**
   * Indicates that the execution loop should stop.
   */
  STOP: "STOP",
  /**
   * Continues execution even if a task fails.
   */
  CONTINUE_ON_ERROR: "CONTINUE_ON_ERROR",
} as const;

export type TaskManagerFlag = (typeof TaskManagerFlag)[keyof typeof TaskManagerFlag];

/**
 * Events emitted by a {@link TaskManager}.
 */
export type TaskManagerEvents = {
  param: "status" | "progress" | "flags" | "mode";

  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
  /**
   * Emitted when task progress is updated.
   *
   * @type {number} - The new progress value.
   */
  progress: number;
  /**
   * Emitted when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emitted when a task or the task manager encounters an error.
   *
   * @type {TasksError | Error} - The error that occurred.
   */
  error: TaskError | TasksError | Error;
  /**
   * Emitted when a task fails and the `CONTINUE_ON_ERROR` flag is not set.
   *
   * @type {TasksError | Error} - The error that caused the failure.
   */
  fail: TaskError | TasksError | Error;
};
