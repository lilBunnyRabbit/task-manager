import { EventEmitter } from "@lilbunnyrabbit/utils";
import { Task } from "../task";
import { TaskSpec } from "../task/task.type";
import { ExecutionManagerEvents } from "./execution-manager";
import { ExecutionManagerFlag, ExecutionManagerStatus } from "./execution-manager.type";

export class ExecutionBase<TParsed, TStatus extends string, TFlag extends Record<string, string>> extends EventEmitter<
  ExecutionManagerEvents<TParsed>
> {
  // Status

  /**
   * Current status of the task manager.
   *
   * @default "idle"
   */
  protected _status: ExecutionManagerStatus | TStatus = "idle";

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

  /**
   * Calculates the overall progress of the tasks.
   *
   * @returns The calculated progress based on the task's execution status.
   */
  protected calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  // Flags

  /**
   * Current flags for the task manager.
   *
   * @default Set(ExecutionManagerFlag.FAIL_ON_ERROR)
   */
  protected _flags: Set<ExecutionManagerFlag | TFlag> = new Set([ExecutionManagerFlag.FAIL_ON_ERROR]);

  /**
   * Gets the current array of flags.
   */
  public get flags(): Array<ExecutionManagerFlag | TFlag> {
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
  public addFlag(flag: ExecutionManagerFlag | TFlag): this {
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
  public removeFlag(flag: ExecutionManagerFlag | TFlag): this {
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
  public hasFlag(flag: ExecutionManagerFlag | TFlag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if all provided flags are set.
   *
   * @param flags - Flags to check.
   * @returns `true` if all flags are set.
   */
  public hasFlags(...flags: Array<ExecutionManagerFlag | TFlag>): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  // Queue

  /**
   * Current queue of {@link Task Tasks}.
   */
  protected _queue: Task<TaskSpec, TParsed>[] = [];

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
  protected _tasks: Task<TaskSpec, TParsed>[] = [];

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
