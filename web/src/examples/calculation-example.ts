import { createTask, createTaskGroup, TaskManager } from "@lilbunnyrabbit/task-manager";
import { sleep } from "../utils/dummy.util";

const createNumberTask = createTask<Record<"min" | "max", number>, number>({
  name: "Create Random Number",

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
  name: "Create Random Numbers",

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
  name: "Sum Objects",

  async execute() {
    const values = this.query.get(createNumbersGroup).query.getResults(createNumberTask);

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
  name: "Average Objects",

  async execute() {
    const tasks = this.query.get(createNumbersGroup).query.getAll(createNumberTask);
    const sum = this.query.getLastResult(sumTask);

    this.logger.info(`Found ${tasks.length} ${createNumberTask} in ${createNumbersGroup}.`);
    this.logger.info(`Sum of them was ${sum}.`);

    this.setProgress(0.5);
    await sleep(500);

    return sum / tasks.length;
  },
});

const calculationGruoup = createTaskGroup({
  name: "Objects Calculation Group",

  create(min: number, max: number) {
    return [createNumbersGroup(min, max), sumTask(), averageObjectsTask()];
  },
});

const helloTask = createTask<void, string>({
  name: "Hello!",

  async execute() {
    this.logger.debug("Debug....");
    this.logger.info("Info....");
    this.logger.warn("Warn....");
    this.logger.error("Error....");

    await sleep(500);

    return `Hello!
This is an example task to showcase how it all works!
The groups were created with the following code:
\`\`\`ts
  manager.addTasks([
    objectsCalculationGroup([1, 2, 3]),
    objectsCalculationGroup([4, 5, 6]),
    objectsCalculationGroup([7, 8, 9]),
  ]);
\`\`\`

Enjoy!
    `;
  },
});

const summaryTask = createTask<void, string>({
  name: "Summary",

  async execute() {
    const groups = this.query.getAll(calculationGruoup);

    await sleep(500);

    return `Summary:
\t- ${groups.length} "${calculationGruoup.taskGroupName}" groups.

Groups:
${groups
  .map((group, i) => {
    const sum = group.query.getResult(sumTask);
    const avg = group.query.getResult(averageObjectsTask);

    return `\t${i + 1}. ${group.name}: SUM = ${sum}, AVG = ${avg}`;
  })
  .join("\n")}
`;
  },
});

export default function () {
  const manager = new TaskManager();

  manager.addTasks(
    helloTask(),
    calculationGruoup(1, 9),
    calculationGruoup(1, 9),
    calculationGruoup(1, 9),
    summaryTask()
  );

  return manager;
}
