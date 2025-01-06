import type { Task, TaskBuilder } from "../task";
import { isTask } from "../task";
import type { TaskSpec } from "../task/task.type";
import { TaskManagerBase } from "./task-manager-base";
import { TaskManagerFlag } from "./task-manager.type";

/**
 * Manages task execution, including adding tasks to the queue, controlling task progress, and handling task lifecycle events.
 * Supports executing tasks sequentially or in parallel and provides methods to query, retrieve, and manage task results.
 *
 * @extends TaskManagerBase - Inherits core functionalities like status, progress, and event emission.
 */
export class TaskManager extends TaskManagerBase {
  /**
   * Adds an array of tasks to the task queue.
   *
   * @param tasks - An array of tasks to add to the queue.
   * @emits change
   *
   * @returns The instance of the manager.
   */
  public addTasks(tasks: Task[]) {
    this.queue.push(
      ...tasks.map((task) => {
        task.bind(this);
        return task;
      })
    );

    this.emit("change");

    return this;
  }

  /**
   * Calculates the overall progress of the tasks.
   *
   * @returns The calculated progress based on the task's execution status.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  /**
   * Executes tasks in a linear sequence.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes (new task in progress).
   * @emits progress - When task progress is updated.
   *
   * @returns A promise that resolves when all tasks in the queue have been executed linearly.
   */
  private async executeLinear() {
    const task = this.queue.shift();
    if (!task) return;

    this.tasks.push(task);

    this.emit("task", task).emit("change");

    task.on("progress", () => {
      this.setProgress(this.calculateProgress());
    });

    return await task.execute();
  }

  /**
   * Executes tasks in parallel.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes (new task in progress).
   * @emits progress - When task progress is updated.
   *
   * @returns A promise that resolves when all tasks in the queue have been executed in parallel.
   */
  private async executeParallel() {
    const queueTasks = [...this.queue];
    this.clearQueue();

    this.tasks.push(...queueTasks);

    const executeTasks = () => {
      return queueTasks.map(async (task) => {
        this.emit("task", task).emit("change");

        task.on("progress", () => {
          this.setProgress(this.calculateProgress());
        });

        try {
          await task.execute();
        } catch (error: any) {
          throw { task, error };
        }
      });
    };

    if (this.hasFlag(TaskManagerFlag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }

  /**
   * Starts the execution of tasks in the task manager.
   *
   * @param force - Force start even if in "fail" status.
   * @emits fail - When a task fails and the `FAIL_ON_ERROR` flag is set.
   * @emits success - When all tasks are successfully executed.
   * @emits progress - When task progress is updated.
   * @emits change - When the task manager state changes.
   *
   * @returns A promise that resolves when task execution starts.
   */
  public async start(force?: boolean) {
    if (!this.queue.length) {
      return console.warn("TaskManager empty queue.");
    }

    if (!this.isStatus("idle", "stopped") && !(force && this.isStatus("fail"))) {
      switch (this.status) {
        case "fail":
          return console.warn(`${TaskManager.name} failed.`);
        case "success":
          return console.warn(`${TaskManager.name} succeeded.`);
        default:
          return console.warn(`${TaskManager.name} is already in progress.`);
      }
    }

    if (this.hasFlag(TaskManagerFlag.STOP)) {
      this.removeFlag(TaskManagerFlag.STOP);
    }

    this.setStatus("in-progress");

    while (this.queue.length > 0) {
      try {
        if (this.hasFlag(TaskManagerFlag.PARALLEL_EXECUTION)) {
          await this.executeParallel();
        } else {
          await this.executeLinear();
        }
      } catch (error: any) {
        if (this.hasFlag(TaskManagerFlag.FAIL_ON_ERROR)) {
          return this.setStatus("fail").emit("fail", error);
        }
      }

      if (this.hasFlag(TaskManagerFlag.STOP)) {
        return this.removeFlag(TaskManagerFlag.STOP).setStatus("stopped");
      }
    }

    return this.setStatus("success").emit("success");
  }

  /**
   * Stops the execution of tasks in the task manager.
   *
   * @emits change
   */
  public stop() {
    if (!this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is not in-progress.`);
    }

    this.addFlag(TaskManagerFlag.STOP);
  }

  /**
   * Resets the task manager to its initial state.
   * @emits change - When the task manager is reset.
   * @emits progress - When the task manager progress is reset.
   */
  public reset() {
    if (this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is in-progress.`);
    }

    if (this.isStatus("idle")) {
      return console.warn(`${TaskManager.name} is already idle.`);
    }

    const tmp = [...this.tasks, ...this.queue];

    this.queue = [];
    this.tasks = [];
    this.status = "idle";
    this.progress = 0;

    this.emit("progress", this.progress);
    this.addTasks(tmp.map((task) => task.clone()));
  }

  /**
   * Clears the task queue.
   *
   * @emits change
   *
   * @returns The instance of the manager.
   */
  public clearQueue(): this {
    this.queue = [];

    this.emit("change");
    return this;
  }

  /**
   * Finds a task in the list of tasks.
   *
   * @param taskBuilder - The builder of the task to find.
   *
   * @returns The found task or undefined.
   */
  public findTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public getTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public getTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public findLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public getLastTask<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public getLastTaskResult<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public findTasks<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>) {
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
  public getTasksResults<TSpec extends TaskSpec>(taskBuilder: TaskBuilder<TSpec>): NonNullable<TSpec["TResult"]>[] {
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
