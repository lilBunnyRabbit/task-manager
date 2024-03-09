import { EventEmitter } from "@lilbunnyrabbit/utils";
import { Task, TaskBuilder, isTask } from "./Task";

/**
 * Base class for TaskManager, managing task status, progress, and flags.
 * Emits events related to task lifecycle and changes.
 */
class TaskManagerBase extends EventEmitter<{
  /**
   * Emits on general change.
   */
  change: void;
  /**
   * Emits on new task in progress.
   */
  task: Task;
  /**
   * Emits on task progress change.
   */
  progress: number;
  /**
   * Emits when task fails and `FAIL_ON_ERROR` flag is on.
   */
  fail: { task: Task; error: unknown } | unknown;
  /**
   * Emits when queue was executed successfully.
   */
  success: unknown;
}> {
  // Status
  /**
   * Current status.
   */
  protected _status: TaskManager.Status = "idle";

  /**
   * Current status.
   */
  public get status() {
    return this._status;
  }

  /**
   * Sets the status.
   *
   * @emits change
   */
  protected set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("change");
    }
  }

  /**
   * Sets the status.
   *
   * @param status - The status to set.
   * @returns The instance of the manager.
   */
  protected setStatus(status: typeof this._status) {
    this.status = status;
    return this;
  }

  /**
   * Checks if the status matches any of the provided statuses.
   *
   * @param statuses - Array of statuses to check against.
   * @returns True if the current status is among the provided statuses, false otherwise.
   */
  public isStatus(...statuses: Array<typeof this._status>) {
    return statuses.includes(this.status);
  }

  // Progress
  /**
   * Current progress of tasks ([0, 1]).
   */
  protected _progress: number = 0;

  /**
   * Current progress of tasks ([0, 1]).
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Sets the progress of tasks.
   *
   * @emits progress
   * @emits change
   */
  protected set progress(progress: typeof this._progress) {
    const validProgress = progress > 1 ? 1 : progress < 0 ? 0 : progress;

    if (validProgress !== this.progress) {
      this._progress = validProgress;

      this.emit("progress", this.progress).emit("change");
    }
  }

  /**
   * Sets the progress of tasks.
   *
   * @param progress - The progress to set.
   * @returns The instance of the manager.
   */
  protected setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Flags
  /**
   * Current flags.
   */
  protected _flags: Set<TaskManager.Flag> = new Set([TaskManager.Flag.FAIL_ON_ERROR]);

  /**
   * Gets the current array of flags.
   */
  public get flags(): TaskManager.Flag[] {
    return Array.from(this._flags);
  }

  /**
   * Sets the flags.
   *
   * @emits change
   */
  protected set flags(flags: typeof this._flags) {
    this._flags = flags;

    this.emit("change");
  }

  /**
   * Sets the flags.
   *
   * @param flags - The flags to set.
   * @returns The instance of the manager.
   */
  protected setFlags(flags: typeof this._flags) {
    this.flags = flags;
    return this;
  }

  /**
   * Adds a flag.
   *
   * @param flag - The flag to add.
   * @returns The instance of the manager.
   *
   * @emits change
   */
  public addFlag(flag: TaskManager.Flag): this {
    this._flags.add(flag);

    this.emit("change");
    return this;
  }

  /**
   * Removes a flag.
   *
   * @param flag - The flag to add.
   * @returns The instance of the manager.
   * @emits change
   */
  public removeFlag(flag: TaskManager.Flag): this {
    this._flags.delete(flag);

    this.emit("change");
    return this;
  }

  /**
   * Checks if a given flag is set.
   *
   * @param flag - The flag to check.
   * @returns True if the flag is set, false otherwise.
   */
  public hasFlag(flag: TaskManager.Flag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if the given flags is set.
   *
   * @param flags - The flags to check.
   * @returns - True if all flags are set, false otherwise.
   */
  public hasFlags(...flags: TaskManager.Flag[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  // Queue
  /**
   * Current queue of tasks.
   */
  protected _queue: Task[] = [];

  /**
   * Current queue of tasks.
   */
  public get queue() {
    return this._queue;
  }

  /**
   * Sets the task queue.
   */
  protected set queue(queue: typeof this._queue) {
    this._queue = queue;
  }

  // Tasks
  /**
   * Current list of executed tasks.
   */
  protected _tasks: Task[] = [];

  /**
   * Current list of executed tasks.
   */
  public get tasks() {
    return this._tasks;
  }

  /**
   * Sets the list of executed tasks.
   *
   * @param tasks - The list of tasks to set.
   */
  protected set tasks(tasks: typeof this._tasks) {
    this._tasks = tasks;
  }
}

export class TaskManager extends TaskManagerBase {
  /**
   * Adds an array of tasks to the task queue.
   *
   * @param tasks - An array of tasks to add to the queue.
   * @returns The instance of the manager.
   * @emits change
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
   * @returns The calculated progress.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  /**
   * Executes tasks in a linear sequence.
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

    if (this.hasFlag(TaskManager.Flag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }

  /**
   * Start task manager.
   * @param {boolean} [force] - Force start if in "fail" status.
   */

  /**
   * Starts the execution of tasks in the task manager.
   *
   * @param force - Force start even if in "fail" status.
   * @returns A promise that resolves when task execution starts.
   */
  public async start(force?: boolean) {
    if (!this.queue.length) {
      return console.warn(`${TaskManager.name} empty queue.`);
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

    if (this.hasFlag(TaskManager.Flag.STOP)) {
      this.removeFlag(TaskManager.Flag.STOP);
    }

    this.setStatus("in-progress");

    while (this.queue.length > 0) {
      try {
        if (this.hasFlag(TaskManager.Flag.PARALLEL_EXECUTION)) {
          await this.executeParallel();
        } else {
          await this.executeLinear();
        }
      } catch (error: any) {
        if (this.hasFlag(TaskManager.Flag.FAIL_ON_ERROR)) {
          return this.setStatus("fail").emit("fail", error);
        }
      }

      if (this.hasFlag(TaskManager.Flag.STOP)) {
        return this.removeFlag(TaskManager.Flag.STOP).setStatus("stopped");
      }
    }

    return this.setStatus("success");
  }

  /**
   * Stops the execution of tasks in the task manager.
   */
  public stop() {
    if (!this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is not in-progress.`);
    }

    this.addFlag(TaskManager.Flag.STOP);
  }

  /**
   * Resets the task manager to its initial state.
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
   * @returns The found task or undefined.
   */
  public findTask<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
   * @returns The retrieved task.
   * @throws If the task is not found.
   */
  public getTask<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
   * @returns The result of the task.
   * @throws If the task is not found or if the result is empty.
   */
  public getTaskResult<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
  public findLastTask<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
   * @returns The retrieved task.
   * @throws If the task is not found.
   */
  public getLastTask<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
   * @returns The result of the task.
   * @throws If the task is not found or if the result is empty.
   */
  public getLastTaskResult<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
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
   * @returns Array of found tasks.
   */
  public findTasks<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
    return this.tasks.filter((task) => isTask(task, taskBuilder)) as Task<TData, TResult, TError>[];
  }

  /**
   * Retrieves the results of all tasks of a specific type.
   *
   * @param taskBuilder - The builder of the task type whose results to retrieve.
   * @returns Array of results.
   * @throws If any of the task results is empty.
   */
  public getTasksResults<TData, TResult, TError>(
    taskBuilder: TaskBuilder<TData, TResult, TError>
  ): NonNullable<TResult>[] {
    const results: NonNullable<TResult>[] = [];

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

/**
 * Namespace for `TaskManager` related types and enumerations.
 */
export namespace TaskManager {
  /**
   * Possible statuses of a `TaskManager`.
   */
  export type Status = "idle" | "in-progress" | "fail" | "success" | "stopped";
  /**
   * Various flags that can be used to control the behavior of the TaskManager.
   */
  export enum Flag {
    /**
     * Flag indicating that the execution loop should stop.
     */
    STOP = "STOP",
    /**
     * Flag indicating that the execution should stop if any task fails.
     */
    FAIL_ON_ERROR = "FAIL_ON_ERROR",
    /**
     * Flag for enabling parallel execution of tasks.
     */
    PARALLEL_EXECUTION = "PARALLEL_EXECUTION",
  }
}
