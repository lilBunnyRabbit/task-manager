import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import type { TaskEvents, TaskSpec, TaskStatus } from "./task.type";

/**
 * Base class for managing core functionalities of a task, like status, progress, error handling, and event emission.
 *
 * @template TResult - Result type the task produces when it finishes.
 * @template TError - Error type that might pop up during execution.
 *
 * @extends EventEmitter - Emits `change` and `progress` events.
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
   * Gets the current status.
   */
  public get status() {
    return this._status;
  }

  /**
   * Updates the task status.
   *
   * @param status - New status to set.
   * @emits change - If the status changes.
   */
  public set status(status: typeof this._status) {
    if (status !== this.status) {
      this._status = status;

      this.emit("change");
    }
  }

  /**
   * Sets the status.
   *
   * @param status - The status to set.
   * @emits change - If the status changes.
   *
   * @returns The instance of the task.
   */
  public setStatus(status: typeof this._status): this {
    this.status = status;
    return this;
  }

  // Progress

  /**
   * Current progress of the task (between 0 and 1).
   *
   * @default 0
   */
  protected _progress: number = 0;

  /**
   * Gets the current progress (between 0 and 1).
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Sets the progress.
   *
   * @param progress - New progress value (should be between 0 and 1).
   * @emits progress - If the progress changes.
   * @emits change - If the progress changes.
   */
  public set progress(progress: typeof this._progress) {
    const validProgress = progress > 1 ? 1 : progress < 0 ? 0 : progress;

    if (validProgress !== this._progress) {
      this._progress = validProgress;

      this.emit("progress", validProgress).emit("change");
    }
  }

  /**
   * Sets the progress.
   *
   * @param progress - New progress value (should be between 0 and 1).
   * @emits progress - If the progress changes.
   * @emits change - If the progress changes.
   *
   * @returns The instance of the task.
   */
  public setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Errors

  /**
   * List of errors encountered during the task's execution.
   */
  protected _errors?: TSpec["TError"][];

  /**
   * Gets the list of errors.
   */
  public get errors() {
    return this._errors;
  }

  /**
   * Sets the list of errors.
   *
   * @param errors - Array of errors to set.
   * @emits change - If the errors list changes.
   */
  public set errors(errors: typeof this._errors) {
    this._errors = errors;

    this.emit("change");
  }

  /**
   * Adds one or more errors to the task.
   *
   * @param errors - Errors to add to the task.
   * @emits change - If errors are added.
   *
   * @returns The instance of the task.
   */
  public addError(...errors: NonNullable<typeof this._errors>) {
    if (errors.length) {
      if (!this.errors) this._errors = [];

      this._errors!.push(...errors);

      this.emit("change");
    }

    return this;
  }

  // Warnings

  /**
   * List of warnings generated during task execution.
   */
  protected _warnings?: string[];

  /**
   * Gets the list of warnings.
   */
  public get warnings() {
    return this._warnings;
  }

  /**
   * Sets the list of warnings.
   *
   * @param warnings - Array of warnings to set.
   * @emits change - If the warnings list changes.
   */
  public set warnings(warnings: typeof this._warnings) {
    this._warnings = warnings;

    this.emit("change");
  }

  /**
   * Adds one or more warnings to the task.
   *
   * @param warnings - Warnings to add.
   * @emits change - If warnings are added.
   *
   * @returns The instance of the task.
   */
  public addWarning(...warnings: NonNullable<typeof this._warnings>) {
    if (warnings.length) {
      if (!this._warnings) this._warnings = [];
      this._warnings.push(...warnings);

      this.emit("change");
    }

    return this;
  }

  // Result

  /**
   * Result of the task, encapsulated in an Optional object.
   */
  protected _result: Optional<TSpec["TResult"]> = Optional.empty();

  /**
   * The result of the task, encapsulated in an Optional object.
   */
  public get result() {
    return this._result;
  }

  /**
   * Sets the result of the task. Also updates the task status to 'success' and sets progress to 1.
   *
   * @param result - Result to set.
   * @emits progress - If the result changes and progress is completed.
   * @emits change - If the result is updated.
   */
  protected set result(result: typeof this._result) {
    this._result = result;
    this._status = "success";
    this._progress = 1;

    this.emit("progress", this.progress).emit("change");
  }

  /**
   * Sets the result of the task. Also updates the task status to 'success' and sets progress to 1.
   *
   * @param result - Result to set.
   * @emits progress - If the result changes and progress is completed.
   * @emits change - If the result is updated.
   *
   * @returns The instance of the task.
   */
  protected setResult(result: typeof this._result): this {
    this.result = result;
    return this;
  }
}
