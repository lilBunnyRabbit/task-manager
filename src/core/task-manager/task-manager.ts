import { FlowController, Task, TaskQuery } from "../index.js";
import type { ExecutableTask } from "../../common/index.js";
import { ExecutionMode, TasksError } from "../../common/index.js";
import { createAbortError } from "../../utils/index.js";
import { needsRetry, requeueForRetry } from "../flow-controller/flow-controller.requeue.js";
import { TaskManagerBase } from "./task-manager-base.js";
import { TaskManagerFlag } from "./task-manager.type.js";

/**
 * Manages task execution, including queue management, progress control, and event handling.
 *
 * Supports sequential and parallel execution modes and provides methods to query, retrieve, and manage task results.
 *
 * @extends TaskManagerBase
 */
export class TaskManager extends TaskManagerBase {
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

  /**
   * Controller behind {@link signal}. Replaced on {@link reset} and {@link retry}.
   */
  private controller = new AbortController();

  /**
   * Signal aborted when the task manager is cancelled.
   * Aborting it cancels every running and pending task.
   */
  public get signal(): AbortSignal {
    return this.controller.signal;
  }

  /**
   * Initializes a new `TaskManager` instance.
   */
  constructor() {
    super();

    this.flowController.on("transition", (transition) => {
      this.emit("transition", transition);

      this.updateProgress();
    });
  }

  /**
   * Checks if the task queue is empty.
   */
  public get isEmptyQueue() {
    return !this.flowController.hasPending;
  }

  /**
   * Adds a task to the task queue.
   *
   * @param task - Task to add.
   * @returns The instance of the task manager for chaining.
   */
  public addTask(task: ExecutableTask) {
    this.flowController.addTask(task.bind(this.query));

    return this;
  }

  /**
   * Adds multiple tasks to the task queue.
   *
   * @param tasks - Array of tasks to add.
   * @returns The instance of the task manager for chaining.
   */
  public addTasks(...tasks: ExecutableTask[]) {
    for (const task of tasks) {
      this.addTask(task);
    }

    return this;
  }

  private updateProgress() {
    return this.setProgress(this.flowController.calculateProgress(this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)));
  }

  /**
   * Starts executing tasks in the queue.
   *
   * @param force - If `true`, starts even if the manager is in an error state.
   * @returns A promise that resolves when execution starts.
   * @emits progress - When task progress updates.
   * @emits success - When all tasks complete successfully.
   * @emits error - When a task or the manager encounters an error.
   * @emits fail - When a task fails and the `CONTINUE_ON_ERROR` flag is not set.
   * @emits cancel - When the manager is cancelled while running.
   */
  public async start(force?: boolean) {
    if (!this.flowController.hasPending) {
      return console.warn("No pending tasks.");
    }

    if (!this.isStatus("idle", "stopped") && !(force && this.isStatus("error"))) {
      switch (this.status) {
        case "error":
          return console.warn("TaskManager failed.");
        case "success":
          return console.warn("TaskManager succeeded.");
        case "cancelled":
          return console.warn("TaskManager was cancelled.");
        default:
          return console.warn("TaskManager is already in progress.");
      }
    }

    if (this.hasFlag(TaskManagerFlag.STOP)) {
      this.removeFlag(TaskManagerFlag.STOP);
    }

    this.setStatus("in-progress");

    while (this.flowController.hasPending) {
      if (this.signal.aborted) {
        return this.settleCancelled();
      }

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
          return this.settleCancelled();
        }

        if (this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)) {
          this.emit("error", error);
        } else {
          return this.setStatus("error").emit("error", error).emit("fail", error);
        }
      }

      if (this.hasFlag(TaskManagerFlag.STOP) && this.flowController.hasPending) {
        return this.setStatus("stopped");
      }
    }

    if (this.signal.aborted) {
      return this.settleCancelled();
    }

    return this.setProgress(1).setStatus("success").emit("success");
  }

  /**
   * Marks the task manager as cancelled.
   *
   * @returns Instance of the task manager for chaining.
   */
  private settleCancelled() {
    return this.setStatus("cancelled").emit("cancel", this.signal.reason);
  }

  /**
   * Handles a task that cancelled itself while the manager was not cancelled.
   *
   * With `CONTINUE_ON_ERROR` the task is skipped, otherwise the cancellation spreads to the whole manager.
   *
   * @param task - Cancelled task.
   * @returns `true` if execution should continue.
   */
  private onTaskCancelled(task: ExecutableTask) {
    if (this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)) {
      return true;
    }

    this.cancel(task.signal.reason);

    return false;
  }

  /**
   * Executes tasks sequentially (sequential mode).
   *
   * @returns A promise that resolves when all tasks are executed sequentially.
   * @emits task - When a task starts execution.
   * @emits progress - When task progress updates.
   */
  private async executeSequential() {
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

      if (!this.signal.aborted && task.isStatus("cancelled") && this.onTaskCancelled(task)) {
        return;
      }

      throw error;
    } finally {
      // Workaround
      if (task instanceof Task) {
        task.off("progress", onProgress);
      } else {
        task.off("progress", onProgress);
      }
    }
  }

  /**
   * Executes tasks concurrently (parallel mode).
   *
   * @returns A promise that resolves when all tasks are executed concurrently.
   * @emits task - When a task starts execution.
   * @emits progress - When task progress updates.
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
   * Stops task execution.
   */
  public stop() {
    if (!this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is not in-progress.`);
    }

    this.addFlag(TaskManagerFlag.STOP);
  }

  /**
   * Cancels execution by aborting {@link signal}: running tasks are cancelled (their `signal` aborts and they
   * reject right away) and pending tasks become "cancelled". Unlike {@link stop}, the run cannot be resumed with
   * {@link start}; use {@link retry} or {@link reset}.
   *
   * Works while "in-progress" or "stopped". Otherwise it only warns.
   *
   * @param reason - Abort reason, defaults to a `DOMException` named `"AbortError"`.
   * @emits cancel - With the abort reason, once the manager is "cancelled".
   */
  public cancel(reason: unknown = createAbortError("TaskManager cancelled.")) {
    if (!this.isStatus("in-progress", "stopped")) {
      return console.warn(`${TaskManager.name} is not in-progress or stopped.`);
    }

    const wasStopped = this.isStatus("stopped");

    this.controller.abort(reason);

    for (const task of [...this.flowController.pending.values(), ...this.flowController.active.values()]) {
      task.cancel(this.signal.reason);
    }

    if (wasStopped) {
      this.settleCancelled();
    }
  }

  /**
   * Re-runs what failed or was cancelled, keeping what succeeded.
   *
   * Successful tasks stay completed with their results, so {@link TaskQuery} still finds them. Failed and
   * cancelled tasks are replaced by fresh clones, a {@link TaskGroup} that failed (or holds a failed task) is
   * retried in place with {@link TaskGroup.retry}, and tasks that never ran stay queued. Then execution starts.
   *
   * @returns Promise from {@link start}.
   */
  public async retry() {
    if (this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is in-progress.`);
    }

    if (!this.tasks.some(needsRetry)) {
      return console.warn("No failed or cancelled tasks.");
    }

    requeueForRetry(this.flowController, (task) => task.bind(this.query));

    this.controller = new AbortController();
    this.setStatus("idle").updateProgress();

    return this.start();
  }

  /**
   * Resets the task manager to its initial state.
   */
  public reset() {
    if (this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is in-progress.`);
    }

    if (this.isStatus("idle")) {
      return console.warn(`${TaskManager.name} is already idle.`);
    }

    this.setProgress(0).setStatus("idle");
    this.controller = new AbortController();

    const clearedTasks = this.flowController.reset();
    for (const task of clearedTasks) {
      this.addTask(task.clone());
    }
  }

  /**
   * Clears all tasks from the queue.
   *
   * @returns The instance of the task manager for chaining.
   */
  public clearQueue(): this {
    this.flowController.clearQueue();

    this.updateProgress();

    if (this.isStatus("idle", "in-progress", "stopped")) {
      this.setStatus("success");
    }

    return this;
  }
}
