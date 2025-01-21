import { createTask, createTaskGroup, TaskManager } from "@lilbunnyrabbit/task-manager";
import { sleep } from "../utils/dummy.util";

const createNumberTask = createTask<Record<"min" | "max", number>, number>({
  name: "Generate Number",

  parse() {
    switch (this.status) {
      case "idle":
        return {
          status: "Waiting to create object...",
        };
      case "in-progress":
        return {
          status: "Creating object...",
        };
      case "error":
        return {
          status: "Failed to create object!",
        };
      case "success": {
        if (this.result.isPresent()) {
          const value = this.result.get();

          return {
            status: "Object created!",
            result: JSON.stringify(
              {
                input: this.data,
                output: value,
              },
              null,
              2
            ),
          };
        }

        return {
          status: "Object created! With no result???",
        };
      }
    }
  },

  async execute({ min, max }) {
    this.logger.info(`Creating random value between ${min} and ${max}.`);

    await sleep(500);

    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  },
});

const createNumbersGroup = createTaskGroup({
  name: "Generate Numbers",

  mode: "parallel",

  create(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    const count = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);

    return Array(count)
      .fill(0)
      .map(() => {
        return createNumberTask({ min: 0, max: 1000 });
      });
  },
});

const sumTask = createTask<void, number>({
  name: "Calculate Sum",

  async execute() {
    const values = this.query.getAll(createNumbersGroup).flatMap((g) => g.query.getResults(createNumberTask));

    if (!values.length) {
      throw new Error(`Requires at least one task by ${createNumberTask} in ${createNumbersGroup}`);
    }

    let sum = 0;

    for (let i = 0; i < values.length; i++) {
      await sleep(250);

      sum += values[i];
      this.logger.info(`Adding value ${values[i]} to the sum.`);
      this.setProgress(i / values.length);
    }

    this.logger.info("Completed adding values.");

    return sum;
  },
});

const averageObjectsTask = createTask<void, number>({
  name: "Calculate Average",

  async execute() {
    const tasks = this.query.getAll(createNumbersGroup).flatMap((g) => g.query.getAll(createNumberTask));
    const sum = this.query.getLastResult(sumTask);

    this.logger.info(`Found ${tasks.length} ${createNumberTask} in ${createNumbersGroup}.`);
    this.logger.info(`Sum of them was ${sum}.`);

    this.setProgress(0.5);
    await sleep(500);

    return sum / tasks.length;
  },
});

export default function () {
  const manager = new TaskManager();

  manager.addTasks(
    createNumbersGroup(2, 5),
    sumTask(),
    averageObjectsTask(),
    createNumbersGroup(2, 5),
    sumTask(),
    averageObjectsTask()
  );

  return manager;
}
