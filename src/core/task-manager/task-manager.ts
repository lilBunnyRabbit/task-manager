import { Task } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode, TaskError, TasksError } from "../../common";
import { TaskManagerBase } from "./task-manager-base";
import { TaskManagerFlag } from "./task-manager.type";

/**
 * Manages task execution, including adding tasks to the queue, controlling task progress, and handling task lifecycle events.
 *
 * Supports executing tasks sequentially or in parallel and provides methods to query, retrieve, and manage task results.
 *
 * @extends TaskManagerBase
 */
export class TaskManager extends TaskManagerBase {
  constructor() {
    super();

    this.flowController.on("transition", (transition) => {
      this.emit("transition", transition);

      this.updateProgress();
    });
  }

  public get isEmptyQueue() {
    return !this.flowController.hasPending;
  }

  public addTask(task: ExecutableTask) {
    if (task instanceof Task) {
      task.bind(this.query);
    }

    this.flowController.addTask(task);

    return this;
  }

  // TODO: Update docs
  /**
   * Adds an array of tasks to the task queue.
   *
   * @param tasks - An array of tasks to add to the queue.
   *
   * @returns The instance of the task manager.
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

  // TODO: Update docs
  /**
   * Starts the execution of tasks in the task manager.
   *
   * @param force - Force start even if in "fail" status.
   * @emits fail - When a task fails and the `FAIL_ON_ERROR` flag is set.
   * @emits success - When all tasks are successfully executed.
   * @emits progress - When task progress is updated.
   * @emits change - When the task manager state changes.
   * @returns A promise that resolves when task execution starts.
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
        default:
          return console.warn("TaskManager is already in progress.");
      }
    }

    if (this.hasFlag(TaskManagerFlag.STOP)) {
      this.removeFlag(TaskManagerFlag.STOP);
    }

    this.setStatus("in-progress");

    while (this.flowController.hasPending) {
      try {
        switch (this.mode) {
          case ExecutionMode.LINEAR: {
            await this.executeLinear();
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

    return this.setProgress(1).setStatus("success").emit("success");
  }

  // TODO: Update docs
  /**
   * Executes tasks in a linear sequence.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes.
   * @emits progress - When task progress is updated.
   * @returns A promise that resolves when all tasks in the queue are executed sequentially.
   */
  private async executeLinear() {
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
    } catch (error) {
      throw new TaskError(task, error);
    } finally {
      // Workaround
      if (task instanceof Task) {
        task.off("progress", onProgress);
      } else {
        task.off("progress", onProgress);
      }

      this.flowController.complete(task.id);
    }
  }

  // TODO: Update docs
  /**
   * Executes tasks in parallel.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes.
   * @emits progress - When task progress is updated.
   * @returns A promise that resolves when all tasks in the queue are executed concurrently.
   */
  private async executeParallel() {
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
        throw new TaskError(task, error);
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
      const results = await Promise.allSettled(executionPromises);

      const errors: Error[] = [];
      for (const result of results) {
        if (result.status === "rejected") {
          errors.push(result.reason);
        }
      }

      if (errors.length) {
        throw new TasksError(errors);
      }
    } finally {
      completeAll();
    }
  }

  /**
   * Stops the execution of tasks in the task manager.
   *
   * @emits change - When the task manager is stopped.
   */
  public stop() {
    if (!this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is not in-progress.`);
    }

    this.addFlag(TaskManagerFlag.STOP);
  }

  // TODO: Update docs
  /**
   * Resets the task manager to its initial state.
   *
   * @emits change - When the task manager is reset.
   * @emits progress - When the task progress is reset.
   */
  public reset() {
    if (this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is in-progress.`);
    }

    if (this.isStatus("idle")) {
      return console.warn(`${TaskManager.name} is already idle.`);
    }

    this.setProgress(0).setStatus("idle");

    const clearedTasks = this.flowController.reset();
    for (const task of clearedTasks) {
      this.addTask(task.clone());
    }
  }

  /**
   * TODO: Update docs
   *
   *
   * Clears the task queue.
   *
   * @emits change - When the queue is cleared.
   * @returns The instance of the task manager.
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
