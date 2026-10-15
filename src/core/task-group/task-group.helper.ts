import { TaskGroup } from "./task-group.js";
import type { TaskGroupBuilder } from "./task-group-builder.js";

/**
 * Checks if an object is an instance of {@link TaskGroup}.
 *
 * @template TArgs - Arguments used to create the task group.
 * @param taskGroup - Object to check.
 * @param taskGroupBuilder - Builder used to create the task group.
 * @returns `true` if the object is an instance of {@link TaskGroup}.
 */
export function isTaskGroup<TArgs extends unknown[]>(
  taskGroup: unknown,
  taskGroupBuilder: TaskGroupBuilder<TArgs>
): taskGroup is TaskGroup<TArgs> {
  return taskGroup instanceof TaskGroup && taskGroup.builder.id === taskGroupBuilder.id;
}
