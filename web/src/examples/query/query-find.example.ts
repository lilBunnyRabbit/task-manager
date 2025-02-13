import { createTask, TaskManager } from "@lilbunnyrabbit/task-manager";
import { randomInt, sleep } from "../utils";

const randomNumberTask = createTask<void, number>({
  name: "Random Number",
  async execute() {
    await sleep(250);
    return randomInt(0, 100);
  },
});

const findFirstTask = createTask<void, string>({
  name: "Find First",
  async execute() {
    const findTask = this.query.find(randomNumberTask);
    if (findTask) {
      this.logger.info(`Find Task:\n\t${findTask}\n\t- Result: ${findTask.result}`);
    } else {
      this.logger.warn("First task not found...");
    }

    const getTask = this.query.get(randomNumberTask);
    this.logger.info(`Get Task:\n\t${getTask}\n\t- Result: ${getTask.result}`);

    const getResult = this.query.getResult(randomNumberTask);
    this.logger.info(`Get Result: ${getResult}`);

    return `First task result: ${getResult}`;
  },
});

const findLastTask = createTask<void, string>({
  name: "Find Last",
  async execute() {
    const findLastTask = this.query.findLast(randomNumberTask);
    if (findLastTask) {
      this.logger.info(`Find Last Task:\n\t${findLastTask}\n\t- Result: ${findLastTask.result}`);
    } else {
      this.logger.warn("Last task not found...");
    }

    const getLastTask = this.query.getLast(randomNumberTask);
    this.logger.info(`Get Last Task:\n\t${getLastTask}\n\t- Result: ${getLastTask.result}`);

    const getLastResult = this.query.getLastResult(randomNumberTask);
    this.logger.info(`Get Last Result: ${getLastResult}`);

    return `Last task result: ${getLastResult}`;
  },
});

const findAllTask = createTask<void, string>({
  name: "Find All",
  async execute() {
    const getAllTasks = this.query.getAll(randomNumberTask);
    this.logger.info(
      `Get All Tasks:\n\t${getAllTasks.map((task) => `${task}\n\t- Result: ${task.result}`).join("\n\t")}`
    );

    const getResults = this.query.getResults(randomNumberTask);
    this.logger.info(`Get All Results: ${getResults.join(", ")}`);

    return `All tasks results: ${getResults.join(", ")}`;
  },
});

export default function () {
  const taskManager = new TaskManager();

  taskManager.addTasks(
    ...Array(3)
      .fill(0)
      .map(() => randomNumberTask())
  );

  taskManager.addTasks(findFirstTask(), findLastTask(), findAllTask());

  return taskManager;
}
