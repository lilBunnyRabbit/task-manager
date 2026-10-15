import { Task, TaskManager, TaskGroup } from "./index.js";

describe("general", () => {
  test("can import classes", () => {
    expect(Task).toBeDefined();
    expect(TaskManager).toBeDefined();
    expect(TaskGroup).toBeDefined();
  });
});
