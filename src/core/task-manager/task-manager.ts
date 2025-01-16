import { Task, TaskQuery } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode } from "../../common";
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
  /**
   * Query interface for accessing and managing tasks.
   */
  public query = new TaskQuery(this.tasks);

  /**
   * Adds an array of tasks to the task queue.
   *
   * @param tasks - An array of tasks to add to the queue.
   * @emits change - When the task queue is updated.
   * @returns The instance of the task manager.
   */
  public addTasks(tasks: ExecutableTask[]) {
    this.queue.push(
      ...tasks.map((task) => {
        if (task instanceof Task) {
          task.bind(this.query);
        }

        return task;
      })
    );

    this.emit("change");

    return this;
  }

  /**
   * Calculates the overall progress of the tasks.
   *
   * @returns The calculated progress as a value between 0 and 1.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => {
      if (task.isStatus("error") && this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)) {
        return progress + 1;
      }

      return progress + task.progress;
    }, 0);

    return tasksProgress / (this.queue.length + this.tasks.length);
  }

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
    if (!this.queue.length) {
      return console.warn("TaskManager empty queue.");
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

    while (this.queue.length > 0) {
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
        if (!this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)) {
          return this.setStatus("error").emit("fail", error);
        }
      }

      if (this.hasFlag(TaskManagerFlag.STOP) && this.queue.length) {
        return this.removeFlag(TaskManagerFlag.STOP).setStatus("stopped");
      }
    }

    return this.setProgress(1).setStatus("success").emit("success");
  }

  /**
   * Executes tasks in a linear sequence.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes.
   * @emits progress - When task progress is updated.
   * @returns A promise that resolves when all tasks in the queue are executed sequentially.
   */
  private async executeLinear() {
    const task = this.queue.shift();
    if (!task) return;

    this.tasks.push(task);

    this.emit("task", task).emit("change");

    task.on("progress", () => {
      this.setProgress(this.calculateProgress());
    });

    return await task.execute();
  }

  /**
   * Executes tasks in parallel.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes.
   * @emits progress - When task progress is updated.
   * @returns A promise that resolves when all tasks in the queue are executed concurrently.
   */
  private async executeParallel() {
    const queueTasks = [...this.queue];
    this.queue = [];

    this.tasks.push(...queueTasks);

    const executeTasks = () => {
      return queueTasks.map(async (task) => {
        this.emit("task", task).emit("change");

        task.on("progress", () => {
          this.setProgress(this.calculateProgress());
        });

        try {
          await task.execute();
        } catch (error: any) {
          throw { task, error };
        }
      });
    };

    if (this.hasFlag(TaskManagerFlag.CONTINUE_ON_ERROR)) {
      return await Promise.allSettled(executeTasks());
    }

    return await Promise.all(executeTasks());
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

    const tmp = [...this.tasks, ...this.queue];

    this.queue = [];
    this.tasks = [];
    this.status = "idle";
    this.progress = 0;

    this.addTasks(tmp.map((task) => task.clone()));
  }

  /**
   * Clears the task queue.
   *
   * @emits change - When the queue is cleared.
   * @returns The instance of the task manager.
   */
  public clearQueue(): this {
    this.queue = [];

    this.setProgress(this.calculateProgress());
    this.setStatus("success").emit("change");
    return this;
  }
}
