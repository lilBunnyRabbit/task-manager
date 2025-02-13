import { createTask, createTaskGroup, TaskManager } from "@lilbunnyrabbit/task-manager";
import { randomInt, sleep } from "../utils";

const simpleTask = createTask<string, string>({
  name: "Simple Task",

  parse() {
    switch (this.status) {
      case "idle":
        return {
          status: "Task is idle.",
        };
      case "in-progress":
        return {
          status: "Task is in-progress...",
        };
      case "error":
        return {
          status: "Task failed!",
        };
      case "success": {
        if (this.result.isPresent()) {
          const value = this.result.get();

          return {
            status: "Task succeeded!",
            result: `Input: ${JSON.stringify(this.data, null, 2)}
Output: ${JSON.stringify(value, null, 2)}`,
          };
        }

        return {
          status: "Task succeeded! No result?",
        };
      }
    }
  },

  async execute(value) {
    this.logger.info(`Starting task with input: "${value}"`);

    await sleep(randomInt(250, 750));
    this.setProgress(1 / 4);

    this.logger.warn("Whoops! This is taking longer than expected...");

    await sleep(randomInt(250, 750));
    this.setProgress(2 / 4);

    this.logger.debug("Such a simple task is taking too long... I need to debug...");

    await sleep(randomInt(250, 750));
    this.setProgress(3 / 4);

    this.logger.error("Failed to calculate response... Returning default value...");

    return "Hello to you too!";
  },
});

const simpleGroup = createTaskGroup({
  name: "Simple Group",

  tasks(values: string[]) {
    return values.map((v) => simpleTask(v));
  },
});

export default function () {
  return new TaskManager().addTask(simpleGroup(["Hello World!", "Hello?", "Goodbye World!"]));
}
