import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import { clamp01 } from "../../utils";
import type { TaskEvents, TaskSpec, TaskStatus } from "./task.type";

/**
 * Base class for managing task status, progress, result handling, and emitting events.
 *
 * @template TSpec - Task specification type.
 * @extends EventEmitter<TaskEvents>
 */
export class TaskBase<TSpec extends TaskSpec> extends EventEmitter<TaskEvents> {
  // Status

  /**
   * Current status of the task.
   *
   * @default "idle"
   */
  protected _status: TaskStatus = "idle";

  /**
   * Current status of the task.
   *
   * @default "idle"
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the task status.
   *
   * @param status - New status to set.
   * @emits param - Emits when the `status` parameter changes.
   */
  public set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("param", "status");
    }
  }

  /**
   * Sets the task status.
   *
   * @param status - Status to set.
   * @returns Instance of the task for chaining.
   * @emits param - Emits when the `status` parameter changes.
   */
  public setStatus(status: typeof this._status): this {
    this.status = status;

    return this;
  }

  /**
   * Checks if the task status matches any of the provided statuses.
   *
   * @param statuses - List of statuses to check.
   * @returns `true` if the current status matches one of the provided statuses.
   */
  public isStatus(...statuses: Array<typeof this._status>) {
    return statuses.includes(this.status);
  }

  // Progress

  /**
   * Progress of the task (range 0 to 1).
   *
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Progress of the task (range 0 to 1).
   *
   * @default 0
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Updates the task progress.
   *
   * @param progress - New progress value (0 to 1).
   * @emits progress - When progress changes.
   * @emits param - When the `progress` parameter changes.
   */
  public set progress(progress: typeof this._progress) {
    const validProgress = clamp01(progress);

    if (validProgress !== this._progress) {
      this._progress = validProgress;

      this.emit("progress", this.progress).emit("param", "progress");
    }
  }

  /**
   * Sets the task progress.
   *
   * @param progress - Progress value to set.
   * @returns Instance of the task for chaining.
   * @emits progress - When progress changes.
   * @emits param - When the `progress` parameter changes.
   */
  public setProgress(progress: typeof this._progress) {
    this.progress = progress;

    return this;
  }

  // Result

  /**
   * Task result, wrapped in an `Optional` object.
   */
  protected _result: Optional<TSpec["TResult"]> = Optional.empty();

  /**
   * Task result, wrapped in an `Optional` object.
   */
  public get result() {
    return this._result;
  }

  /**
   * Sets the task result.
   *
   * @param result - Result to set.
   * @emits param - When the `result` parameter changes.
   */
  protected set result(result: typeof this._result) {
    this._result = result;
    this.emit("param", "result");
  }

  /**
   * Sets the task result and updates the status to `success`.
   *
   * @param result - Result to set.
   * @returns Instance of the task for chaining.
   * @emits param - When the `result` parameter changes.
   */
  protected setResult(result: typeof this._result): this {
    this.result = result;

    return this;
  }
}
