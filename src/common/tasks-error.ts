/**
 * Represents an error associated with a specific {@link Task}.
 */
export class TasksError extends Error {
  /**
   * Creates a new {@link TasksError}.
   *
   * @param task - The {@link Task} instance that caused the error.
   * @param error - The original error object or message.
   */
  constructor(readonly errors: any[]) {
    super(errors.map((e) => e.message).join(", "));
  }
}

/**
 * Type guard to check if an object is an instance of {@link TasksError}.
 *
 * @param error - Object to check.
 * @returns `true` if the object is a {@link TasksError}, otherwise `false`.
 */
export function isTasksError(error: unknown): error is TasksError {
  return error instanceof TasksError;
}
