import { Task, TaskManager } from "@lilbunnyrabbit/task-manager";

import createObjectTask from "./tasks/create.task";
import sumObjectsTask from "./tasks/sum.task";
import averageObjectsTask from "./tasks/average.task";

function createObjectsTasks(values: number[]): Task[] {
  return [
    ...values.map((value) => {
      return createObjectTask(value);
    }),
    sumObjectsTask(),
    averageObjectsTask(),
  ];
}

const manager = new TaskManager();

manager.addTasks(createObjectsTasks([1, 2, 3]));

manager.on("change", function () {
  console.log("Something Changed!", this);
});

manager.start();
