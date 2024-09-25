import { createTask, Task, TaskManager, TaskManagerFlag } from "@lilbunnyrabbit/task-manager";

const downloadTask = createTask<string, Blob>({
  name: "Download Task",

  async execute(url) {
    return await fetch(url).then((res) => res.blob());
  },
});

const manager = new TaskManager();

manager.addTasks([downloadTask("url-1"), downloadTask("url-2"), downloadTask("url-3")]);

manager.on("task", function (this: TaskManager, task: Task) {
  task.on("change", () => {
    console.log(`${task} changed`);
  });
});

// Tasks will be executed in parallel
manager.addFlag(TaskManagerFlag.PARALLEL_EXECUTION);

// Execution will continue even if the task fails
manager.removeFlag(TaskManagerFlag.FAIL_ON_ERROR);

manager.start();
