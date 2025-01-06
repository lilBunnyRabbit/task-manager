import { Task } from "./task";
import type { TaskBuilder } from "./task-builder";
import type { TaskSpec } from "./task.type";

/**
 * Type guard function to check if an object is an instance of {@link Task}.
 *
 * @template TData - Type of input data the task requires.
 * @template TResult - Type of result the task produces.
 * @template TError - Type of error the task may encounter.
 *
 * @param task - Object to check.
 * @param taskBuilder - {@link TaskBuilder} to compare against.
 *
 * @returns `true` if the object is an instance of {@link Task}.
 */
export function isTask<TSpec extends TaskSpec>(task: unknown, taskBuilder: TaskBuilder<TSpec>): task is Task<TSpec> {
  return task instanceof Task && task.builder.id === taskBuilder.id;
}
