import { v4 as uuidv4 } from "uuid";
import { Task, TaskQuery } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode } from "../../common";
import { TaskGroupBase } from "./task-group-base";
import { TaskGroupBuilder } from "./task-group-builder";
import { TaskGroupFlag } from "./task-group.type";

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
   * Query interface for accessing tasks in the group.
   */
  public query = new TaskQuery(this.tasks);

  /**
   * Creates a new {@link TaskGroup}.
   *
   * @param builder - Builder for creating the task group.
   * @param args - Arguments for the task group.
   * @param name - Name of the task group.
   * @param mode - Execution mode (linear or parallel).
   * @param _queue - Queue of tasks to be executed.
   */
  constructor(
    readonly builder: TaskGroupBuilder<TArgs>,
    private args: TArgs,
    readonly name: string,
    readonly mode: ExecutionMode = ExecutionMode.LINEAR,
    protected _queue: ExecutableTask[]
  ) {
    super();

    this.id = uuidv4();
    _queue.forEach((task) => {
      if (task instanceof Task) {
        task.bind(this.query);
      }
    });
  }

  /**
   * Calculates the overall progress of tasks in the group.
   *
   * @returns Overall progress as a number between 0 and 1.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  /**
   * Executes the task group based on the specified execution mode.
   *
   * @returns A promise that resolves when execution is complete.
   * @throws If the task group is not in the "idle" state or execution fails.
   */
  public async execute() {
    if (this.status !== "idle") {
      throw new Error('TaskGroup is not in "idle" state.');
    }

    this.setStatus("in-progress");

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
    } catch (error) {
      // this.addError(error as TSpec["TError"]);
      this.setStatus("error");
      throw error;
    }

    return this.setStatus("success").emit("success");
  }

  /**
   * Executes tasks sequentially (linear mode).
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task group state changes.
   * @emits progress - When progress updates.
   * @returns A promise that resolves when all tasks are executed linearly.
   */
  private async executeLinear() {
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) return;

      this.tasks.push(task);

      this.emit("task", task).emit("change");

      task.on("progress", () => {
        this.setProgress(this.calculateProgress());
      });

      await task.execute();
    }
  }

  /**
   * Executes tasks concurrently (parallel mode).
   *
   * @emits task - When a task is picked for execution.
   * @emits change - When the task group state changes.
   * @emits progress - When progress updates.
   * @returns A promise that resolves when all tasks are executed in parallel.
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

    if (this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
      return await Promise.allSettled(executeTasks());
    }

    return await Promise.all(executeTasks());
  }

  /**
   * Returns a string representation of the task group.
   *
   * @returns A string representing the task group.
   */
  public toString() {
    return `TaskGroup {\n\tname: ${JSON.stringify(this.name)},\n\tid: "${this.id}"\n}`;
  }

  /**
   * Creates a clone of the task group.
   *
   * @returns A new {@link TaskGroup} instance with the same configuration.
   */
  public clone() {
    return this.builder(...this.args);
  }
}
