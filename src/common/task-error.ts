import type { ExecutableTask } from "./execution.type";

/**
 * Error linked to a specific {@link ExecutableTask}.
 */
export class TaskError extends Error {
  /**
   * Creates a new `TaskError`.
   *
   * @param task - Task instance that caused the error.
   * @param error - Original error object or message.
   */
  constructor(readonly task: ExecutableTask, readonly error: any) {
    super(`${task} error.`);

    this.name = "TaskError";
  }
}

/**
 * Checks if an object is an instance of {@link TaskError}.
 *
 * @param error - Object to check.
 * @returns `true` if the object is a {@link TaskError}, otherwise `false`.
 */
export function isTaskError(error: unknown): error is TaskError {
  return error instanceof TaskError;
}
