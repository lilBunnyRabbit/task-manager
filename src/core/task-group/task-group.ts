import { v4 as uuidv4 } from "uuid";
import { TaskQuery } from "../task-query/task-query";
import { Task } from "../task/task";
import { TaskGroupBase } from "./task-group-base";
import { TaskGroupBuilder } from "./task-group-builder";
import { ExecutableTask } from "../task-manager/task-manager.type";
import { TaskGroupFlag, TaskGroupMode } from "./task-group.type";

export class TaskGroup<TArgs extends unknown[] = unknown[]> extends TaskGroupBase {
  readonly id!: string;

  public query = new TaskQuery(this.tasks);

  /**
   * Creates an instance of {@link Task}.
   *
   * @param builder - Task builder function used to create new task instances.
   * @param name - Name of the task.
   * @param _config - Configuration object for the task.
   * @param data - Data required to execute the task.
   */
  constructor(
    readonly builder: TaskGroupBuilder<TArgs>,
    private args: TArgs,
    readonly name: string,
    readonly mode: TaskGroupMode = TaskGroupMode.LINEAR,
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
   * Calculates the overall progress of the tasks.
   *
   * @returns The calculated progress based on the task's execution status.
   */
  private calculateProgress() {
    const tasksProgress = this.tasks.reduce((progress, task) => progress + task.progress, 0);
    return tasksProgress / (this.queue.length + this.tasks.length);
  }

  /**
   * Executes the task, updating its status and handling the result or error.
   *
   * @returns Result of the task execution.
   * @throws If the task is not in the "idle" state or if the execution fails.
   */
  public async execute() {
    if (this.status !== "idle") {
      throw new Error('TaskGroup is not in "idle" state.');
    }

    this.setStatus("in-progress");

    try {
      switch (this.mode) {
        case TaskGroupMode.LINEAR:
          await this.executeLinear();
          break;

        case TaskGroupMode.PARALLEL:
          await this.executeParallel();
          break;

        default:
          throw new Error(`Invalid TaskGroup mode "${this.mode}"`);
      }
    } catch (error) {
      // this.addError(error as TSpec["TError"]);
      this.setStatus("error");
      throw error;
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
          throw { task, error };
        }
      });
    };

    if (this.hasFlag(TaskGroupFlag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }

  /**
   * Returns a string representation of the {@link Task} instance.
   *
   * @returns String representing the task.
   */
  public toString() {
    return `TaskGroup {
\tname: ${JSON.stringify(this.name)},
\tid: "${this.id}"
}`;
  }

  /**
   * Creates a clone of the current task.
   *
   * @returns New {@link Task} instance with the same configuration and data.
   */
  public clone() {
    return this.builder(...this.args);
  }
}
