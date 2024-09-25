import { createTask, Task, TaskManager } from "@lilbunnyrabbit/task-manager";

// 1. Define a simple task
const simpleTask = createTask<void, string>({
  name: "Simple Task",
  async execute() {
    return "Task completed!";
  },
});

// 2. Create a TaskManager and run the task
const manager = new TaskManager();

const task = simpleTask();

// 3. Listen to task events
// Emits when anything about the task changes (status, progress, etc.).
task.on("change", function (this: Task<void, string, Error>) {
  console.log("Task changed!", this);
});

// Emits when task progress is updated.
task.on("progress", function (this: Task<void, string, Error>, progress: number) {
  console.log(`${progress * 100}% of the task done!`);
});

// 4. Add task to the manager
manager.addTasks([task]);

// 5. Listen to manager events
// Emits when any state (status, progress, or flags) of the manager changes.
manager.on("change", function (this: TaskManager) {
  console.log("Something changed!", this);
});

// Emits when a new task is in progress.
manager.on("task", function (this: TaskManager, task: Task) {
  console.log("New task in progress!", task);
});

// Emits when task progress is updated.
manager.on("progress", function (this: TaskManager, progress: number) {
  console.log(`${progress * 100}% of task's done!`);
});

// Emits when a task fails and `FAIL_ON_ERROR` flag is set.
manager.on("fail", function (this: TaskManager, error: any) {
  console.error("Task failed...", error);
});

// Emits when all tasks in the queue are executed successfully.
manager.on("success", function (this: TaskManager) {
  console.log("All tasks completed!", this.queue);
});

// 6. Start the manager
manager.start().then(() => {
  console.log("All tasks completed!");
});
