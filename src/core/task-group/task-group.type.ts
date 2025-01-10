import type { EventMap } from "@lilbunnyrabbit/event-emitter";
import type { TaskError } from "../../helpers/task-error";
import type { Task } from "../task";
import type { TaskGroup } from "./task-group";
import { ExecutableTask } from "../task-manager/task-manager.type";

/**
 * Possible statuses of a {@link TaskGroup}.
 */
export type TaskGroupStatus = "idle" | "in-progress" | "error" | "success";

/**
 * Flags that control the behavior of the {@link TaskGroup}.
 */
export enum TaskGroupFlag {
  /**
   * Stops execution if any task fails.
   */
  FAIL_ON_ERROR = "FAIL_ON_ERROR",
}

export enum TaskGroupMode {
  /**
   * Enables parallel execution of tasks.
   */
  PARALLEL = "PARALLEL",
  /**
   * Enables parallel execution of tasks.
   */
  LINEAR = "PARALLEL",
}

export interface TaskGroupEvents extends EventMap {
  /**
   * Emits when any state (status, progress, or flags) of the manager changes.
   */
  change: void;
  /**
   * Emits when task progress is updated.
   */
  progress: number;
  /**
   * Emits when a new task is in progress.
   */
  task: ExecutableTask;
  /**
   * Emits when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emits when task throws.
   */
  error: TaskError | Error;
}
