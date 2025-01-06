import { TaskManager } from "../task-manager";
import { ExecutionFlag } from "./task-executor.type";

export class TaskExecutor<TParsed> {
  constructor(readonly instance: TaskManager<TParsed>) {}

  async sequential() {
    const task = this.instance.queue.shift();
    if (!task) return;

    this.instance.tasks.push(task);

    // this.emit("task", task).emit("change");

    // task.on("progress", () => {
    //   this.setProgress(this.calculateProgress());
    // });

    return await task.execute();
  }

  async parallel() {
    const queueTasks = [...this.instance.queue];
    this.instance.queue = [];

    this.instance.tasks.push(...queueTasks);

    const executeTasks = () => {
      return queueTasks.map(async (task) => {
        // this.emit("task", task).emit("change");

        // task.on("progress", () => {
        //   this.setProgress(this.calculateProgress());
        // });

        try {
          await task.execute();
        } catch (error: any) {
          throw { task, error };
        }
      });
    };

    if (this.instance.hasFlag(ExecutionFlag.FAIL_ON_ERROR)) {
      return await Promise.all(executeTasks());
    }

    return await Promise.allSettled(executeTasks());
  }
}
