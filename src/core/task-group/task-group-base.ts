import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { TaskQuery } from "../";
import { clamp01 } from "../../utils";
import { FlowController } from "../flow-controller";
import type { TaskGroupEvents, TaskGroupStatus } from "./task-group.type";
import { TaskGroupFlag } from "./task-group.type";

/**
 * Base class for managing task statuses, progress, flags, and event-driven operations.
 *
 * Provides foundational methods for task lifecycle management and event handling, used by task group implementations.
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
   * Current status of the task group.
   *
   * @default "idle"
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the status of the task group.
   *
   * @param status - New status to set.
   * @emits param - When the `status` parameter changes.
   */
  protected set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("param", "status");
    }
  }

  /**
   * Sets the status of the task group.
   *
   * @param status - Status to set.
   * @returns Instance of the task group for chaining.
   * @emits param - When the `status` parameter changes.
   */
  protected setStatus(status: typeof this._status) {
    this.status = status;

    return this;
  }

  /**
   * Checks if the current status matches any of the provided statuses.
   *
   * @param statuses - Array of statuses to check.
   * @returns `true` if the current status matches one of the provided statuses.
   */
  public isStatus(...statuses: Array<typeof this._status>) {
    return statuses.includes(this.status);
  }

  // Progress

  /**
   * Progress of the task group, represented as a value between 0 and 1.
   *
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Progress of the task group, represented as a value between 0 and 1.
   *
   * @default 0
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Updates the progress of the task group.
   *
   * @param progress - New progress value (0 to 1).
   * @emits progress - When progress changes.
   * @emits param - When the `progress` parameter changes.
   */
  protected set progress(progress: typeof this._progress) {
    const validProgress = clamp01(progress);

    if (validProgress !== this.progress) {
      this._progress = validProgress;

      this.emit("progress", this.progress).emit("param", "progress");
    }
  }

  /**
   * Sets the progress of the task group.
   *
   * @param progress - Progress value to set.
   * @returns Instance of the task group for chaining.
   * @emits progress - When progress changes.
   * @emits param - When the `progress` parameter changes.
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
   * Current flags for the task group.
   *
   * @default Empty array of flags.
   */
  public get flags(): TaskGroupFlag[] {
    return Array.from(this._flags);
  }

  /**
   * Updates the flags for the task group.
   *
   * @param flags - New set of flags to apply.
   * @emits param - When the `flags` parameter changes.
   */
  public set flags(flags: typeof this._flags) {
    this._flags = flags;

    this.emit("param", "flags");
  }

  /**
   * Sets the flags for the task group.
   *
   * @param flags - Flags to set.
   * @returns Instance of the task group for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public setFlags(flags: typeof this._flags) {
    this.flags = flags;

    return this;
  }

  /**
   * Adds a flag to the task group.
   *
   * @param flag - Flag to add.
   * @returns Instance of the task group for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public addFlag(flag: TaskGroupFlag): this {
    this._flags.add(flag);

    this.emit("param", "flags");

    return this;
  }

  /**
   * Removes a flag from the task group.
   *
   * @param flag - Flag to remove.
   * @returns Instance of the task group for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public removeFlag(flag: TaskGroupFlag): this {
    this._flags.delete(flag);

    this.emit("param", "flags");

    return this;
  }

  /**
   * Checks if a specific flag is set in the task group.
   *
   * @param flag - Flag to check.
   * @returns `true` if the flag is set.
   */
  public hasFlag(flag: TaskGroupFlag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if all specified flags are set in the task group.
   *
   * @param flags - Flags to check.
   * @returns `true` if all specified flags are set.
   */
  public hasFlags(...flags: TaskGroupFlag[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  /**
   * Manages task execution and flow control.
   */
  protected flowController: FlowController = new FlowController();

  /**
   * Retrieves all tasks managed by the task group.
   */
  public get tasks() {
    return this.flowController.tasks;
  }

  /**
   * Query interface for accessing tasks.
   */
  readonly query: TaskQuery = new TaskQuery(this.flowController);
}
