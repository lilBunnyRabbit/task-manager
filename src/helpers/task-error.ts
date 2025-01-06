import type { Task } from "../core/task";

export class TaskError extends Error {
  constructor(readonly task: Task, readonly error: any) {
    super(`${task} error.`);
  }
}

export function isTaskError(error: unknown): error is TaskError {
  return error instanceof TaskError;
}
