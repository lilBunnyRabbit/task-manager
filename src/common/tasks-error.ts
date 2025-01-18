import type { TaskError } from "./task-error";

/**
 * Error containing one or more nested errors, including {@link TaskError}, other {@link TasksError}, or general {@link Error} instances.
 */
export class TasksError extends Error {
  /**
   * Creates a new `TasksError`.
   *
   * @param errors - Array of errors, which can include {@link TaskError}, {@link TasksError}, or general {@link Error} instances.
   */
  constructor(readonly errors: Array<TaskError | TasksError | Error>) {
    super(errors.map((e) => e.message).join(", "));
  }
}

/**
 * Checks if an object is an instance of {@link TasksError}.
 *
 * @param error - Object to check.
 * @returns `true` if the object is a {@link TasksError}, otherwise `false`.
 */
export function isTasksError(error: unknown): error is TasksError {
  return error instanceof TasksError;
}
