import { EventEmitter } from "@lilbunnyrabbit/utils";
import { Task, TaskBuilder, isTask } from "../task";
import { TaskManagerFlag, TaskManagerStatus } from "./task-manager.type";

/**
 * Base class for managing task statuses, progress, flags, and queue operations.
 *
 * Emits events related to task lifecycle and status changes.
 *
 * @extends EventEmitter - Emits `change`, `task`, `progress`, `fail`, and `success` events.
 */
class TaskManagerBase extends EventEmitter<{
  /**
   * Emits when any state (status, progress, or flags) of the manager changes.
   */
  change: void;
  /**
   * Emits when a new task is in progress.
   */
  task: Task;
  /**
   * Emits when task progress is updated.
   */
  progress: number;
  /**
   * Emits when a task fails and `FAIL_ON_ERROR` flag is set.
   */
  fail: { task: Task; error: unknown } | unknown;
  /**
   * Emits when all tasks in the queue are executed successfully.
   */
  success: unknown;
}> {
  // Status

  /**
   * Current status of the task manager.
   *
   * @default "idle"
   */
  protected _status: TaskManagerStatus = "idle";

  /**
   * Gets the current status.
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the task manager's status.
   *
   * @param status - New status to set.
   * @emits change - If the status changes.
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
   * @param status - Status to set.
   * @emits change - If the status changes.
   *
   * @returns Instance of the manager for chaining.
   */
  protected setStatus(status: typeof this._status) {
    this.status = status;
    return this;
  }

  /**
   * Checks if the current status matches any of the provided statuses.
   *
   * @param statuses - Array of statuses to check against.
   *
   * @returns `true` if the current status is among the provided statuses.
   */
  public isStatus(...statuses: Array<typeof this._status>) {
    return statuses.includes(this.status);
  }

  // Progress

  /**
   * Current progress of tasks (value between 0 and 1).
   *
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Gets the current progress of tasks (value between 0 and 1).
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Updates the progress of tasks.
   *
   * @param progress - New progress value (must be between 0 and 1).
   * @emits progress - If the progress changes.
   * @emits change - If the progress changes.
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
   * @param progress - Progress value to set.
   * @emits progress - If the progress changes.
   * @emits change - If the progress changes.
   *
   * @returns Instance of the manager for chaining.
   */
  protected setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Flags

  /**
   * Current flags for the task manager.
   *
   * @default Set(TaskManagerFlag.FAIL_ON_ERROR)
   */
  protected _flags: Set<TaskManagerFlag> = new Set([TaskManagerFlag.FAIL_ON_ERROR]);

  /**
   * Gets the current array of flags.
   */
  public get flags(): TaskManagerFlag[] {
    return Array.from(this._flags);
  }

  /**
   * Updates the flags for the task manager.
   *
   * @param flags - New set of flags to apply.
   * @emits change
   */
  protected set flags(flags: typeof this._flags) {
    this._flags = flags;

    this.emit("change");
  }

  /**
   * Sets the flags for the manager.
   *
   * @param flags - Flags to set.
   * @emits change
   *
   * @returns Instance of the manager for chaining.
   */
  protected setFlags(flags: typeof this._flags) {
    this.flags = flags;
    return this;
  }

  /**
   * Adds a flag to the task manager.
   *
   * @param flag - Flag to add.
   * @emits change
   *
   * @returns Instance of the manager for chaining.
   */
  public addFlag(flag: TaskManagerFlag): this {
    this._flags.add(flag);

    this.emit("change");
    return this;
  }

  /**
   * Removes a flag from the task manager.
   *
   * @param flag - Flag to remove.
   * @emits change
   *
   * @returns Instance of the manager for chaining.
   */
  public removeFlag(flag: TaskManagerFlag): this {
    this._flags.delete(flag);

    this.emit("change");
    return this;
  }

  /**
   * Checks if a flag is set.
   *
   * @param flag - Flag to check.
   *
   * @returns `true` if the flag is set.
   */
  public hasFlag(flag: TaskManagerFlag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if all provided flags are set.
   *
   * @param flags - Flags to check.
   * @returns `true` if all flags are set.
   */
  public hasFlags(...flags: TaskManagerFlag[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  // Queue

  /**
   * Current queue of {@link Task Tasks}.
   */
  protected _queue: Task[] = [];

  /**
   * Gets the current queue of {@link Task Tasks}.
   */
  public get queue() {
    return this._queue;
  }

  /**
   * Updates the task queue.
   *
   * @param queue - New task queue to set.
   */
  protected set queue(queue: typeof this._queue) {
    this._queue = queue;
  }

  // Tasks

  /**
   * List of executed {@link Task Tasks}.
   */
  protected _tasks: Task[] = [];

  /**
   * Current list of executed {@link Task Tasks}.
   */
  public get tasks() {
    return this._tasks;
  }

  /**
   * Sets the list of executed tasks.
   *
   * @param tasks - List of tasks to set.
   */
  protected set tasks(tasks: typeof this._tasks) {
    this._tasks = tasks;
  }
}

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

    return this.setStatus("success");
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
   *
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
   *
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
   *
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
   *
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
   *
   * @returns Array of found tasks.
   */
  public findTasks<TData, TResult, TError>(taskBuilder: TaskBuilder<TData, TResult, TError>) {
    return this.tasks.filter((task) => isTask(task, taskBuilder)) as Task<TData, TResult, TError>[];
  }

  /**
   * Retrieves the results of all tasks of a specific type.
   *
   * @param taskBuilder - The builder of the task type whose results to retrieve.
   *
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
