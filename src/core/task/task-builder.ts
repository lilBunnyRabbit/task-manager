import { v4 as uuidv4 } from "uuid";
import { BuilderIs } from "../../common";
import { Task } from "./task";
import { isTask } from "./task.helper";
import type { ParsedTask, TaskSpec } from "./task.type";

/**
 * Configuration for creating a {@link Task}.
 *
 * @template TSpec - Task specification type.
 */
export interface TaskConfig<TSpec extends TaskSpec> {
  /**
   * Name of the task.
   */
  name: string;
  /**
   * Function to parse the task's outcome into a {@link ParsedTask}.
   */
  parse?: (this: Task<TSpec>) => ParsedTask;
  /**
   * Function to execute the task, returning a result or a promise.
   */
  execute: (this: Task<TSpec>, data: TSpec["TData"]) => TSpec["TResult"] | Promise<TSpec["TResult"]>;
}

/**
 * Interface for a function that builds {@link Task} instances.
 *
 * @template TSpec - Task specification type.
 */
export interface TaskBuilder<TSpec extends TaskSpec> extends BuilderIs<Task<TSpec>> {
  /**
   * Builds a new {@link Task} instance.
   *
   * @param data - Input data for the task.
   * @returns A new {@link Task} instance.
   */
  (data: TSpec["TData"]): Task<TSpec>;

  /**
   * Unique identifier of the task builder.
   */
  id: string;
  /**
   * Name of the task.
   */
  taskName: string;
  toString(pretty?: boolean): string;
}

/**
 * Factory function to create a new {@link TaskBuilder}, used to create {@link Task} instances.
 *
 * @template TData - Type of input data the task requires.
 * @template TResult - Type of result the task produces.
 * @param config - Configuration object for creating the task.
 * @returns A new {@link TaskBuilder} instance with the given configuration.
 */
export function createTask<TData = void, TResult = void>({ name, ...config }: TaskConfig<TaskSpec<TData, TResult>>) {
  const builder: TaskBuilder<TaskSpec<TData, TResult>> = function (data) {
    return new Task<TaskSpec<TData, TResult>>(builder, name, config, data);
  };

  builder.id = uuidv4();
  builder.taskName = name;
  builder.toString = function (pretty?: boolean) {
    if (pretty === true) {
      return `TaskBuilder {\n\tname: ${JSON.stringify(this.taskName)},\n\tid: "${this.id}"\n}`;
    }

    return `TaskBuilder { name: ${JSON.stringify(this.taskName)}, id: "${this.id}" }`;
  };
  builder.is = (task: unknown) => isTask(task, builder);

  return builder;
}
