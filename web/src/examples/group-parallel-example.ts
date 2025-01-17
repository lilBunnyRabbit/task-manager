import { createTask, createTaskGroup, ExecutionMode, TaskGroupFlag, TaskManager } from "@lilbunnyrabbit/task-manager";
import { randomInt, sleep } from "../utils/dummy.util";

const getUserTask = createTask<{ id: number }, { id: number; username: string; email: string }>({
  name: "Get User",

  parse() {
    switch (this.status) {
      case "idle":
        return {
          status: "Waiting to fetch user...",
        };
      case "in-progress":
        return {
          status: "Fetching user...",
        };
      case "error":
        return {
          status: "Failed to fetch user!",
        };
      case "success": {
        if (this.result.isPresent()) {
          const value = this.result.get();

          return {
            status: "User fetched!",
            result: JSON.stringify(value, null, 2),
          };
        }

        return {
          status: "User Fetched! With no result???",
        };
      }
    }
  },

  async execute({ id }) {
    this.logger.info(`Fetching user with id "${id}".`);

    await sleep(randomInt(250, 2500));

    if (id === 6) {
      throw new Error("User not found.");
    }

    return {
      id,
      username: `user-${id}`,
      email: `user-${id}@example.com`,
    };
  },
});

const getUsersGroup = createTaskGroup({
  name: "Get Users",

  mode: ExecutionMode.PARALLEL,
  flags: [TaskGroupFlag.CONTINUE_ON_ERROR],

  create(count: number) {
    return Array(count)
      .fill(0)
      .map((_, i) => getUserTask({ id: i }));
  },
});

const infoTask = createTask<void, string>({
  name: "Info",

  execute() {
    const tasks = this.query.get(getUsersGroup).query.getAll(getUserTask);

    const results: string[] = [];

    for (const task of tasks) {
      if (task.result.isPresent()) {
        results.push(`User #${task.id}: ${JSON.stringify(task.result.get())}`);
      } else {
        results.push(`User #${task.id}: No result...`);
      }
    }

    return results.join("\n");
  },
});

export default function () {
  const manager = new TaskManager();

  manager.addTasks(getUsersGroup(10), infoTask());

  return manager;
}
