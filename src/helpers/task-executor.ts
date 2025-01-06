import { TaskManager } from "../task-manager";

export class TaskExecutor<TParsed> {
  constructor(readonly manager: TaskManager<TParsed>) {}

  public async execute() {

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
    const task = this.manager.queue.shift();
    if (!task) return;

    this.manager.tasks.push(task);

    this.manager.emit("task", task).emit("change");

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
  private async executeParallel(failOnError?: boolean) {
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

    if (failOnError) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }
}
