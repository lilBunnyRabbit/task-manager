import type { EventMap } from "@lilbunnyrabbit/event-emitter";
import type { TaskError } from "../../helpers/task-error";
import type { Task, TaskSpec } from "../task";
import type { TaskManager } from "./task-manager";
import { TaskGroup } from "../task-group/task-group";

export type ExecutableTask = Task<TaskSpec<any, any>> | TaskGroup<any[]>;

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

export interface TaskManagerEvents extends EventMap {
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
   * Emits when a task fails and `FAIL_ON_ERROR` flag is set.
   */
  fail: TaskError | Error;
  /**
   * Emits when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emits when task throws.
   */
  error: TaskError | Error;
}
