import { Task } from "./task";
import { createTaskId } from "./task.helper";
import { ParsedTask } from "./task.type";

/**
 * Configuration interface for creating a {@link Task}.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskConfig<TData, TResult, TError> {
  /**
   * Name of the task.
   */
  name: string;
  /**
   * Function to parse the task's outcome into a {@link ParsedTask} object.
   */
  parse?: (this: Task<TData, TResult, TError>) => ParsedTask;
  /**
   * Core function to execute the task, returning a result or a promise.
   */
  execute: (this: Task<TData, TResult, TError>, data: TData) => TResult | Promise<TResult>;
}

/**
 * Interface for a function that builds {@link Task} instances.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskBuilder<TData, TResult, TError> {
  /**
   * Function that builds {@link Task} instances.
   *
   * @param data - Data to be passed to the task for execution.
   *
   * @returns A new {@link Task} instance.
   */
  (data: TData): Task<TData, TResult, TError>;

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
}: TaskConfig<TData, TResult, TError>): TaskBuilder<TData, TResult, TError> {
  const builder: TaskBuilder<TData, TResult, TError> = function (data) {
    return new Task<TData, TResult, TError>(builder, name, config, data);
  };
  builder.id = createTaskId(name);
  builder.taskName = name;
  builder.toString = function () {
    return `TaskBuilder { name: ${JSON.stringify(this.taskName)}, id: #${this.id} }`;
  };

  return builder;
}
