import { Optional } from "@lilbunnyrabbit/optional";
import { FlowController, Task, TaskQuery } from "../index.js";
import type { ExecutableTask } from "../../common/index.js";
import { ExecutionMode, TaskError, TasksError } from "../../common/index.js";
import { createAbortError } from "../../utils/index.js";
import { needsRetry, requeueForRetry } from "../flow-controller/flow-controller.requeue.js";
import { TaskGroupBase } from "./task-group-base.js";
import type { TaskGroupBuilder } from "./task-group-builder.js";
import { TaskGroupFlag } from "./task-group.type.js";

/**
 * Represents a group of tasks that can be executed in different modes.
 *
 * @template TArgs - Arguments used to create the task group.
 * @extends TaskGroupBase
 */
export class TaskGroup<TArgs extends unknown[] = unknown[]> extends TaskGroupBase {
  /**
   * Unique identifier for the task group.
   */
  readonly id!: string;

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

  /**
   * Controller behind {@link signal}. Replaced on {@link retry}.
   */
  private controller = new AbortController();

  /**
   * Signal aborted when the task group is cancelled, directly or by its parent.
   * Aborting it cancels every running and pending task in the group.
   */
  public get signal(): AbortSignal {
    return this.controller.signal;
  }

  /**
   * Creates a new {@link TaskGroup}.
   *
   * @param builder - Builder for creating the task group.
   * @param args - Arguments for the task group.
   * @param name - Name of the task group.
   * @param mode - Execution mode (sequential or parallel).
   * @param tasks - List of tasks to be executed.
   */
  constructor(
    readonly builder: TaskGroupBuilder<TArgs>,
    readonly args: TArgs,
    readonly name: string,
    readonly mode: ExecutionMode = ExecutionMode.SEQUENTIAL,
    tasks: ExecutableTask[]
  ) {
    super();

    this.id = crypto.randomUUID();

    this.flowController.on("transition", (transition) => {
      this.emit("transition", transition);

      this.updateProgress();
    });

    this.flowController.addTasks(...tasks.map((task) => task.bind(this.query)));
  }

  /**
   * Binds the task group to a parent {@link TaskQuery}.
   *
   * @param query - TaskQuery instance.
   * @returns Instance of the task group for chaining.
   */
  public bind(query: TaskQuery) {
    // TODO: Not ideal solution.
    (this.query as any)["_parent"] = Optional(query);

    return this;
  }

  /**
   * Updates the progress of the task group.
   */
  private updateProgress() {
    return this.setProgress(this.flowController.calculateProgress(this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)));
  }

  /**
   * Executes the task group based on the specified execution mode.
   *
   * @returns A promise that resolves when execution is complete.
   * @throws If the task group is not in the "idle" state, if execution fails,
   *         or a {@link TaskError} holding the abort reason if the group is cancelled.
   * @emits success - When all tasks complete.
   * @emits error - When a task fails.
   * @emits cancel - When the group is cancelled while running.
   */
  public async execute() {
    if (!this.isStatus("idle")) {
      throw new Error('TaskGroup is not in "idle" state.');
    }

    this.setStatus("in-progress");

    try {
      switch (this.mode) {
        case ExecutionMode.SEQUENTIAL: {
          await this.executeSequential();
          break;
        }

        case ExecutionMode.PARALLEL: {
          await this.executeParallel();
          break;
        }

        default:
          throw new Error(`Invalid ExecutionMode mode "${this.mode}"`);
      }
    } catch (error: any) {
      if (this.signal.aborted) {
        throw this.settleCancelled();
      }

      if (this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
        this.emit("error", error);
      } else {
        this.setStatus("error").emit("error", error);

        throw error;
      }
    }

    if (this.signal.aborted) {
      throw this.settleCancelled();
    }

    return this.setProgress(1).setStatus("success").emit("success");
  }

  /**
   * Cancels the task group by aborting its {@link signal}, which cancels its running and pending tasks.
   *
   * - `idle`: becomes `cancelled` right away.
   * - `in-progress`: `execute` rejects with a {@link TaskError} holding the reason and the group becomes `cancelled`.
   * - Otherwise: no-op.
   *
   * @param reason - Abort reason, defaults to a `DOMException` named `"AbortError"`.
   * @returns Instance of the task group for chaining.
   * @emits cancel - With the abort reason.
   */
  public cancel(reason: unknown = createAbortError(`${this} cancelled.`)) {
    if (!this.isStatus("idle", "in-progress")) {
      return this;
    }

    const wasIdle = this.isStatus("idle");

    this.controller.abort(reason);

    for (const task of [...this.flowController.pending.values(), ...this.flowController.active.values()]) {
      task.cancel(this.signal.reason);
    }

    if (wasIdle) {
      this.settleCancelled();
    }

    return this;
  }

  /**
   * Prepares the task group to run again after it failed or was cancelled.
   *
   * Successful tasks are kept (with their results, still visible to {@link TaskQuery}). Failed and cancelled
   * tasks are replaced by fresh clones, nested groups are retried in place, and the group goes back to "idle"
   * with a fresh {@link signal}. The group does not start itself: its parent (or a direct `execute()` call) runs it.
   *
   * No-op if nothing in the group failed or was cancelled.
   *
   * @returns Instance of the task group for chaining.
   * @throws If the task group is in progress.
   */
  public retry(): this {
    if (this.isStatus("in-progress")) {
      throw new Error('TaskGroup is in "in-progress" state.');
    }

    if (!needsRetry(this)) {
      return this;
    }

    requeueForRetry(this.flowController, (task) => task.bind(this.query));

    this.controller = new AbortController();
    this.setStatus("idle").updateProgress();

    return this;
  }

  /**
   * Marks a running or idle task group as cancelled.
   *
   * @returns Error to throw from `execute`.
   */
  private settleCancelled() {
    this.setStatus("cancelled").emit("cancel", this.signal.reason);

    return new TaskError(this, this.signal.reason);
  }

  /**
   * Handles a task that cancelled itself while the group was not cancelled.
   *
   * With `CONTINUE_ON_ERROR` the task is skipped, otherwise the cancellation spreads to the whole group.
   *
   * @param task - Cancelled task.
   * @returns `true` if execution should continue.
   */
  private onTaskCancelled(task: ExecutableTask) {
    if (this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
      return true;
    }

    this.cancel(task.signal.reason);

    return false;
  }

  /**
   * Executes tasks sequentially (sequential mode).
   *
   * @emits transition - When a task transitions states.
   * @emits progress - When progress is updated.
   * @emits error - When task fails.
   */
  private async executeSequential() {
    while (this.flowController.hasPending && !this.signal.aborted) {
      const task = this.flowController.startNext();
      if (!task) return;

      const onProgress = () => {
        this.updateProgress();
      };

      // Workaround
      if (task instanceof Task) {
        task.on("progress", onProgress);
      } else {
        task.on("progress", onProgress);
      }

      try {
        await task.execute();

        this.flowController.complete(task.id);
      } catch (error: any) {
        this.flowController.complete(task.id, () => false);

        if (this.signal.aborted) {
          throw error;
        }

        if (task.isStatus("cancelled")) {
          if (this.onTaskCancelled(task)) continue;

          throw error;
        }

        if (!this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
          throw error;
        }

        this.emit("error", error);
      } finally {
        // Workaround
        if (task instanceof Task) {
          task.off("progress", onProgress);
        } else {
          task.off("progress", onProgress);
        }
      }
    }
  }

  /**
   * Executes tasks concurrently (parallel mode).
   *
   * @emits transition - When a task transitions states.
   * @emits progress - When progress is updated.
   */
  private async executeParallel() {
    const errors: Map<string, { task: ExecutableTask; error: Error }> = new Map();

    const executeTask = async (task: ExecutableTask) => {
      const onProgress = () => {
        this.updateProgress();
      };

      // Workaround
      if (task instanceof Task) {
        task.on("progress", onProgress);
      } else {
        task.on("progress", onProgress);
      }

      try {
        await task.execute();
      } catch (error: any) {
        errors.set(task.id, { task, error });

        throw error;
      } finally {
        // Workaround
        if (task instanceof Task) {
          task.off("progress", onProgress);
        } else {
          task.off("progress", onProgress);
        }
      }
    };

    const executionPromises: Promise<void>[] = [];
    const completeAll = this.flowController.startAll((task) => {
      executionPromises.push(executeTask(task));
    });

    try {
      await Promise.allSettled(executionPromises);

      if (this.signal.aborted) {
        throw this.signal.reason;
      }

      const failed = Array.from(errors.values()).filter(({ task }) => !task.isStatus("cancelled"));
      if (failed.length) {
        throw new TasksError(failed.map(({ error }) => error));
      }

      const cancelled = errors.values().next().value;
      if (cancelled && !this.onTaskCancelled(cancelled.task)) {
        throw cancelled.error;
      }
    } finally {
      completeAll((task) => !errors.has(task.id));
    }
  }

  /**
   * Converts the task group to a string representation.
   *
   * @param pretty - If `true`, formats the string for readability.
   * @returns String representation of the task group.
   */
  public toString(pretty?: boolean) {
    if (pretty === true) {
      return `TaskGroup {\n\tname: ${JSON.stringify(this.name)},\n\tid: "${this.id}"\n}`;
    }

    return `TaskGroup { name: ${JSON.stringify(this.name)}, id: "${this.id}" }`;
  }

  /**
   * Clones the task group.
   *
   * @returns A new {@link TaskGroup} instance with the same configuration.
   */
  public clone() {
    return this.builder(...this.args);
  }
}
