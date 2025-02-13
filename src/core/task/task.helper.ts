import { Task } from "./task";
import type { TaskBuilder } from "./task-builder";
import type { TaskSpec } from "./task.type";

/**
 * Checks if an object is an instance of {@link Task}.
 *
 * @template TSpec - Task specification type.
 * @param task - Object to check.
 * @param taskBuilder - Builder used to create the task.
 * @returns `true` if the object is a {@link Task}.
 */
export function isTask<TSpec extends TaskSpec>(task: unknown, taskBuilder: TaskBuilder<TSpec>): task is Task<TSpec> {
  return task instanceof Task && task.builder.id === taskBuilder.id;
}
