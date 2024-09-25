import { createTask } from "@lilbunnyrabbit/task-manager";
import createObjectTask from "./create.task";

export default createTask<void, number>({
  name: "Sum Objects",

  async execute() {
    const objects: { value: number }[] = this.manager.getTasksResults(createObjectTask);

    if (!objects.length) {
      throw new Error(`Requires at least one task by ${createObjectTask}`);
    }

    let sum = 0;

    for (let i = 0; i < objects.length; i++) {
      sum += objects[i].value;

      this.setProgress(i / objects.length);
    }

    return sum;
  },
});
