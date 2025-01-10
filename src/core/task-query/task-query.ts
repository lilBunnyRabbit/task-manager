import { isTask, Task, TaskBuilder, TaskSpec } from "../task";
import { TaskGroup } from "../task-group/task-group";
import { BuilderIs } from "../task-group/task-group-builder";

export class TaskQuery {
  constructor(readonly tasks: Array<Task | TaskGroup>) {}

  public find<T>(builder: BuilderIs<T>) {
    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (builder.is(task)) {
        return task;
      }
    }
  }

  public get<T>(builder: BuilderIs<T>) {
    const task = this.find(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  public findLast<T>(builder: BuilderIs<T>) {
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task: unknown = this.tasks[i];
      if (builder.is(task)) {
        return task;
      }
    }
  }

  public getLast<T>(builder: BuilderIs<T>) {
    const task = this.findLast(builder);

    if (!task) {
      throw new Error(`Task by ${builder} not found.`);
    }

    return task;
  }

  public getAll<T>(builder: BuilderIs<T>) {
    return this.tasks.filter((task) => builder.is(task)) as T[];
  }

  // Task
  public getResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.get(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

  public getLastResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.getLast(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

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

  // OLD

  /**
   * Finds a task in the list of tasks.
   *
   * @param taskBuilder - The builder of the task to find.
   *
   * @returns The found task or undefined.
   */
  public __findTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (taskBuilder.is(task)) {
        return task;
      }
    }
  }

  /**
   * Retrieves a task from the list of tasks.
   *
   * @param taskBuilder - The builder of the task to retrieve.
   *
   * @returns The retrieved task.
   * @throws If the task is not found.
   */
  public __getTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.__findTask(taskBuilder);

    if (!task) {
      throw new Error(`Task by ${taskBuilder} not found.`);
    }

    return task;
  }

  /**
   * Retrieves the result of a task.
   *
   * @param taskBuilder - The builder of the task whose result to retrieve.
   *
   * @returns The result of the task.
   * @throws If the task is not found or if the result is empty.
   */
  public __getTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.get(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

  /**
   * Finds the last task of a specific type in the list of tasks.
   *
   * @param taskBuilder - The builder of the task to find.
   * @returns The found task or undefined.
   */
  public __findLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task: unknown = this.tasks[i];
      if (isTask(task, taskBuilder)) {
        return task;
      }
    }
  }

  /**
   * Retrieves the last task of a specific type from the list of tasks.
   *
   * @param taskBuilder - The builder of the task to retrieve.
   *
   * @returns The retrieved task.
   * @throws If the task is not found.
   */
  public __getLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.__findLastTask(taskBuilder);

    if (!task) {
      throw new Error(`Task by ${taskBuilder} not found.`);
    }

    return task;
  }

  /**
   * Retrieves the result of the last task of a specific type.
   *
   * @param taskBuilder - The builder of the task whose result to retrieve.
   *
   * @returns The result of the task.
   * @throws If the task is not found or if the result is empty.
   */
  public __getLastTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    const task = this.getLast(taskBuilder);

    if (task.result.isEmpty()) {
      throw new Error(`${task} result is empty.`);
    }

    return task.result.get();
  }

  /**
   * Finds all tasks of a specific type in the list of tasks.
   *
   * @param taskBuilder - The builder of the task type to find.
   *
   * @returns Array of found tasks.
   */
  public __findTasks<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
    return this.tasks.filter((task) => isTask(task, taskBuilder)) as Task<TSpec>[];
  }

  /**
   * Retrieves the results of all tasks of a specific type.
   *
   * @param taskBuilder - The builder of the task type whose results to retrieve.
   *
   * @returns Array of results.
   * @throws If any of the task results is empty.
   */
  public __getTasksResults<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>): NonNullable<TSpec["TResult"]>[] {
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
