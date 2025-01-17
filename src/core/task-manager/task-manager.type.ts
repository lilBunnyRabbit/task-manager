import type { ExecutableTask, TasksError } from "../../common";
import { FlowControllerEvents, FlowState } from "../flow-controller";
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
  /**
   * Emitted when any state (status, progress, or flags) of the manager changes.
   */
  change: void;
  /**
   * Emitted when task progress is updated.
   *
   * @type {number} - The new progress value.
   */
  progress: number;
  /**
   * Emitted when a new task starts execution.
   *
   * @type {ExecutableTask} - The task currently in progress.
   */
  task: ExecutableTask;
  /**
   * Emitted when a task fails and the `CONTINUE_ON_ERROR` flag is not set.
   *
   * @type {TasksError | Error} - The error that caused the failure.
   */
  fail: TasksError | Error;
  /**
   * Emitted when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emitted when a task or the task manager encounters an error.
   *
   * @type {TasksError | Error} - The error that occurred.
   */
  error: TasksError | Error;

  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
};
