import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { Optional } from "@lilbunnyrabbit/optional";
import type { TaskGroup, TaskManager } from "../index.js";
import { TaskQuery } from "../index.js";
import type { LogEntry } from "../../common/index.js";
import { Logger, TaskError } from "../../common/index.js";
import { abortableDelay, createAbortError, isAbortError, raceAbort } from "../../utils/index.js";
import { TaskBase } from "./task-base.js";
import type { TaskBuilder, TaskConfig } from "./task-builder.js";
import type { ParsedTask, TaskSpec } from "./task.type.js";

/**
 * Single task within the task management system.
 *
 * @template TSpec - Task specification type.
 * @extends TaskBase
 */
export class Task<TSpec extends TaskSpec = TaskSpec> extends TaskBase<TSpec> {
  /**
   * Unique identifier for the task.
   */
  readonly id!: string;

  /**
   * Logger for task-related events.
   */
  protected logger = new Logger(this as unknown as EventEmitter<{ log: LogEntry }>);

  /**
   * Logs recorded for the task.
   */
  public get logs() {
    return this.logger.logs;
  }

  /**
   * {@link TaskQuery} instance bound to this task.
   *
   * The query originates from either a {@link TaskManager} or {@link TaskGroup}.
   */
  private _query?: TaskQuery;

  /**
   * Controller behind {@link signal}. Every task instance (and so every clone) gets its own.
   */
  private readonly controller = new AbortController();

  /**
   * Signal aborted when the task is cancelled, directly or by its parent {@link TaskGroup} / {@link TaskManager}.
   *
   * Pass it to cancellable APIs inside `execute` (`fetch(url, { signal: this.signal })`).
   */
  readonly signal: AbortSignal = this.controller.signal;

  /**
   * Creates a new task instance.
   *
   * @param builder - Builder used to create the task.
   * @param name - Name of the task.
   * @param _config - Configuration for the task.
   * @param data - Input data for the task.
   */
  constructor(
    readonly builder: TaskBuilder<TSpec>,
    readonly name: string,
    private _config: Omit<TaskConfig<TSpec>, "name">,
    readonly data: TSpec["TData"]
  ) {
    super();
    this.id = crypto.randomUUID();
  }

  /**
   * Binds the task to a {@link TaskQuery}.
   *
   * @param query - TaskQuery instance.
   * @returns Instance of the task for chaining.
   */
  public bind(query: TaskQuery) {
    this._query = query;

    return this;
  }

  /**
   * Gets the {@link TaskQuery} instance bound to this task.
   *
   * @returns TaskQuery instance.
   * @throws If the task is not bound to a query.
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
   * With a `retry` config, a failing `execute` runs again (after an abortable delay) until it succeeds or the attempts run out.
   * A cancelled task rejects immediately, even if `execute` ignores {@link signal}.
   *
   * @returns Result wrapped in `Optional`.
   * @throws If the task is not in "idle" state, or a {@link TaskError} if execution fails or is cancelled.
   * @emits success - When the task succeeds.
   * @emits error - When the task fails (after the last attempt).
   * @emits retry - When an attempt fails and another one follows.
   * @emits cancel - When the task is cancelled while running.
   */
  public async execute(): Promise<Optional<TSpec["TResult"]>> {
    if (this.status !== "idle") {
      throw new Error('Task is not in "idle" state.');
    }

    this.setStatus("in-progress");

    const retry = this._config.retry;
    const attempts = Math.max(1, Math.floor(retry?.attempts ?? 1));

    for (let attempt = 1; ; attempt++) {
      try {
        const result = await raceAbort(
          Promise.resolve(this._config.execute.bind(this)(this.data)),
          this.signal
        );
        this.result = Optional(result);

        this.setProgress(1).setStatus("success").emit("success");

        return this.result;
      } catch (error) {
        if (this.signal.aborted) {
          throw this.settleCancelled();
        }

        if (!retry || attempt >= attempts || isAbortError(error)) {
          this.logger.error(String(error));

          this.setStatus("error").emit("error", error);

          throw new TaskError(this, error);
        }

        const delay_ms = retry.backoff === "exponential" ? retry.delay_ms * 2 ** (attempt - 1) : retry.delay_ms;

        this.logger.warn(`Attempt ${attempt}/${attempts} failed, retrying in ${delay_ms}ms.`, error);
        this.emit("retry", { attempt, attempts, delay_ms, error });

        try {
          await abortableDelay(delay_ms, this.signal);
        } catch {
          throw this.settleCancelled();
        }

        this.setProgress(0);
      }
    }
  }

  /**
   * Cancels the task by aborting its {@link signal}.
   *
   * - `idle`: becomes `cancelled` right away.
   * - `in-progress`: `execute` rejects with a {@link TaskError} holding the reason and the task becomes `cancelled`.
   * - Otherwise: no-op.
   *
   * @param reason - Abort reason, defaults to a `DOMException` named `"AbortError"`.
   * @returns Instance of the task for chaining.
   * @emits cancel - With the abort reason.
   */
  public cancel(reason: unknown = createAbortError(`${this} cancelled.`)) {
    if (this.isStatus("idle")) {
      this.controller.abort(reason);
      this.logger.info("Cancelled.");
      this.setStatus("cancelled").emit("cancel", this.signal.reason);
    } else if (this.isStatus("in-progress")) {
      this.controller.abort(reason);
    }

    return this;
  }

  /**
   * Marks a running task as cancelled.
   *
   * @returns Error to throw from `execute`.
   */
  private settleCancelled() {
    this.logger.info("Cancelled.");
    this.setStatus("cancelled").emit("cancel", this.signal.reason);

    return new TaskError(this, this.signal.reason);
  }

  /**
   * Parses the task for UI rendering.
   *
   * @returns Parsed task data.
   */
  public parse(): ParsedTask {
    const parsed = this._config.parse?.bind(this)() ?? {};

    return {
      status: this.status,
      result: this.result.isPresent() ? `${this.result.get()}` : undefined,
      message: this.message ?? undefined,

      ...parsed,
    };
  }

  /**
   * Converts the task to a string representation.
   *
   * @param pretty - If true, formats the string for readability.
   * @returns String representation of the task.
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
   * @returns New task instance with the same configuration and data, in "idle" state with a fresh {@link signal}.
   */
  public clone() {
    return this.builder(this.data);
  }
}
