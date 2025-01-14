import type { Task } from "../core";

/**
 * Represents an error associated with a specific {@link Task}.
 */
export class TaskError extends Error {
  /**
   * Creates a new {@link TaskError}.
   *
   * @param task - The {@link Task} instance that caused the error.
   * @param error - The original error object or message.
   */
  constructor(readonly task: Task, readonly error: any) {
    super(`${task} error.`);
  }
}

/**
 * Type guard to check if an object is an instance of {@link TaskError}.
 *
 * @param error - Object to check.
 * @returns `true` if the object is a {@link TaskError}, otherwise `false`.
 */
export function isTaskError(error: unknown): error is TaskError {
  return error instanceof TaskError;
}
