import { Task, TaskBuilder, isTask } from "../task";
import { TaskSpec } from "../task/task.type";
import { TaskManagerBase } from "./task-manager-base";
import { TaskManagerFlag } from "./task-manager.type";

/**
 * Manages task execution, including adding tasks to the queue, controlling task progress, and handling task lifecycle events.
 * Supports executing tasks sequentially or in parallel and provides methods to query, retrieve, and manage task results.
 *
 * @extends TaskManagerBase - Inherits core functionalities like status, progress, and event emission.
 */
export class TaskManager<TParsed = string> extends TaskManagerBase<TParsed> {
  /**
   * Adds an array of tasks to the task queue.
   *
   * @param tasks - An array of tasks to add to the queue.
   * @emits change
   *
   * @returns The instance of the manager.
   */
  public addTasks(tasks: Task<TaskSpec, TParsed>[]) {
    this.queue.push(
      ...tasks.map((task) => {
        task.bind(this);
        return task;
      })
    );

    this.emit("change");

    return this;
  }

  /**
   * Calculates the overall progress of the tasks.
   *
   * @returns The calculated progress based on the task's execution status.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  /**
   * Executes tasks in a linear sequence.
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task manager state changes (new task in progress).
   * @emits progress - When task progress is updated.
   *
   * @returns A promise that resolves when all tasks in the queue have been executed linearly.
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
   * @emits change - When the task manager state changes (new task in progress).
   * @emits progress - When task progress is updated.
   *
   * @returns A promise that resolves when all tasks in the queue have been executed in parallel.
   */
  private async executeParallel() {
    const queueTasks = [...this.queue];
    this.clearQueue();

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

    if (this.hasFlag(TaskManagerFlag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }

  /**
   * Starts the execution of tasks in the task manager.
   *
   * @param force - Force start even if in "fail" status.
   * @emits fail - When a task fails and the `FAIL_ON_ERROR` flag is set.
   * @emits success - When all tasks are successfully executed.
   * @emits progress - When task progress is updated.
   * @emits change - When the task manager state changes.
   *
   * @returns A promise that resolves when task execution starts.
   */
  public async start(force?: boolean) {
    if (!this.queue.length) {
      return console.warn("TaskManager empty queue.");
    }

    if (!this.isStatus("idle", "stopped") && !(force && this.isStatus("fail"))) {
      switch (this.status) {
        case "fail":
          return console.warn(`${TaskManager.name} failed.`);
        case "success":
          return console.warn(`${TaskManager.name} succeeded.`);
        default:
          return console.warn(`${TaskManager.name} is already in progress.`);
      }
    }

    if (this.hasFlag(TaskManagerFlag.STOP)) {
      this.removeFlag(TaskManagerFlag.STOP);
    }

    this.setStatus("in-progress");

    while (this.queue.length > 0) {
      try {
        if (this.hasFlag(TaskManagerFlag.PARALLEL_EXECUTION)) {
          await this.executeParallel();
        } else {
          await this.executeLinear();
        }
      } catch (error: any) {
        if (this.hasFlag(TaskManagerFlag.FAIL_ON_ERROR)) {
          return this.setStatus("fail").emit("fail", error);
        }
      }

      if (this.hasFlag(TaskManagerFlag.STOP)) {
        return this.removeFlag(TaskManagerFlag.STOP).setStatus("stopped");
      }
    }

    return this.setStatus("success").emit("success");
  }

  /**
   * Stops the execution of tasks in the task manager.
   *
   * @emits change
   */
  public stop() {
    if (!this.isStatus("in-progress")) {
      return console.warn(`${TaskManager.name} is not in-progress.`);
    }

    this.addFlag(TaskManagerFlag.STOP);
  }

  /**
   * Resets the task manager to its initial state.
   * @emits change - When the task manager is reset.
   * @emits progress - When the task manager progress is reset.
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

    this.emit("progress", this.progress);
    this.addTasks(tmp.map((task) => task.clone()));
  }

  /**
   * Clears the task queue.
   *
   * @emits change
   *
   * @returns The instance of the manager.
   */
  public clearQueue(): this {
    this.queue = [];

    this.emit("change");
    return this;
  }
}
