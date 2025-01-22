import { v4 as uuidv4 } from "uuid";
import { Task, TaskQuery } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode, TasksError } from "../../common";
import { TaskGroupBase } from "./task-group-base";
import { TaskGroupBuilder } from "./task-group-builder";
import { TaskGroupFlag } from "./task-group.type";
import { Optional } from "@lilbunnyrabbit/optional";

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
   * @param tasks - List of tasks to be executed.
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
   * @throws If the task group is not in the "idle" state or execution fails.
   */
  public async execute() {
    if (!this.isStatus("idle")) {
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
    } catch (error: any) {
      if (this.hasFlag(TaskGroupFlag.CONTINUE_ON_ERROR)) {
        this.emit("error", error);
      } else {
        this.setStatus("error").emit("error", error);

        throw error;
      }
    }

    return this.setProgress(1).setStatus("success").emit("success");
  }

  /**
   * Executes tasks sequentially (linear mode).
   *
   * @emits transition - When a task transitions states.
   * @emits progress - When progress is updated.
   * @emits error - When task fails.
   */
  private async executeLinear() {
    while (this.flowController.hasPending) {
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
      } catch (error: any) {
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

        this.flowController.complete(task.id);
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
