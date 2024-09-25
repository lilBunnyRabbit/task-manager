import { createTask } from "@lilbunnyrabbit/task-manager";
import createObjectTask from "./create.task";
import sumObjectsTask from "./sum.task";

export default createTask<void, number>({
  name: "Average Objects",

  async execute() {
    const tasks = this.manager.findTasks(createObjectTask);

    const sum = this.manager.getLastTaskResult(sumObjectsTask);

    return sum / tasks.length;
  },
});
