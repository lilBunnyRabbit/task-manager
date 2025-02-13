import {
  createTask,
  createTaskGroup,
  ExecutionMode,
  TaskGroupFlag,
  TaskManager,
  TaskManagerFlag,
} from "@lilbunnyrabbit/task-manager";
import { randomSleep } from "../utils";

const clientTask = createTask<
  void,
  {
    has: (url: string) => boolean;
    get: (url: string) => string | undefined;
    set: (url: string, body: string) => void;
    delete: (url: string) => boolean;
  }
>({
  name: "Create Client",

  parse() {
    if (this.isStatus("success") && this.result.isPresent()) {
      return {
        result: `Map<string, string>`,
      };
    }
  },

  execute() {
    const map = new Map<string, string>();
    const logger = this.logger;

    return {
      has(url: string) {
        const result = map.has(url);
        logger.info(`[HAS] ${url} ${result}`);
        return result;
      },
      get(url: string) {
        const result = map.get(url);
        logger.info(`[GET] ${url} ${result}`);
        return result;
      },
      set(url: string, body: string) {
        map.set(url, body);
        logger.info(`[SET] ${url} ${body}`);
        logger.debug(
          `Map {
${Array.from(map.entries())
  .map(([url, value]) => `\t${url}: ${value}`)
  .join("\n")}
}`
        );
      },
      delete(url: string) {
        const result = map.delete(url);
        logger.info(`[DELETE] ${url} ${result}`);
        logger.debug(
          `Map {
${Array.from(map.entries())
  .map(([url, value]) => `\t${url}: ${value}`)
  .join("\n")}
}`
        );
        return result;
      },
    };
  },
});

const getTask = createTask<{ url: string }, string>({
  name: "GET",

  async execute({ url }) {
    const client = this.query.parent.orElseThrow().getResult(clientTask);

    this.logger.info(`GET ${url}`);
    await randomSleep(150, 500);

    if (!client.has(url)) {
      throw new Error("404 Not found");
    }

    return client.get(url)!;
  },
});

const postTask = createTask<{ url: string; body: string }, string>({
  name: "POST",

  async execute({ url, body }) {
    const client = this.query.parent.orElseThrow().getResult(clientTask);

    this.logger.info(`POST ${url} ${body}`);
    await randomSleep(150, 500);

    if (client.has(url)) {
      throw new Error("400 Bad Request");
    }

    client.set(url, body);

    return client.get(url)!;
  },
});

const deleteTask = createTask<{ url: string }, boolean>({
  name: "DELETE",

  async execute({ url }) {
    const client = this.query.parent.orElseThrow().getResult(clientTask);

    this.logger.info(`DELETE ${url}`);
    await randomSleep(150, 500);

    if (!client.has(url)) {
      throw new Error("404 Not found");
    }

    return client.delete(url)!;
  },
});

const sequentialGroup = createTaskGroup({
  name: "Sequential",

  mode: ExecutionMode.SEQUENTIAL,
  flags: [TaskGroupFlag.CONTINUE_ON_ERROR],

  tasks(
    requests: Array<
      { type: "GET"; url: string } | { type: "POST"; url: string; body: string } | { type: "DELETE"; url: string }
    >
  ) {
    return requests.map((request) => {
      switch (request.type) {
        case "GET": {
          return getTask({ url: request.url });
        }

        case "POST": {
          return postTask({ url: request.url, body: request.body });
        }

        case "DELETE": {
          return deleteTask({ url: request.url });
        }
      }
    });
  },
});

const parallelGroup = createTaskGroup({
  name: "Parallel",

  mode: ExecutionMode.PARALLEL,
  flags: [TaskGroupFlag.CONTINUE_ON_ERROR],

  tasks(
    requests: Array<
      { type: "GET"; url: string } | { type: "POST"; url: string; body: string } | { type: "DELETE"; url: string }
    >
  ) {
    return requests.map((request) => {
      switch (request.type) {
        case "GET": {
          return getTask({ url: request.url });
        }

        case "POST": {
          return postTask({ url: request.url, body: request.body });
        }

        case "DELETE": {
          return deleteTask({ url: request.url });
        }
      }
    });
  },
});

export default function () {
  const manager = new TaskManager().addFlag(TaskManagerFlag.CONTINUE_ON_ERROR);

  manager.addTasks(
    clientTask(),
    parallelGroup([
      { type: "POST", url: "/dummy/1", body: JSON.stringify({ id: 1 }) },
      { type: "POST", url: "/dummy/2", body: JSON.stringify({ id: 2 }) },
      { type: "POST", url: "/dummy/3", body: JSON.stringify({ id: 3 }) },
    ]),
    sequentialGroup([
      { type: "POST", url: "/dummy/123", body: JSON.stringify({ id: 123 }) },
      { type: "GET", url: "/dummy/123" },
      { type: "DELETE", url: "/dummy/123" },
    ]),
    parallelGroup([
      { type: "GET", url: "/dummy/1" },
      { type: "GET", url: "/dummy/2" },
      { type: "GET", url: "/dummy/3" },
      { type: "GET", url: "/dummy/4" },
      { type: "GET", url: "/dummy/5" },
    ])
  );

  return manager;
}
