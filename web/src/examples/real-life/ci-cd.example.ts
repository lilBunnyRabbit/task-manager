import { createTask, createTaskGroup, TaskManager, TaskManagerFlag } from "@lilbunnyrabbit/task-manager";
import { sleep } from "../utils";

const buildTask = createTask<{ name: string }, () => string>({
  name: "Build Code",

  parse() {
    switch (this.status) {
      default:
      case "idle": {
        return {
          status: "Waiting to build...",
        };
      }
      case "in-progress": {
        return {
          status: `Building "${this.data.name}"...`,
        };
      }
      case "error": {
        return {
          status: `Failed to build "${this.data.name}"!`,
        };
      }
      case "success": {
        return {
          status: `Build ${this.data.name}!`,
        };
      }
    }
  },

  async execute({ name }) {
    this.logger.info(`Building ${name}`);

    await sleep(500);

    return () => name;
  },
});

const testTask = createTask<(data: unknown) => boolean, boolean>({
  name: "Run Test",

  async execute(check) {
    console.log(this);

    const fn = this.query.parent.orElseThrow(Error).getLastResult(buildTask);

    this.logger.info(`Testing "${fn}"...`);
    await sleep(250);

    return check(fn());
  },
});

const testsGroup = createTaskGroup({
  name: "Run Tests",

  tasks() {
    return Array(5)
      .fill(0)
      .map(() =>
        testTask((data) => {
          if (typeof data !== "string") {
            throw new Error(`Invalid return type. Expected "string" got "${data}"`);
          }

          if (Math.random() < 0.1) {
            throw new Error("Random Error...");
          }

          return true;
        })
      );
  },
});

const deployTask = createTask<void, void>({
  name: "Deploy Code",

  async execute() {
    console.log(this);

    this.query.get(testsGroup).query.getLastResult(testTask);
    await sleep(250);
    this.logger.info("Confirmed that tests passed!");
    this.logger.info("Deploying...");
    await sleep(250);
  },
});

export default function () {
  const manager = new TaskManager()
    .addFlag(TaskManagerFlag.CONTINUE_ON_ERROR)
    .addTasks(buildTask({ name: "example.ts" }), testsGroup(), deployTask());

  return manager;
}
