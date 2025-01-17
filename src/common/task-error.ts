import type { Task } from "../core";
import { ExecutableTask } from "./execution.type";

/**
 * Represents an error associated with a specific {@link Task}.
 */
export class TaskError extends Error {
  /**
   * Creates a new {@link TasksError}.
   *
   * @param task - The {@link Task} instance that caused the error.
   * @param error - The original error object or message.
   */
  constructor(readonly task: ExecutableTask, readonly error: any) {
    super(`${task} error.`);

    this.name = "TaskError";
  }
}

/**
 * Type guard to check if an object is an instance of {@link TasksError}.
 *
 * @param error - Object to check.
 * @returns `true` if the object is a {@link TasksError}, otherwise `false`.
 */
export function isTaskError(error: unknown): error is TaskError {
  return error instanceof TaskError;
}
