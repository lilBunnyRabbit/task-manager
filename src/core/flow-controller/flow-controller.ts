import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import { isNullable, isUndefined } from "@lilbunnyrabbit/utils";
import type { ExecutableTask } from "../../common";
import type { FlowControllerEvents, FlowState } from "./flow-controller.type";

/**
 * Manages task execution flow by organizing tasks into states (`pending`, `active`, and `completed`).
 *
 * These states are part of the {@link FlowController} structure and do not belong to the tasks themselves.
 */
export class FlowController extends EventEmitter<FlowControllerEvents> {
  /**
   * Internal list of all tasks managed by the controller.
   */
  private _tasks: ExecutableTask[] = [];

  /**
   * All tasks managed by the controller.
   */
  public get tasks() {
    return this._tasks;
  }

  private set tasks(tasks: ExecutableTask[]) {
    this._tasks = tasks;
  }

  /**
   * Tasks ready to start but not yet executed.
   */
  readonly pending: Map<string, ExecutableTask> = new Map();

  /**
   * Tasks currently in progress.
   */
  readonly active: Map<string, ExecutableTask> = new Map();

  /**
   * Tasks that have completed execution.
   */
  readonly completed: Map<string, { task: ExecutableTask; valid: boolean }> = new Map();

  /**
   * Checks if there are tasks in the `pending` collection.
   */
  public get hasPending() {
    return this.pending.size > 0;
  }

  /**
   * Validates whether a task can transition between states.
   *
   * @param taskId - ID of the task to validate.
   * @param from - Current state (optional).
   * @param to - Target state (optional).
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
   * Adds a single task to the `pending` collection.
   *
   * @param task - Task to add.
   * @emits transition - Task transitions to the `pending` state.
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
   * Adds multiple tasks to the `pending` collection.
   *
   * @param tasks - Tasks to add.
   * @emits transition - For each task added, emits a transition to the `pending` state.
   */
  public addTasks(...tasks: ExecutableTask[]) {
    for (const task of tasks) {
      this.addTask(task);
    }
  }

  /**
   * Moves the next task from `pending` to `active`.
   *
   * @returns The task that was started, or `null` if no tasks are pending.
   * @emits transition - Task transitions from `pending` to `active`.
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
   * Moves all tasks from `pending` to `active` and executes a callback for each task.
   *
   * @param callback - Function to execute for each task.
   * @emits transition - For each task, emits a transition from `pending` to `active`.
   * @returns A cleanup function to mark tasks as completed.
   *          The cleanup function accepts an optional `validityCheck` callback, which determines
   *          if each task should be marked as valid. The `validityCheck` is called for each task
   *          and should return `true` for valid tasks and `false` otherwise.
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

    return (validityCheck?: (task: ExecutableTask) => boolean) => {
      this.complete(completeIds, validityCheck);
    };
  }

  /**
   * Moves tasks from `active` to `completed`.
   *
   * @param taskId - ID/s of task/s to complete.
   * @param validityCheck - An optional callback to determine if the task is valid.
   * @emits transition - For each task, emits a transition from `active` to `completed`.
   */
  public complete(taskId: string | string[], validityCheck?: (task: ExecutableTask) => boolean) {
    const taskIds = Array.isArray(taskId) ? taskId : [taskId];

    for (const taskId of taskIds) {
      if (!this.validTransition(taskId, "active", "completed")) {
        continue;
      }

      const task = this.active.get(taskId);
      if (!task) {
        console.warn(`ExecutableTask with id "${taskId}" not found in active tasks.`);
        continue;
      }

      const isValid = validityCheck ? validityCheck(task) : true;

      this.active.delete(taskId);
      this.completed.set(taskId, { task, valid: isValid });

      this.emit("transition", { from: "active", to: "completed", task });
    }
  }

  /**
   * Resets the flow controller, clearing all states.
   *
   * @returns Array of tasks before the reset.
   */
  public reset() {
    const tmp = [...this.tasks];
    this.tasks = [];

    this.pending.clear();
    this.active.clear();
    this.completed.clear();

    return tmp;
  }

  /**
   * Clears the `pending` collection.
   *
   * @emits transition - For each cleared task, emits a transition from `pending`.
   */
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

  /**
   * Calculates the progress of tasks.
   *
   * @param errorSuccess - Whether tasks with errors should count as fully progressed.
   * @returns Progress as a number between 0 and 1.
   */
  public calculateProgress(errorSuccess?: boolean) {
    let progressSum = 0;

    const activeTasks = this.active.values();
    for (const task of activeTasks) {
      progressSum += task.progress;
    }

    const completedTasks = this.completed.values();
    for (const { task, valid } of completedTasks) {
      if (errorSuccess && !valid) {
        progressSum += 1;
      } else {
        progressSum += task.progress;
      }
    }

    return progressSum / this.tasks.length;
  }
}
