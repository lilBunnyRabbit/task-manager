import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import { v4 as uuidv4 } from "uuid";
import type { TaskManager } from "../task-manager";
import type { TaskBuilder, TaskConfig } from "./task-builder";
import type { ParsedTask, TaskEvents, TaskSpec, TaskStatus } from "./task.type";

/**
 * Base class for managing core functionalities of a task, like status, progress, error handling, and event emission.
 *
 * @template TResult - Result type the task produces when it finishes.
 * @template TError - Error type that might pop up during execution.
 *
 * @extends EventEmitter - Emits `change` and `progress` events.
 */
class TaskBase<TSpec extends TaskSpec> extends EventEmitter<TaskEvents> {
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

/**
 * Represents a single task in the task manager system.
 *
 * Handles task execution, progress tracking, and status updates.
 *
 * @template TData - Type of data the task requires.
 * @template TResult - Type of result the task produces.
 * @template TError - Type of error the task may encounter.
 *
 * @extends TaskBase - Inherits core functionalities like status, progress, and event emission.
 */
export class Task<TSpec extends TaskSpec = TaskSpec> extends TaskBase<TSpec> {
  /**
   * Unique identifier of the task.
   */
  readonly id!: string;

  /**
   * {@link TaskManager} instance to which this task is bound.
   */
  private _manager?: TaskManager;

  /**
   * Creates an instance of {@link Task}.
   *
   * @param builder - Task builder function used to create new task instances.
   * @param name - Name of the task.
   * @param _config - Configuration object for the task.
   * @param data - Data required to execute the task.
   */
  constructor(
    readonly builder: TaskBuilder<TSpec>,
    readonly name: string,
    private _config: Omit<TaskConfig<TSpec>, "name">,
    readonly data: TSpec["TData"]
  ) {
    super();
    this.id = uuidv4();
  }

  /**
   * Binds the task to a {@link TaskManager}.
   *
   * @param manager - {@link TaskManager} to bind this task to.
   */
  public bind(manager: TaskManager) {
    this._manager = manager;
  }

  /**
   * Retrieves the {@link TaskManager} to which this task is bound.
   *
   * @returns Associated {@link TaskManager}.
   * @throws If the task is not bound to a {@link TaskManager}.
   */
  public get manager(): TaskManager {
    if (!this._manager) {
      throw new Error("Missing TaskManager. Please use Task.bind(TaskManager).");
    }

    return this._manager;
  }

  /**
   * Executes the task, updating its status and handling the result or error.
   *
   * @returns Result of the task execution.
   * @throws If the task is not in the "idle" state or if the execution fails.
   */
  public async execute(): Promise<Optional<TSpec["TResult"]>> {
    if (this.status !== "idle") {
      throw new Error('Task is not in "idle" state.');
    }

    this.setStatus("in-progress");

    try {
      const result = await Promise.resolve(this._config.execute.bind(this)(this.data));
      this.result = Optional(result);

      return this.result;
    } catch (error) {
      this.addError(error as TSpec["TError"]);
      this.setStatus("error");
      throw error;
    }
  }

  /**
   * Parses the task, providing a structured representation suitable for UI rendering.
   *
   * @returns Parsed representation of the task.
   */
  public parse(): ParsedTask {
    const parsed = this._config.parse?.bind(this)() ?? {};

    return {
      status: `${this.name} - ${this.status}`,
      warnings: this.warnings,
      errors: this.errors?.map((error: any) => {
        if (error instanceof Error) {
          return error.message;
        }
        return `${error}`;
      }),
      result: this.result.isPresent() ? `${this.result.get()}` : undefined,

      ...parsed,
    };
  }

  /**
   * Returns a string representation of the {@link Task} instance.
   *
   * @returns String representing the task.
   */
  public toString() {
    return `Task {\n\tname: ${JSON.stringify(this.name)},\n\tid: "${this.id}"\n}`;
  }

  /**
   * Creates a clone of the current task.
   *
   * @returns New {@link Task} instance with the same configuration and data.
   */
  public clone() {
    return this.builder(this.data);
  }
}
