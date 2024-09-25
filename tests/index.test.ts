import { Task, TaskManager, createTask } from "../src";

describe("index module", () => {
  test("can create Task", () => {
    const taskBuilder = createTask({ name: "Task", execute() {} });

    expect(taskBuilder.taskName).toBe("Task");

    const task = taskBuilder();

    expect(task).toBeInstanceOf(Task);
    expect(task.name).toBe("Task");
  });

  test("can create TaskManager", () => {
    const manager = new TaskManager();

    expect(manager).toBeInstanceOf(TaskManager);
  });
});
