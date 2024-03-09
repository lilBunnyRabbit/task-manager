import { EventEmitter, Optional } from "@lilbunnyrabbit/utils";
import { TaskManager } from "./TaskManager";

/**
 * Configuration interface for creating a `Task`.
 *
 * @template TData - Type of input data for the task.
 * @template TResult - Type of result produced by the task.
 * @template TError - Type of error that may be thrown by the task.
 */
export interface TaskConfig<TData, TResult, TError> {
  /**
   * Name of the task.
   */
  name: string;
  /**
   * Function to parse the task's outcome.
   */
  parse?: (this: Task<TData, TResult, TError>) => Task.Parsed;
  /**
   * The core function to execute the task. It should return a result or a promise of the result.
   */
  execute: (this: Task<TData, TResult, TError>, data: TData) => TResult | Promise<TResult>;
}

/**
 * Base class for a `Task`, handling core functionalities like status, progress, and error management.
 * Emits events on status and progress changes.
 *
 * @template TResult - The type of the result that the task produces.
 * @template TError - The type of error that the task may encounter.
 */
class TaskBase<TResult, TError> extends EventEmitter<{
  /**
   * Emits on general change.
   */
  change: void;
  /**
   * Emits on task progress.
   */
  progress: number;
}> {
  // Status
  /**
   * Current status.
   */
  protected _status: Task.Status = "idle";

  /**
   * Current status.
   */
  public get status() {
    return this._status;
  }

  /**
   * Set the status.
   *
   * @emits change
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
   * @returns The instance of the task.
   */
  public setStatus(status: typeof this._status): this {
    this.status = status;
    return this;
  }

  // Progress
  /**
   * Current progress of the task ([0, 1]).
   */
  protected _progress: number = 0;

  /**
   * Current progress of the task ([0, 1]).
   */
  public get progress() {
    return this._progress;
  }

  /**
   * Sets the progress.
   *
   * @emits progress
   * @emits change
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
   * @param progress - The progress to set.
   * @returns The instance of the task.
   */
  public setProgress(progress: typeof this._progress) {
    this.progress = progress;
    return this;
  }

  // Errors
  /**
   * The list of errors encountered during the task's execution.
   */
  protected _errors?: TError[];

  /**
   * The list of errors encountered during the task's execution.
   */
  public get errors() {
    return this._errors;
  }

  /**
   * Set the list of errors.
   *
   * @param errors - Array of errors to set.
   * @emits change
   */
  public set errors(errors: typeof this._errors) {
    this._errors = errors;

    this.emit("change");
  }

  /**
   * Adds one or more errors to the task and changes its status to 'error'.
   *
   * @param errors - The errors to add to the task.
   * @returns The instance of the task.
   * @emits change
   */
  public addError(...errors: NonNullable<typeof this._errors>) {
    if (errors.length) {
      if (!this.errors) this._errors = [];

      this._errors!.push(...errors);
      this._status = "error";

      this.emit("change");
    }

    return this;
  }

  // Warnings
  /**
   * The list of warnings generated during the task's execution.
   */
  protected _warnings?: string[];

  /**
   * The list of warnings generated during the task's execution.
   */
  public get warnings() {
    return this._warnings;
  }

  /**
   * Set the list of warnings.
   *
   * @param warnings - Array of warnings to set.
   * @emits change
   */
  public set warnings(warnings: typeof this._warnings) {
    this._warnings = warnings;

    this.emit("change");
  }

  /**
   * Adds one or more warnings to the task.
   *
   * @param warnings The warnings to add to the task.
   * @returns The instance of the task.
   * @emits change
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
   * The result of the task, encapsulated in an Optional object.
   */
  protected _result: Optional<TResult> = Optional.empty();

  /**
   * The result of the task, encapsulated in an Optional object.
   */
  public get result() {
    return this._result;
  }

  /**
   * Setter for the task's result. Changes the task's status to 'success' and progress to 1.
   *
   * @param result The result to set for the task.
   * @emits progress
   * @emits change
   */
  protected set result(result: typeof this._result) {
    this._result = result;
    this._status = "success";
    this._progress = 1;

    this.emit("progress", this.progress).emit("change");
  }

  /**
   * Sets the result of the task.
   *
   * @param result The result to set for the task.
   * @returns The instance of the task.
   */
  protected setResult(result: typeof this._result): this {
    this.result = result;
    return this;
  }
}

/**
 * Represents a single task in the task manager system, extending the functionality of `TaskBase`.
 * Handles task execution, progress tracking, and status updates.
 *
 * @template TData - The type of data the task requires.
 * @template TResult - The type of result the task produces.
 * @template TError - The type of error the task may encounter.
 */
export class Task<TData = any, TResult = any, TError = any> extends TaskBase<TResult, TError> {
  /**
   * Unique identifier of the task.
   */
  readonly id!: string;
  /**
   * `TaskManager` instance to which this task is bound.
   */
  private _manager?: TaskManager;

  /**
   * Creates an instance of Task.
   *
   * @param builder - Task builder function used to create new instances of the task.
   * @param name - Name of the task.
   * @param _config - Configuration object for the task.
   * @param data - Data required to execute the task.
   */
  constructor(
    readonly builder: TaskBuilder<TData, TResult, TError>,
    readonly name: string,
    private _config: Omit<TaskConfig<TData, TResult, TError>, "name">,
    readonly data: TData
  ) {
    super();
    this.id = createTaskId(name);
  }

  /**
   * Binds the task to a `TaskManager`.
   *
   * @param manager - `TaskManager` to bind this task to.
   */
  public bind(manager: TaskManager) {
    this._manager = manager;
  }

  /**
   * Gets the `TaskManager` to which this task is bound.
   *
   * @returns The associated TaskManager.
   * @throws If the task is not bound to a TaskManager.
   */
  public get manager(): TaskManager {
    if (!this._manager) {
      throw new Error(`Missing TaskManager. Please use ${Task.name}.${this.bind.name}(TaskManager).`);
    }

    return this._manager;
  }

  /**
   * Executes the task. Changes the task's status and handles the task's result or error.
   *
   * @returns Result of the task execution.
   * @throws If the task is not in the "idle" state or if the task execution fails.
   */
  public async execute() {
    if (this.status !== "idle") {
      throw new Error('Task is not in "idle" state.');
    }

    this.setStatus("in-progress");

    try {
      const result = await Promise.resolve(this._config.execute.bind(this)(this.data));
      this.result = Optional(result);
    } catch (error) {
      this.addError(error as TError);
      throw error;
    }
  }

  /**
   * Parses the task, providing a representation suitable for UI rendering.
   *
   * @returns The parsed representation of the task.
   */
  public parse(): Task.Parsed {
    const parsed = this._config.parse?.bind(this)() ?? {};

    return {
      status: `${this.name} - ${this.status}`,
      warnings: this.warnings,
      errors: this.errors?.map((error) => {
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
   * Returns a string representation of the Task instance.
   *
   * @returns A string representing the task.
   */
  public toString() {
    return `${Task.name} { name: ${JSON.stringify(this.name)}, id: #${this.id} }`;
  }

  /**
   * Creates a clone of the current task.
   *
   * @returns A new `Task` instance with the same configuration and data.
   */
  public clone() {
    return this.builder(this.data);
  }
}

/**
 * Namespace containing types and interfaces related to `Task`.
 */
export namespace Task {
  /**
   * Possible statuses of a Task.
   */
  export type Status = "idle" | "in-progress" | "error" | "success";

  /**
   * Interface representing a parsed representation of a Task, suitable for rendering in a UI.
   */
  export interface Parsed {
    /**
     * A node representing the task's status.
     */
    status: string;
    /**
     * Optional array of nodes representing warnings.
     */
    warnings?: string[];
    /**
     * Optional array of nodes representing errors.
     */
    errors?: string[];
    /**
     * Optional node representing the task's result.
     */
    result?: string;
  }
}

// TODO: Replace `createTaskId` with UUID?

/**
 * Creates a unique identifier for a task based on its name and the current time.
 * The ID is a combination of a random hex string, the task name in hex, and the current time in hex.
 *
 * @param name - Name of the task.
 * @returns A unique task identifier.
 */
export function createTaskId(name: string) {
  const randomHex = Math.floor(Math.random() * Date.now() * name.length)
    .toString(16)
    .padEnd(12, "0");
  const nameHex = [...name].map((c) => c.charCodeAt(0).toString(16)).join("");
  const timeHex = Date.now().toString(16).padStart(12, "0");

  return `${randomHex}-${nameHex}-${timeHex}`;
}

/**
 * Type guard function to check if a given object is an instance of `Task`.
 *
 * @template TData - The type of data the task requires.
 * @template TResult - The type of result the task produces.
 * @template TError - The type of error the task may encounter.
 * @param task - Object to check.
 * @param taskBuilder - Task builder to compare against.
 */
export function isTask<TData, TResult, TError>(
  task: unknown,
  taskBuilder: TaskBuilder<TData, TResult, TError>
): task is Task<TData, TResult, TError> {
  return task instanceof Task && task.builder.id === taskBuilder.id;
}

/**
 * Interface for a function that builds `Task` instances.
 *
 * @template TData - Type of input data for the task.
 * @template TResult - Type of result produced by the task.
 * @template TError - Type of error that may be thrown by the task.
 */
export interface TaskBuilder<TData, TResult, TError> {
  /**
   * Function that builds `Task` instances.
   *
   * @template TData - Type of input data for the task.
   * @template TResult - Type of result produced by the task.
   * @template TError - Type of error that may be thrown by the task.
   * @param data - Data to be passed to the task for execution.
   * @return A new `Task` instance.
   */
  (data: TData): Task<TData, TResult, TError>;
  /**
   * Unique identifier of the task builder.
   */
  id: string;
  /**
   * Name of the task.
   */
  taskName: string;
}

/**
 * Factory function to create a new `TaskBuilder`, which in turn is used to create `Task` instances.
 *
 * @template TData - The type of data the task requires.
 * @template TResult - The type of result the task produces.
 * @template TError - The type of error the task may encounter.
 * @param config - Configuration object for creating the task.
 * @returns A new task builder with the given configuration.
 */
export function createTask<TData = void, TResult = void, TError = Error>({
  name,
  ...config
}: TaskConfig<TData, TResult, TError>): TaskBuilder<TData, TResult, TError> {
  const builder: TaskBuilder<TData, TResult, TError> = function (data) {
    return new Task<TData, TResult, TError>(builder, name, config, data);
  };
  builder.id = createTaskId(name);
  builder.taskName = name;
  builder.toString = function () {
    return `TaskBuilder { name: ${JSON.stringify(this.taskName)}, id: #${this.id} }`;
  };

  return builder;
}
