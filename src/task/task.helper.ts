import { Task } from "./task";
import { TaskBuilder } from "./task-builder";
import { TaskSpec } from "./task.type";

/**
 * Creates a unique identifier for a task based on its name and the current time.
 * Combines a random hex string, task name in hex, and current time in hex.
 *
 * @param name - Name of the task.
 *
 * @returns Unique task identifier.
 */
export function createTaskId(name: string) {
  // TODO: Replace `createTaskId` with UUID?

  const randomHex = Math.floor(Math.random() * Date.now() * name.length)
    .toString(16)
    .padEnd(12, "0");
  const nameHex = [...name].map((c) => c.charCodeAt(0).toString(16)).join("");
  const timeHex = Date.now().toString(16).padStart(12, "0");

  return `${randomHex}-${nameHex}-${timeHex}`;
}

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
