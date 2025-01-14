import type { EventMap } from "@lilbunnyrabbit/event-emitter";
import type { ExecutableTask, TaskError } from "../../common";
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
export interface TaskGroupEvents extends EventMap {
  /**
   * Emitted when any state (status, progress, or flags) of the task group changes.
   */
  change: void;
  /**
   * Emitted when task progress is updated.
   *
   * @type {number} The new progress value.
   */
  progress: number;
  /**
   * Emitted when a new task is in progress.
   *
   * @type {ExecutableTask} The task that is now in progress.
   */
  task: ExecutableTask;
  /**
   * Emitted when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emitted when a task or the task group encounters an error.
   *
   * @type {TaskError | Error} The encountered error.
   */
  error: TaskError | Error;
}
