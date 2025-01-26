import { Task } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode, TaskError, TasksError } from "../../common";
import { TaskManagerBase } from "./task-manager-base";
import { TaskManagerFlag } from "./task-manager.type";

/**
 * Manages task execution, including queue management, progress control, and event handling.
 *
 * Supports sequential and parallel execution modes and provides methods to query, retrieve, and manage task results.
 *
 * @extends TaskManagerBase
 */
export class TaskManager extends TaskManagerBase {
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

  /**
   * Executes tasks sequentially (linear mode).
   *
   * @returns A promise that resolves when all tasks are executed sequentially.
   * @emits task - When a task starts execution.
   * @emits progress - When task progress updates.
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

      this.flowController.complete(task.id);
    } catch (error: any) {
      this.flowController.complete(task.id, () => false);

      throw error;
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

  /**
   * Executes tasks concurrently (parallel mode).
   *
   * @returns A promise that resolves when all tasks are executed concurrently.
   * @emits task - When a task starts execution.
   * @emits progress - When task progress updates.
   */
  private async executeParallel() {
    const errors: Map<string, Error> = new Map();

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
        errors.set(task.id, error);

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

      if (errors.size) {
        throw new TasksError(Array.from(errors.values()));
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
