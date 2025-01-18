import { v4 as uuidv4 } from "uuid";
import type { BuilderIs, ExecutableTask, ExecutionMode } from "../../common";
import { TaskGroup } from "./task-group";
import { isTaskGroup } from "./task-group.helper";
import type { TaskGroupFlag } from "./task-group.type";

/**
 * Configuration for creating a {@link TaskGroup}.
 *
 * @template TArgs - Arguments used to create the task group.
 */
export type TaskGroupConfig<TArgs extends unknown[] = []> = {
  /**
   * Name of the task group.
   */
  name: string;
  /**
   * Execution mode for the task group.
   */
  mode?: ExecutionMode;
  /**
   * Flags controlling the behavior of the task group.
   */
  flags?: TaskGroupFlag[];
  /**
   * Function to create tasks for the task group.
   *
   * @param args - Arguments used to create the tasks.
   * @returns An array of tasks for the group.
   */
  create(...args: TArgs): ExecutableTask[];
};

/**
 * Builder interface for creating {@link TaskGroup} instances.
 *
 * @template TArgs - Arguments used to create the task group.
 */
export interface TaskGroupBuilder<TArgs extends unknown[] = []> extends BuilderIs<TaskGroup<TArgs>> {
  /**
   * Creates a new {@link TaskGroup} instance.
   *
   * @param args - Arguments used to create the task group.
   * @returns A new {@link TaskGroup} instance.
   */
  (...args: TArgs): TaskGroup<TArgs>;
  /**
   * Unique identifier for the task group builder.
   */
  id: string;
  /**
   * Name of the task group.
   */
  taskGroupName: string;
  /**
   * Converts the task group builder to a string representation.
   *
   * @param pretty - If `true`, formats the string for readability.
   * @returns A string representing the task group builder.
   */
  toString(pretty?: boolean): string;
}

/**
 * Factory function to create a {@link TaskGroupBuilder}.
 *
 * @template TArgs - Arguments used to create the task group.
 * @param config - Configuration for creating the task group.
 * @returns A new {@link TaskGroupBuilder} instance.
 */
export function createTaskGroup<TArgs extends unknown[] = []>({ name, ...config }: TaskGroupConfig<TArgs>) {
  const builder: TaskGroupBuilder<TArgs> = function (...args) {
    const taskGroup = new TaskGroup(builder, args, name, config.mode, config.create(...args));

    taskGroup.flags = new Set(config.flags);

    return taskGroup;
  };

  builder.id = uuidv4();
  builder.taskGroupName = name;
  builder.toString = function (pretty?: boolean) {
    if (pretty === true) {
      return `TaskGroupBuilder {\n\tname: ${JSON.stringify(this.taskGroupName)},\n\tid: "${this.id}"\n}`;
    }

    return `TaskGroupBuilder { name: ${JSON.stringify(this.taskGroupName)}, id: "${this.id}" }`;
  };
  builder.is = (taskGroup: unknown) => isTaskGroup(taskGroup, builder);

  return builder;
}
