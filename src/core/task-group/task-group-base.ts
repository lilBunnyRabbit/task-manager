import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { TaskQuery } from "../";
import { FlowController } from "../flow-controller";
import type { TaskGroupEvents, TaskGroupStatus } from "./task-group.type";
import { TaskGroupFlag } from "./task-group.type";

/**
 * Base class for managing task statuses, progress, flags, and queue operations.
 *
 * Emits events related to task lifecycle and status changes.
 *
 * @extends EventEmitter<TaskGroupEvents>
 */
export abstract class TaskGroupBase extends EventEmitter<TaskGroupEvents> {
  // Status

  /**
   * Current status of the task group.
   *
   * @default "idle"
   */
  protected _status: TaskGroupStatus = "idle";

  /**
   * Gets the current status of the task group.
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the status of the task group.
   *
   * @param status - New status to set.
   * @emits change - When the status changes.
   */
  protected set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("change");
    }
  }

  /**
   * Sets the status of the task group.
   *
   * @param status - Status to set.
   * @emits change - When the status changes.
   * @returns The instance for chaining.
   */
  protected setStatus(status: typeof this._status) {
    this.status = status;
    return this;
  }

  /**
   * Checks if the current status matches any of the provided statuses.
   *
   * @param statuses - Statuses to check.
   * @returns `true` if the current status matches.
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
   * @param progress - New progress value.
   * @emits progress - When progress changes.
   * @emits change - When progress changes.
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
   * @emits progress - When progress changes.
   * @emits change - When progress changes.
   * @returns The instance for chaining.
   */
  protected setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Flags

  /**
   * Current flags for the task group.
   *
   * @default Empty set of flags.
   */
  protected _flags: Set<TaskGroupFlag> = new Set([]);

  /**
   * Gets the current array of flags.
   */
  public get flags(): TaskGroupFlag[] {
    return Array.from(this._flags);
  }

  /**
   * Updates the flags for the task group.
   *
   * @param flags - New set of flags to apply.
   * @emits change - When the flags are updated.
   */
  public set flags(flags: typeof this._flags) {
    this._flags = flags;

    this.emit("change");
  }

  /**
   * Sets the flags for the task group.
   *
   * @param flags - Flags to set.
   * @emits change - When the flags are updated.
   * @returns The instance for chaining.
   */
  public setFlags(flags: typeof this._flags) {
    this.flags = flags;
    return this;
  }

  /**
   * Adds a flag to the task group.
   *
   * @param flag - Flag to add.
   * @emits change - When the flags are updated.
   * @returns The instance for chaining.
   */
  public addFlag(flag: TaskGroupFlag): this {
    this._flags.add(flag);

    this.emit("change");
    return this;
  }

  /**
   * Removes a flag from the task group.
   *
   * @param flag - Flag to remove.
   * @emits change - When the flags are updated.
   * @returns The instance for chaining.
   */
  public removeFlag(flag: TaskGroupFlag): this {
    this._flags.delete(flag);

    this.emit("change");
    return this;
  }

  /**
   * Checks if a flag is set.
   *
   * @param flag - Flag to check.
   * @returns `true` if the flag is set.
   */
  public hasFlag(flag: TaskGroupFlag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if all provided flags are set.
   *
   * @param flags - Flags to check.
   * @returns `true` if all flags are set.
   */
  public hasFlags(...flags: TaskGroupFlag[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  /**
   * TODO: Update docs
   */
  protected flowController: FlowController = new FlowController();

  public get tasks() {
    return this.flowController.tasks;
  }

  /**
   * Query interface for accessing and managing tasks.
   */
  public query: TaskQuery = new TaskQuery(this.flowController);
}
