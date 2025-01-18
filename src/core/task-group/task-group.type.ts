import type { ExecutableTask, TaskError, TasksError } from "../../common";
import type { FlowState } from "../flow-controller";
import type { TaskGroup } from "./task-group";

/**
 * Statuses of a {@link TaskGroup}.
 */
export type TaskGroupStatus = "idle" | "in-progress" | "error" | "success";

/**
 * Flags controlling the behavior of a {@link TaskGroup}.
 */
export const TaskGroupFlag = {
  /**
   * Continues execution even if a task fails.
   */
  CONTINUE_ON_ERROR: "CONTINUE_ON_ERROR",
} as const;

export type TaskGroupFlag = (typeof TaskGroupFlag)[keyof typeof TaskGroupFlag];

/**
 * Events emitted by {@link TaskGroup}.
 */
export type TaskGroupEvents = {
  /**
   * Emitted when a parameter changes.
   */
  param: "status" | "progress" | "flags";
  /**
   * Emitted when a task transitions between states in the flow.
   *
   * @property from - Previous state of the task (optional).
   * @property to - New state of the task (optional).
   * @property task - Task undergoing the state transition.
   */
  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
  /**
   * Emitted when the progress of the task group is updated.
   *
   * @type {number} - The new progress value.
   */
  progress: number;
  /**
   * Emitted when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emitted when a task or the task group encounters an error.
   *
   * @type {TaskError | TasksError | Error} - The encountered error.
   */
  error: TaskError | TasksError | Error;
};
