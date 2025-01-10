import { v4 as uuidv4 } from "uuid";
import { BuilderIs } from "../task-group/task-group-builder";
import { Task } from "./task";
import { isTask } from "./task.helper";
import type { ParsedTask, TaskSpec } from "./task.type";

/**
 * Configuration interface for creating a {@link Task}.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskConfig<TSpec extends TaskSpec> {
  /**
   * Name of the task.
   */
  name: string;
  /**
   * Function to parse the task's outcome into a {@link ParsedTask} object.
   */
  parse?: (this: Task<TSpec>) => ParsedTask;
  /**
   * Core function to execute the task, returning a result or a promise.
   */
  execute: (this: Task<TSpec>, data: TSpec["TData"]) => TSpec["TResult"] | Promise<TSpec["TResult"]>;
}

/**
 * Interface for a function that builds {@link Task} instances.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskBuilder<TSpec extends TaskSpec> extends BuilderIs<Task<TSpec>> {
  /**
   * Function that builds {@link Task} instances.
   *
   * @param data - Data to be passed to the task for execution.
   *
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
}

/**
 * Factory function to create a new {@link TaskBuilder}, used to create {@link Task} instances.
 *
 * @template TData - Type of input data the task requires.
 * @template TResult - Type of result the task produces.
 * @template TError - Type of error the task may encounter.
 * @param config - Configuration object for creating the task.
 *
 * @returns A new task builder with the given configuration.
 */
export function createTask<TData = void, TResult = void, TError = Error>({
  name,
  ...config
}: TaskConfig<TaskSpec<TData, TResult, TError>>) {
  const builder: TaskBuilder<TaskSpec<TData, TResult, TError>> = function (data) {
    return new Task<TaskSpec<TData, TResult, TError>>(builder, name, config, data);
  };

  builder.id = uuidv4();
  builder.taskName = name;
  builder.toString = function () {
    return `TaskBuilder {\n\tname: ${JSON.stringify(this.taskName)},\n\tid: "${this.id}"\n}`;
  };
  builder.is = (task: unknown) => isTask(task, builder);

  return builder;
}
