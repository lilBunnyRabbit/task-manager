import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import type { TaskEvents, TaskSpec, TaskStatus } from "./task.type";

/**
 * Base class for managing task status, progress, error handling, and event emission.
 *
 * @template TSpec - Task specification type.
 * @extends EventEmitter<TaskEvents>
 */
export class TaskBase<TSpec extends TaskSpec> extends EventEmitter<TaskEvents> {
  // Status

  /**
   * Current task status.
   * @default "idle"
   */
  protected _status: TaskStatus = "idle";

  /**
   * Task status.
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates task status.
   * @param status - New status.
   * @emits change - When status changes.
   */
  public set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("change");
    }
  }

  /**
   * Updates task status.
   * @param status - New status.
   * @emits change - When status changes.
   * @returns Task instance.
   */
  public setStatus(status: typeof this._status): this {
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
   * Task progress (0 to 1).
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Task progress (0 to 1).
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Updates task progress.
   * @param progress - New progress value (0 to 1).
   * @emits progress - When progress changes.
   * @emits change - When progress changes.
   */
  public set progress(progress: typeof this._progress) {
    const validProgress = progress > 1 ? 1 : progress < 0 ? 0 : progress;

    if (validProgress !== this._progress) {
      this._progress = validProgress;

      this.emit("progress", validProgress).emit("change");
    }
  }

  /**
   * Updates task progress.
   * @param progress - New progress value (0 to 1).
   * @emits progress - When progress changes.
   * @emits change - When progress changes.
   * @returns Task instance.
   */
  public setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Result

  /**
   * Task result wrapped in an Optional.
   */
  protected _result: Optional<TSpec["TResult"]> = Optional.empty();

  /**
   * Task result wrapped in an Optional.
   */
  public get result() {
    return this._result;
  }

  /**
   * Updates task result, sets status to "success," and progress to 1.
   * @param result - Task result.
   * @emits progress - When result is updated and progress is completed.
   * @emits change - When result is updated.
   */
  protected set result(result: typeof this._result) {
    this._result = result;
    this._status = "success";
    this.progress = 1;

    this.emit("change");
  }

  /**
   * Updates task result, sets status to "success," and progress to 1.
   * @param result - Task result.
   * @emits progress - When result is updated and progress is completed.
   * @emits change - When result is updated.
   * @returns Task instance.
   */
  protected setResult(result: typeof this._result): this {
    this.result = result;
    return this;
  }
}
