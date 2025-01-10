import { TaskGroup } from "./task-group";
import { TaskGroupBuilder } from "./task-group-builder";

export function isTaskGroup<TArgs extends unknown[]>(
  taskGroup: unknown,
  taskGroupBuilder: TaskGroupBuilder<TArgs>
): taskGroup is TaskGroup<TArgs> {
  return taskGroup instanceof TaskGroup && taskGroup.builder.id === taskGroupBuilder.id;
}
