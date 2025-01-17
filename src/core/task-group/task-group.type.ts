import type { ExecutableTask, TasksError } from "../../common";
import type { FlowState } from "../flow-controller";
import type { TaskGroup } from "./task-group";

/**
 * Possible statuses of a {@link TaskGroup}.
 */
export type TaskGroupStatus = "idle" | "in-progress" | "error" | "success";

/**
 * Flags that control the behavior of a {@link TaskGroup}.
 */
export const TaskGroupFlag = {
  /**
   * Continues execution even if a task fails.
   */
  CONTINUE_ON_ERROR: "CONTINUE_ON_ERROR",
} as const;

export type TaskGroupFlag = (typeof TaskGroupFlag)[keyof typeof TaskGroupFlag];

/**
 * Events emitted by a {@link TaskGroup}.
 */
export type TaskGroupEvents = {
  param: "status" | "progress" | "flags";
  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
  /**
   * Emitted when task progress is updated.
   *
   * @type {number} The new progress value.
   */
  progress: number;

  /**
   * Emitted when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emitted when a task or the task group encounters an error.
   *
   * @type {TasksError | Error} The encountered error.
   */
  error: TasksError | TasksError | Error;
};
