import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import { v4 as uuidv4 } from "uuid";
import type { TaskManager } from "../";
import { TaskQuery } from "../";
import { LogEntry, Logger, TaskError } from "../../common";
import { TaskBase } from "./task-base";
import type { TaskBuilder, TaskConfig } from "./task-builder";
import type { ParsedTask, TaskSpec } from "./task.type";

/**
 * Single task in the task manager system.
 *
 * @template TData - Type of input data.
 * @template TResult - Type of result data.
 * @template TError - Type of possible error.
 * @extends TaskBase
 */
export class Task<TSpec extends TaskSpec = TaskSpec> extends TaskBase<TSpec> {
  /**
   * Unique task identifier.
   */
  readonly id!: string;

  /**
   * Task logger.
   */
  protected logger = new Logger(this as unknown as EventEmitter<{ log: LogEntry }>);

  /**
   * Task logs.
   */
  public get logs() {
    return this.logger.logs;
  }

  /**
   * {@link TaskQuery} instance bound to the task.
   *
   * This query originates from either a {@link TaskManager} or {@link TaskGroup}.
   */
  private _query?: TaskQuery;

  /**
   * Creates a {@link Task} instance.
   *
   * @param builder - Task builder function.
   * @param name - Task name.
   * @param _config - Task configuration.
   * @param data - Input data for the task.
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
   * Binds the task to a {@link TaskQuery}.
   *
   * The query originates from either a {@link TaskManager} or a {@link TaskGroup}.
   *
   * @param query - TaskQuery instance.
   */
  public bind(query: TaskQuery) {
    this._query = query;
  }

  /**
   * Retrieves the {@link TaskQuery} to which this task is bound.
   *
   * The query originates from either a {@link TaskManager} or a {@link TaskGroup}.
   *
   * @returns Associated {@link TaskQuery}.
   * @throws If the task is not bound to a {@link TaskQuery}.
   */
  public get query(): TaskQuery {
    if (!this._query) {
      throw new Error("Missing TaskQuery. Please use Task.bind(TaskQuery).");
    }

    return this._query;
  }

  /**
   * Executes the task.
   *
   * @returns Result of the task execution.
   * @throws If not in "idle" state or if execution fails.
   */
  public async execute(): Promise<Optional<TSpec["TResult"]>> {
    if (this.status !== "idle") {
      throw new Error('Task is not in "idle" state.');
    }

    this.setStatus("in-progress");

    try {
      const result = await Promise.resolve(this._config.execute.bind(this)(this.data));
      this.result = Optional(result);

      this.setProgress(1).setStatus("success").emit("success");

      return this.result;
    } catch (error) {
      this.logger.error(String(error));

      this.setStatus("error").emit("error", error);

      throw new TaskError(this, error);
    }
  }

  /**
   * Parses the task for UI rendering.
   *
   * @returns Parsed representation of the task.
   */
  public parse(): ParsedTask {
    const parsed = this._config.parse?.bind(this)() ?? {};

    return {
      status: this.status,
      result: this.result.isPresent() ? `${this.result.get()}` : undefined,

      ...parsed,
    };
  }

  /**
   * String representation of the task.
   *
   * @returns Task as a string.
   */
  public toString(pretty?: boolean) {
    if (pretty === true) {
      return `Task {\n\tname: ${JSON.stringify(this.name)},\n\tid: "${this.id}"\n}`;
    }

    return `Task { name: ${JSON.stringify(this.name)}, id: "${this.id}" }`;
  }

  /**
   * Clones the task.
   *
   * @returns New task instance with the same configuration and data.
   */
  public clone() {
    return this.builder(this.data);
  }
}
