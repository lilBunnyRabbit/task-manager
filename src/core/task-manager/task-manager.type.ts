import type { ExecutableTask, TaskError, TasksError } from "../../common";
import type { FlowState } from "../flow-controller";
import type { TaskManager } from "./task-manager";

/**
 * Statuses for a {@link TaskManager}.
 */
export type TaskManagerStatus = "idle" | "in-progress" | "error" | "success" | "stopped";

/**
 * Flags controlling the behavior of a {@link TaskManager}.
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
 * Events emitted by {@link TaskManager}.
 */
export type TaskManagerEvents = {
  /**
   * Emitted when a parameter changes.
   */
  param: "status" | "progress" | "flags" | "mode";
  /**
   * Emitted when a task transitions between states.
   *
   * @property from - Previous state of the task (optional).
   * @property to - New state of the task (optional).
   * @property task - Task undergoing the state transition.
   */
  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
  /**
   * Emitted when task progress updates.
   *
   * @type {number} - The updated progress value.
   */
  progress: number;
  /**
   * Emitted when all tasks in the queue are successfully executed.
   */
  success: void;
  /**
   * Emitted when a task or the task manager encounters an error.
   *
   * @type {TaskError | TasksError | Error} - The encountered error.
   */
  error: TaskError | TasksError | Error;
  /**
   * Emitted when a task fails and the `CONTINUE_ON_ERROR` flag is not set.
   *
   * @type {TaskError | TasksError | Error} - The error that caused the failure.
   */
  fail: TaskError | TasksError | Error;
};
