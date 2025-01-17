import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { isNullable, isUndefined } from "@lilbunnyrabbit/utils";
import { ExecutableTask } from "../../common";
import { FlowControllerEvents, FlowState } from "./flow-controller.type";

/**
 * Manages the execution flow of tasks by organizing them into states (`pending`, `active`, and `completed`).
 *
 * The states are part of the internal structure of the {@link FlowController} and are used to manage task progression,
 * not properties of the tasks themselves.
 */
export class FlowController extends EventEmitter<FlowControllerEvents> {
  /**
   * List of all tasks managed by the controller.
   */
  private _tasks: ExecutableTask[] = [];

  // TODO: Update docs
  public get tasks() {
    return this._tasks;
  }

  private set tasks(tasks: ExecutableTask[]) {
    this._tasks = tasks;
  }

  /**
   * Collection of tasks that are ready to start but have not yet begun execution.
   */
  readonly pending: Map<string, ExecutableTask> = new Map();

  /**
   * Collection of tasks that are currently in progress.
   */
  readonly active: Map<string, ExecutableTask> = new Map();

  /**
   * Collection of tasks that have finished execution.
   */
  readonly completed: Map<string, ExecutableTask> = new Map();

  /**
   * Checks if there are any tasks in the `pending` collection.
   */
  public get hasPending() {
    return this.pending.size > 0;
  }

  /**
   * Validates if a state transition for a task is allowed within the {@link FlowController}.
   *
   * @param taskId - The ID of the task to validate.
   * @param from - The current state in the controller (optional).
   * @param to - The desired state in the controller (optional).
   * @returns `true` if the transition is valid, otherwise `false`.
   */
  private validTransition(taskId: string, from?: FlowState | null, to?: FlowState | null): boolean {
    if (!isNullable(from) && !this[from].has(taskId)) {
      console.warn(`ExecutableTask with id "${taskId}" is not in the "${from}" state.`);
      return false;
    }

    if (!isNullable(to) && this[to].has(taskId)) {
      console.warn(`ExecutableTask with id "${taskId}" is already in the "${to}" state.`);
      return false;
    }

    return true;
  }

  /**
   * TODO: update docs
   */
  public addTask(task: ExecutableTask) {
    if (!this.validTransition(task.id, null, "pending")) {
      return;
    }

    this.tasks.push(task);
    this.pending.set(task.id, task);

    this.emit("transition", { to: "pending", task });
  }

  /**
   *
   * TODO: update docs
   *
   *
   * Adds tasks to the `pending` collection of the {@link FlowController}.
   *
   * @param tasks - Tasks to add to the controller.
   */
  public addTasks(...tasks: ExecutableTask[]) {
    for (const task of tasks) {
      this.addTask(task);
    }
  }

  /**
   * Moves the next task from the `pending` collection to the `active` collection.
   *
   * @returns The task that was started, or `null` if no tasks are pending.
   */
  public startNext() {
    if (!this.hasPending) {
      return null;
    }

    const nextTask = this.pending.entries().next().value;
    if (isUndefined(nextTask)) {
      return null;
    }

    this.pending.delete(nextTask[0]);
    this.active.set(nextTask[1].id, nextTask[1]);

    this.emit("transition", { from: "pending", to: "active", task: nextTask[1] });

    return nextTask[1];
  }

  /**
   * Moves all tasks from the `pending` collection to the `active` collection and executes a callback for each task.
   *
   * @param callback - Function to execute for each task that is started.
   */
  public startAll(callback: (task: ExecutableTask) => void) {
    const pendingTasks = Array.from(this.pending.values());
    const completeIds: string[] = [];

    for (const task of pendingTasks) {
      this.pending.delete(task.id);
      this.active.set(task.id, task);
      completeIds.push(task.id);

      this.emit("transition", { from: "pending", to: "active", task });

      callback(task);
    }

    return () => {
      this.complete(...completeIds);
    };
  }

  /**
   * Moves tasks from the `active` collection to the `completed` collection.
   *
   * @param taskIds - IDs of the tasks to mark as completed.
   */
  public complete(...taskIds: string[]) {
    for (const taskId of taskIds) {
      if (!this.validTransition(taskId, "active", "completed")) {
        continue;
      }

      const task = this.active.get(taskId);
      if (!task) {
        console.warn(`ExecutableTask with id "${taskId}" not found in active tasks.`);
        continue;
      }

      this.active.delete(taskId);
      this.completed.set(taskId, task);

      this.emit("transition", { from: "active", to: "completed", task });
    }
  }

  /**
   * TODO: Update docs
   */
  public reset() {
    const tmp = [...this.tasks];
    this.tasks = [];

    this.pending.clear();
    this.active.clear();
    this.completed.clear();

    return tmp;
  }

  // TODO: Update docs
  public clearQueue() {
    if (!this.pending.size) {
      return console.warn("Empty queue.");
    }

    const pendingTasks = Array.from(this.pending.values());
    this.pending.clear();

    this.tasks = this.tasks.filter((task) => {
      return pendingTasks.findIndex(({ id }) => id === task.id) > -1;
    });

    for (const task of pendingTasks) {
      this.emit("transition", { from: "pending", task });
    }
  }

  public calculateProgress(errorSuccess?: boolean) {
    let progressSum = 0;

    const activeTasks = this.active.values();
    for (const task of activeTasks) {
      if (task.isStatus("error") && errorSuccess) {
        progressSum += 1;
      } else {
        progressSum += task.progress;
      }
    }

    const completedTasks = this.completed.values();
    for (const task of completedTasks) {
      if (task.isStatus("error") && errorSuccess) {
        progressSum += 1;
      } else {
        progressSum += task.progress;
      }
    }

    return progressSum / this.tasks.length;
  }
}
