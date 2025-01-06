import { isTask, Task, TaskBuilder } from "../task";
import { TaskSpec } from "../task/task.type";
import { ExecutionBase } from "./execution-base";

export class ExecutionQuery<
  TParsed,
  TStatus extends string,
  TFlag extends Record<string, string>
> extends ExecutionBase<TParsed, TStatus, TFlag> {
  /**
   * Finds a task in the list of tasks.
   *
   * @param taskBuilder - The builder of the task to find.
   *
   * @returns The found task or undefined.
   */
  public findTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (isTask(task, taskBuilder)) {
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
  public getTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    const task = this.findTask(taskBuilder);

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
  public getTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    const task = this.getTask(taskBuilder);

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
  public findLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
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
  public getLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    const task = this.findLastTask(taskBuilder);

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
  public getLastTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    const task = this.getLastTask(taskBuilder);

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
  public findTasks<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec, TParsed>) {
    return this.tasks.filter((task) => isTask<TSpec, TParsed>(task, taskBuilder)) as unknown as Task<TSpec, TParsed>[];
  }

  /**
   * Retrieves the results of all tasks of a specific type.
   *
   * @param taskBuilder - The builder of the task type whose results to retrieve.
   *
   * @returns Array of results.
   * @throws If any of the task results is empty.
   */
  public getTasksResults<TSpec extends TaskSpec>(
    taskBuilder: TaskBuilder<TSpec, TParsed>
  ): NonNullable<TSpec["TResult"]>[] {
    const results: NonNullable<TSpec["TResult"]>[] = [];

    for (let i = 0; i < this.tasks.length; i++) {
      const task: unknown = this.tasks[i];
      if (isTask(task, taskBuilder)) {
        if (task.result.isEmpty()) {
          throw new Error(`${task} result is empty.`);
        }

        results.push(task.result.get());
      }
    }

    return results;
  }
}
