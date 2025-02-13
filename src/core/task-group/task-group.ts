import { Optional } from "@lilbunnyrabbit/optional";
import { v4 as uuidv4 } from "uuid";
import { FlowController, Task, TaskQuery } from "../";
import type { ExecutableTask } from "../../common";
import { ExecutionMode, TasksError } from "../../common";
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
   * Manages task execution and flow control.
   */
  protected flowController: FlowController = new FlowController();

  /**
   * Retrieves all tasks managed by the task group.
   */
  public get tasks() {
    return this.flowController.tasks;
  }

  /**
   * Query interface for accessing tasks.
   */
  readonly query: TaskQuery = new TaskQuery(this.flowController);

  /**
   * Creates a new {@link TaskGroup}.
   *
   * @param builder - Builder for creating the task group.
   * @param args - Arguments for the task group.
   * @param name - Name of the task group.
   * @param mode - Execution mode (sequential or parallel).
   * @param tasks - List of tasks to be executed.
   */
  constructor(
    readonly builder: TaskGroupBuilder<TArgs>,
    readonly args: TArgs,
    readonly name: string,
    readonly mode: ExecutionMode = ExecutionMode.SEQUENTIAL,
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
   * Executes tasks sequentially (sequential mode).
   *
   * @emits transition - When a task transitions states.
   * @emits progress - When progress is updated.
   * @emits error - When task fails.
   */
  private async executeSequential() {
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

        this.flowController.complete(task.id);
      } catch (error: any) {
        this.flowController.complete(task.id, () => false);

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
