import { Optional } from "@lilbunnyrabbit/optional";
import { v4 as uuidv4 } from "uuid";
import type { TaskManager } from "../task-manager";
import { TaskBase } from "./task-base";
import type { TaskBuilder, TaskConfig } from "./task-builder";
import type { ParsedTask, TaskSpec } from "./task.type";
import { TaskQuery } from "../task-query/task-query";

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
  private _query?: TaskQuery;

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
  public bind(query: TaskQuery) {
    this._query = query;
  }

  /**
   * Retrieves the {@link TaskManager} to which this task is bound.
   *
   * @returns Associated {@link TaskManager}.
   * @throws If the task is not bound to a {@link TaskManager}.
   */
  public get query(): TaskQuery {
    if (!this._query) {
      throw new Error("Missing TaskQuery. Please use Task.bind(TaskQuery).");
    }

    return this._query;
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
