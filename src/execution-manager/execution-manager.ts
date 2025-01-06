import { TaskError } from "../helpers/task-error";
import { Task } from "../task";
import { TaskSpec } from "../task/task.type";
import { ExecutionManagerFlag } from "./execution-manager.type";
import { ExecutionQuery } from "./execution-query";

/**
 * TODO: Impossible to extend events
 * https://stackoverflow.com/questions/79230271/argument-type-error-with-extended-record-properties
 */
export interface ExecutionManagerEvents<TParsed> extends Record<PropertyKey, unknown> {
  /**
   * Emits when any state (status, progress, or flags) of the manager changes.
   */
  change: void;
  /**
   * Emits when task progress is updated.
   */
  progress: number;
  /**
   * Emits when a new task is in progress.
   */
  task: Task<TaskSpec, TParsed>;
  /**
   * Emits when a task fails and `FAIL_ON_ERROR` flag is set.
   */
  fail: TaskError | Error;
  /**
   * Emits when all tasks in the queue are executed successfully.
   */
  success: void;
  /**
   * Emits when task throws.
   */
  error: TaskError | Error;
}

export class ExecutionManager<
  TParsed,
  TStatus extends string,
  TFlag extends Record<string, string>
> extends ExecutionQuery<TParsed, TStatus, TFlag> {
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
  public async execute(force?: boolean) {
    if (!this.queue.length) {
      return console.warn("TaskManager empty queue.");
    }

    if (!this.isStatus("idle", "stopped") && !(force && this.isStatus("fail"))) {
      switch (this.status) {
        case "fail":
          return console.warn("ExecutionManager failed.");
        case "success":
          return console.warn("ExecutionManager succeeded.");
        default:
          return console.warn("ExecutionManager is already in progress.");
      }
    }

    if (this.hasFlag(ExecutionManagerFlag.STOP)) {
      this.removeFlag(ExecutionManagerFlag.STOP);
    }

    this.setStatus("in-progress");

    while (this.queue.length > 0) {
      try {
        if (this.hasFlag(ExecutionManagerFlag.PARALLEL_EXECUTION)) {
          await this.executeParallel();
        } else {
          await this.executeLinear();
        }
      } catch (error: any) {
        if (this.hasFlag(ExecutionManagerFlag.FAIL_ON_ERROR)) {
          return this.setStatus("fail").emit("fail", error);
        }
      }

      if (this.hasFlag(ExecutionManagerFlag.STOP)) {
        return this.removeFlag(ExecutionManagerFlag.STOP).setStatus("stopped");
      }
    }

    return this.setStatus("success").emit("success");
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

    try {
      return await task.execute();
    } catch (error: any) {
      const taskError = new TaskError(task, error);

      this.emit("error", taskError);

      throw taskError;
    }
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
          const taskError = new TaskError(task, error);

          this.emit("error", taskError);

          throw taskError;
        }
      });
    };

    if (this.hasFlag(ExecutionManagerFlag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }
}
