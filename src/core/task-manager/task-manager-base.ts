import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { ExecutionMode } from "../../common";
import { clamp01 } from "../../utils";
import { FlowController } from "../flow-controller";
import { TaskQuery } from "../task-query";
import type { TaskManagerEvents, TaskManagerStatus } from "./task-manager.type";
import { TaskManagerFlag } from "./task-manager.type";

/**
 * Base class for managing tasks, their statuses, progress, flags, and queue operations.
 *
 * Provides foundational methods for task lifecycle management and event-driven operations, used by task manager implementations.
 *
 * @extends EventEmitter<TaskManagerEvents>
 */
export class TaskManagerBase extends EventEmitter<TaskManagerEvents> {
  // Status

  /**
   * Current status of the task manager.
   *
   * @default "idle"
   */
  protected _status: TaskManagerStatus = "idle";

  /**
   * Retrieves the current status of the task manager.
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the status of the task manager.
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
   * Sets the status of the task manager.
   *
   * @param status - Status to set.
   * @returns Instance of the task manager for chaining.
   * @emits param - When the `status` parameter changes.
   */
  protected setStatus(status: typeof this._status) {
    this.status = status;

    return this;
  }

  /**
   * Checks if the current status matches any of the provided statuses.
   *
   * @param statuses - Array of statuses to check against.
   * @returns `true` if the current status matches any provided status.
   */
  public isStatus(...statuses: Array<typeof this._status>) {
    return statuses.includes(this.status);
  }

  // Progress

  /**
   * Current progress of tasks, represented as a value between 0 and 1.
   *
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Retrieves the current progress of tasks.
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Updates the progress of tasks.
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
   * Sets the progress of tasks.
   *
   * @param progress - Progress value to set.
   * @returns Instance of the task manager for chaining.
   * @emits progress - When progress changes.
   * @emits param - When the `progress` parameter changes.
   */
  protected setProgress(progress: typeof this._progress) {
    this.progress = progress;

    return this;
  }

  // Flags

  /**
   * Current flags for the task manager.
   *
   * @default Empty set of flags.
   */
  protected _flags: Set<TaskManagerFlag> = new Set([]);

  /**
   * Retrieves the current flags of the task manager as an array.
   */
  public get flags(): TaskManagerFlag[] {
    return Array.from(this._flags);
  }

  /**
   * Updates the flags for the task manager.
   *
   * @param flags - New set of flags to apply.
   * @emits param - When the `flags` parameter changes.
   */
  public set flags(flags: typeof this._flags) {
    this._flags = flags;

    this.emit("param", "flags");
  }

  /**
   * Sets the flags for the task manager.
   *
   * @param flags - Flags to set.
   * @returns Instance of the task manager for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public setFlags(flags: typeof this._flags) {
    this.flags = flags;

    return this;
  }

  /**
   * Adds a flag to the task manager.
   *
   * @param flag - Flag to add.
   * @returns Instance of the task manager for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public addFlag(flag: TaskManagerFlag): this {
    this._flags.add(flag);

    this.emit("param", "flags");

    return this;
  }

  /**
   * Removes a flag from the task manager.
   *
   * @param flag - Flag to remove.
   * @returns Instance of the task manager for chaining.
   * @emits param - When the `flags` parameter changes.
   */
  public removeFlag(flag: TaskManagerFlag): this {
    this._flags.delete(flag);

    this.emit("param", "flags");

    return this;
  }

  /**
   * Checks if a specific flag is set in the task manager.
   *
   * @param flag - Flag to check.
   * @returns `true` if the flag is set.
   */
  public hasFlag(flag: TaskManagerFlag): boolean {
    return this._flags.has(flag);
  }

  /**
   * Checks if all specified flags are set in the task manager.
   *
   * @param flags - Flags to check.
   * @returns `true` if all specified flags are set.
   */
  public hasFlags(...flags: TaskManagerFlag[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  /**
   * Manages task execution and flow control.
   */
  protected flowController: FlowController = new FlowController();

  /**
   * Retrieves all tasks managed by the task manager.
   */
  public get tasks() {
    return this.flowController.tasks;
  }

  /**
   * Query interface for accessing and managing tasks.
   */
  public query: TaskQuery = new TaskQuery(this.flowController);

  // Execution Mode

  /**
   * Current execution mode of the task manager.
   *
   * @default ExecutionMode.LINEAR
   */
  protected _mode: ExecutionMode = ExecutionMode.LINEAR;

  /**
   * Current execution mode of the task manager.
   *
   * @default ExecutionMode.LINEAR
   */
  public get mode() {
    return this._mode;
  }

  /**
   * Updates the execution mode.
   *
   * @param mode - New execution mode to set.
   */
  public set mode(mode: ExecutionMode) {
    this._mode = mode;

    this.emit("param", "mode");
  }

  /**
   * Sets the execution mode.
   *
   * @param mode - Execution mode to set.
   * @returns Instance of the task manager for chaining.
   */
  public setMode(mode: ExecutionMode) {
    this.mode = mode;

    return this;
  }
}
