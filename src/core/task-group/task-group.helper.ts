import { TaskGroup } from "./task-group";
import type { TaskGroupBuilder } from "./task-group-builder";

/**
 * Type guard to check if an object is an instance of {@link TaskGroup}.
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
