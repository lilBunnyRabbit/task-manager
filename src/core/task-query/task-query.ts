import type { Task, TaskBuilder, TaskGroup, TaskSpec } from "../";
import type { BuilderIs } from "../../common";

/**
 * Provides methods to query, retrieve, and manage tasks and their results from a collection.
 */
export class TaskQuery {
  /**
   * Initializes the query interface with a list of tasks or task groups.
   *
   * @param tasks - An array of {@link Task} or {@link TaskGroup} instances.
   */
  constructor(readonly tasks: Array<Task | TaskGroup>) {}

  /**
   * Finds the first task that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task, or `undefined` if not found.
   */
  public find<T>(builder: BuilderIs<T>) {
    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (builder.is(task)) {
        return task;
      }
    }
  }

  /**
   * Retrieves the first task that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task.
   * @throws If the task is not found.
   */
  public get<T>(builder: BuilderIs<T>) {
    const task = this.find(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  /**
   * Finds the last task that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task, or `undefined` if not found.
   */
  public findLast<T>(builder: BuilderIs<T>) {
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task: unknown = this.tasks[i];
      if (builder.is(task)) {
        return task;
      }
    }
  }

  /**
   * Retrieves the last task that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task.
   * @throws If the task is not found.
   */
  public getLast<T>(builder: BuilderIs<T>) {
    const task = this.findLast(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  /**
   * Retrieves all tasks that match the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the tasks.
   * @returns An array of matching tasks.
   */
  public getAll<T>(builder: BuilderIs<T>) {
    return this.tasks.filter((task) => builder.is(task)) as T[];
  }

  // Task

  /**
   * Retrieves the result of the first task that matches the provided builder.
   *
   * @template TSpec - Specification of the task.
   * @param taskBuilder - Builder used to identify the task.
   * @returns The result of the task.
   * @throws If the task is not found or its result is empty.
   */
  public getResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.get(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

  /**
   * Retrieves the result of the last task that matches the provided builder.
   *
   * @template TSpec - Specification of the task.
   * @param taskBuilder - Builder used to identify the task.
   * @returns The result of the task.
   * @throws If the task is not found or its result is empty.
   */
  public getLastResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.getLast(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

  /**
   * Retrieves the results of all tasks that match the provided builder.
   *
   * @template TSpec - Specification of the task.
   * @param taskBuilder - Builder used to identify the tasks.
   * @returns An array of results from the matching tasks.
   * @throws If any task result is empty.
   */
  public getResults<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>): NonNullable<TSpec["TResult"]>[] {
    const results: NonNullable<TSpec["TResult"]>[] = [];

    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (taskBuilder.is(task)) {
        if (task.result.isEmpty()) {
          throw new Error(`${task} result is empty.`);
        }

        results.push(task.result.get());
      }
    }

    return results;
  }
}
