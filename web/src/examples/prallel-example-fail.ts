import { createTask, ExecutionMode, TaskManager } from "@package/index";
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

export default function () {
  const manager = new TaskManager();

  manager.addTasks(
    Array(10)
      .fill(0)
      .map((_, i) => getUserTask({ id: i }))
  );

  manager.setMode(ExecutionMode.PARALLEL);

  return manager;
}
