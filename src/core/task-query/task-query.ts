import { Optional } from "@lilbunnyrabbit/optional";
import type { TaskBuilder, TaskSpec } from "../";
import type { BuilderIs } from "../../common";
import type { FlowController } from "../flow-controller";

/**
 * Provides methods to query, retrieve, and manage tasks and their results within a {@link FlowController}.
 */
export class TaskQuery {
  /**
   * Parent {@link TaskQuery} instance.
   */
  private _parent: Optional<TaskQuery> = Optional.empty();

  /**
   * Parent {@link TaskQuery} instance.
   */
  public get parent() {
    return this._parent;
  }

  /**
   * Initializes the TaskQuery with a {@link FlowController}.
   *
   * @param controller - The flow controller managing the tasks.
   */
  constructor(private controller: FlowController) {}

  /**
   * Finds the first task in the `completed` collection that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task, or `undefined` if not found.
   */
  public find<T>(builder: BuilderIs<T>) {
    const completedTasks = this.controller.completed.values();
    for (const { task, valid } of completedTasks) {
      if (valid && builder.is(task)) {
        return task as T;
      }
    }
  }

  /**
   * Retrieves the first task in the `completed` collection that matches the provided builder.
   *
   * This method behaves the same as {@link find}, except it throws an error if no task is found.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task.
   * @throws If no task is found.
   */
  public get<T>(builder: BuilderIs<T>) {
    const task = this.find(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  /**
   * Finds the last task in the `completed` collection that matches the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task, or `undefined` if not found.
   */
  public findLast<T>(builder: BuilderIs<T>) {
    // TODO: No optimal way of reverse looping?
    let lastTask: T | undefined;

    const completedTasks = this.controller.completed.values();
    for (const { valid, task } of completedTasks) {
      if (valid && builder.is(task)) {
        lastTask = task;
      }
    }

    return lastTask;
  }

  /**
   * Retrieves the last task in the `completed` collection that matches the provided builder.
   *
   * This method behaves the same as {@link findLast}, except it throws an error if no task is found.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the task.
   * @returns The matching task.
   * @throws If no task is found.
   */
  public getLast<T>(builder: BuilderIs<T>) {
    const task = this.findLast(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  /**
   * Retrieves all tasks in the `completed` collection that match the provided builder.
   *
   * @template T - Type of the task.
   * @param builder - Builder used to identify the tasks.
   * @returns An array of matching tasks.
   */
  public getAll<T>(builder: BuilderIs<T>) {
    const tasks: T[] = [];

    const completedTasks = this.controller.completed.values();
    for (const { valid, task } of completedTasks) {
      if (valid && builder.is(task)) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  // Task

  /**
   * Retrieves the result of the first task in the `completed` collection that matches the provided builder.
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
   * Retrieves the result of the last task in the `completed` collection that matches the provided builder.
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
   * Retrieves the results of all tasks in the `completed` collection that match the provided builder.
   *
   * @template TSpec - Specification of the task.
   * @param taskBuilder - Builder used to identify the tasks.
   * @returns An array of results from the matching tasks.
   * @throws If any task result is empty.
   */
  public getResults<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>): NonNullable<TSpec["TResult"]>[] {
    const results: NonNullable<TSpec["TResult"]>[] = [];

    const completedTasks = this.controller.completed.values();
    for (const { valid, task } of completedTasks) {
      if (valid && taskBuilder.is(task)) {
        if (task.result.isEmpty()) {
          throw new Error(`${task} result is empty.`);
        }

        results.push(task.result.get());
      }
    }

    return results;
  }
}
