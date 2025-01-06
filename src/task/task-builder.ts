import { Task } from "./task";
import { createTaskId } from "./task.helper";
import { ParsedTask, TaskSpec } from "./task.type";

/**
 * Configuration interface for creating a {@link Task}.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskConfig<TSpec extends TaskSpec, TParsed> {
  /**
   * Name of the task.
   */
  name: string;
  /**
   * Function to parse the task's outcome into a {@link ParsedTask} object.
   */
  parse?: (this: Task<TSpec, TParsed>) => ParsedTask<TParsed>;
  /**
   * Core function to execute the task, returning a result or a promise.
   */
  execute: (this: Task<TSpec, TParsed>, data: TSpec["TData"]) => TSpec["TResult"] | Promise<TSpec["TResult"]>;
}

/**
 * Interface for a function that builds {@link Task} instances.
 *
 * @template TData - Input data type for the task.
 * @template TResult - Result type the task produces.
 * @template TError - Error type that may be encountered during execution.
 */
export interface TaskBuilder<TSpec extends TaskSpec, TParsed> {
  /**
   * Function that builds {@link Task} instances.
   *
   * @param data - Data to be passed to the task for execution.
   *
   * @returns A new {@link Task} instance.
   */
  (data: TSpec["TData"]): Task<TSpec, TParsed>;

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
export function createTask<TData = void, TResult = void, TParsed = string, TError = Error>({
  name,
  ...config
}: TaskConfig<TaskSpec<TData, TResult, TError>, TParsed>) {
  const builder: TaskBuilder<TaskSpec<TData, TResult, TError>, TParsed> = function (data) {
    return new Task<TaskSpec<TData, TResult, TError>, TParsed>(builder, name, config, data);
  };

  builder.id = createTaskId(name);
  builder.taskName = name;
  builder.toString = function () {
    return `TaskBuilder {\n\tname: ${JSON.stringify(this.taskName)},\n\tid: "${this.id}"\n}`;
  };

  return builder;
}
