import { createTask, createTaskGroup, TaskGroupFlag, TaskManager } from "@lilbunnyrabbit/task-manager";
import { randomInt, sleep } from "../utils";

const randomNumberTask = createTask<number, number>({
  name: "Random Number",
  async execute(index: number) {
    await sleep(250);

    if ([0, 2, 4].includes(index)) {
      throw new Error(`Index is equal to ${index}`);
    }

    return randomInt(0, 100);
  },
});

const randomNumbersGroup = createTaskGroup({
  name: "Random Numbers",
  flags: [TaskGroupFlag.CONTINUE_ON_ERROR],

  tasks(count: number) {
    return Array(count)
      .fill(0)
      .map((_, i) => randomNumberTask(i));
  },
});

const findFirstTask = createTask<void, string>({
  name: "Find First",
  async execute() {
    const group = this.query.get(randomNumbersGroup);
    this.logger.info(`Group:\n\t${group}\n`);

    const findTask = group.query.find(randomNumberTask);
    if (findTask) {
      this.logger.info(`Find Task:\n\t${findTask}\n\t- Result: ${findTask.result}`);
    } else {
      this.logger.warn("First task not found...");
    }

    const getTask = group.query.get(randomNumberTask);
    this.logger.info(`Get Task:\n\t${getTask}\n\t- Result: ${getTask.result}`);

    const getResult = group.query.getResult(randomNumberTask);
    this.logger.info(`Get Result: ${getResult}`);

    return `First task result: ${getResult}`;
  },
});

const findLastTask = createTask<void, string>({
  name: "Find Last",
  async execute() {
    const group = this.query.get(randomNumbersGroup);
    this.logger.info(`Group:\n\t${group}\n`);

    const findLastTask = group.query.findLast(randomNumberTask);
    if (findLastTask) {
      this.logger.info(`Find Last Task:\n\t${findLastTask}\n\t- Result: ${findLastTask.result}`);
    } else {
      this.logger.warn("Last task not found...");
    }

    const getLastTask = group.query.getLast(randomNumberTask);
    this.logger.info(`Get Last Task:\n\t${getLastTask}\n\t- Result: ${getLastTask.result}`);

    const getLastResult = group.query.getLastResult(randomNumberTask);
    this.logger.info(`Get Last Result: ${getLastResult}`);

    return `Last task result: ${getLastResult}`;
  },
});

const findAllTask = createTask<void, string>({
  name: "Find All",
  async execute() {
    const group = this.query.get(randomNumbersGroup);
    this.logger.info(`Group:\n\t${group}\n`);

    const getAllTasks = group.query.getAll(randomNumberTask);
    this.logger.info(
      `Get All Tasks:\n\t${getAllTasks.map((task) => `${task}\n\t- Result: ${task.result}`).join("\n\t")}`
    );

    const getResults = group.query.getResults(randomNumberTask);
    this.logger.info(`Get All Results: ${getResults.join(", ")}`);

    return `All tasks results: ${getResults.join(", ")}`;
  },
});

export default function () {
  const taskManager = new TaskManager();

  taskManager.addTask(randomNumbersGroup(5));

  taskManager.addTasks(findFirstTask(), findLastTask(), findAllTask());

  return taskManager;
}
