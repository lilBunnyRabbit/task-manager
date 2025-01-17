import { v4 as uuidv4 } from "uuid";
import { Task } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode, TaskError, TasksError } from "../../common";
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
    tasks: ExecutableTask[]
  ) {
    super();

    this.id = uuidv4();

    this.flowController.on("transition", (transition) => {
      this.emit("transition", transition);
      this.calculateProgress();
    });

    this.flowController.addTasks(
      ...tasks.map((task) => {
        if (task instanceof Task) {
          task.bind(this.query);
        }

        return task;
      })
    );
  }

  /**
   * Calculates the overall progress of tasks in the group.
   *
   * @returns Overall progress as a number between 0 and 1.
   */
  private calculateProgress() {
    let progressSum = 0;

    const activeTasks = this.flowController.active.values();
    for (const task of activeTasks) {
      if (task.isStatus("error") && this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
        progressSum += 1;
      } else {
        progressSum += task.progress;
      }
    }

    const completedTasks = this.flowController.completed.values();
    for (const task of completedTasks) {
      if (task.isStatus("error") && this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
        progressSum += 1;
      } else {
        progressSum += task.progress;
      }
    }

    return progressSum / this.flowController.tasks.length;
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
    while (this.flowController.hasPending) {
      const task = this.flowController.startNext();
      if (!task) return;

      this.emit("task", task);

      const onProgress = () => {
        this.setProgress(this.calculateProgress());
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
    const executeTask = async (task: ExecutableTask) => {
      this.emit("task", task).emit("change");

      const onProgress = () => {
        this.setProgress(this.calculateProgress());
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

      if (this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
        return;
      }

      const errors: Error[] = [];
      for (const result of results) {
        if (result.status === "rejected") {
          errors.push(result.reason);
          if ("toString" in result.reason) {
            console.log(result.reason.toString());
          }
        }
      }

      if (errors.length) {
        throw new TasksError(errors);
      }
    } catch (error) {
      throw error;
    } finally {
      completeAll();
    }
  }

  /**
   * Returns a string representation of the task group.
   *
   * @returns A string representing the task group.
   */
  public toString(pretty?: boolean) {
    if (pretty === true) {
      return `TaskGroup {\n\tname: ${JSON.stringify(this.name)},\n\tid: "${this.id}"\n}`;
    }

    return `TaskGroup { name: ${JSON.stringify(this.name)}, id: "${this.id}" }`;
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
